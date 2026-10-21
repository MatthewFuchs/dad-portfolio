import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";

// Where the admin panel reads and saves content.
//
// - GitHub (live site): every save is one commit to the repo's main branch
//   through the Git Data API, and Vercel redeploys. Reads come from GitHub too,
//   so the editor sees a save straight away, before the redeploy finishes.
// - Local (development): reads and writes the working copy on disk.
//
// Paths are repo-relative ("content/projects/x.json", "public/logos/x/logo.png").

export type Op =
  | { type: "write"; path: string; text: string } // a JSON file
  | { type: "upload"; path: string; id: string } // an uploaded file, by upload id
  | { type: "copy"; path: string; from: string } // an existing file moved to a new name
  | { type: "delete"; path: string };

export interface Store {
  kind: "local" | "github";
  /** Every file path under a folder (recursive). */
  listPaths(prefix: string): Promise<string[]>;
  readBytes(path: string): Promise<Buffer | null>;
  /** Keep an uploaded file until a save uses it; returns its id. */
  putUpload(bytes: Buffer): Promise<string>;
  getUpload(id: string): Promise<Buffer | null>;
  /** Apply all changes at once (one commit on GitHub). */
  commit(ops: Op[], message: string): Promise<void>;
}

export class StoreError extends Error {}

export async function readText(store: Store, p: string) {
  const b = await store.readBytes(p);
  return b ? b.toString("utf8") : null;
}

// ---------------------------------------------------------------- local

export function localStore(root = process.cwd(), tmp = path.join(os.tmpdir(), "fuchs-admin-uploads")): Store {
  const abs = (p: string) => {
    const full = path.resolve(root, p);
    if (!full.startsWith(path.resolve(root) + path.sep)) throw new StoreError(`Bad path: ${p}`);
    return full;
  };
  const walk = (dir: string): string[] =>
    !fs.existsSync(dir)
      ? []
      : fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
          const full = path.join(dir, d.name);
          return d.isDirectory() ? walk(full) : d.isFile() ? [full] : [];
        });
  const pruneEmpty = (dir: string) => {
    // Remove folders left empty by deletes, up to (not including) the root.
    while (dir.startsWith(path.resolve(root) + path.sep) && fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir);
      dir = path.dirname(dir);
    }
  };

  return {
    kind: "local",
    async listPaths(prefix) {
      return walk(abs(prefix))
        .map((f) => path.relative(root, f).split(path.sep).join("/"))
        .filter((p) => !path.basename(p).startsWith("."));
    },
    async readBytes(p) {
      try {
        return fs.readFileSync(abs(p));
      } catch {
        return null;
      }
    },
    async putUpload(bytes) {
      fs.mkdirSync(tmp, { recursive: true });
      const id = randomBytes(16).toString("hex");
      fs.writeFileSync(path.join(tmp, id), bytes);
      return id;
    },
    async getUpload(id) {
      if (!/^[0-9a-f]{32}$/.test(id)) return null;
      try {
        return fs.readFileSync(path.join(tmp, id));
      } catch {
        return null;
      }
    },
    async commit(ops) {
      // Read every source first: a copy may come from a file this save
      // overwrites or deletes (photos changing places, for example).
      const data = new Map<Op, Buffer | string>();
      for (const op of ops) {
        if (op.type === "write") data.set(op, op.text);
        if (op.type === "copy") data.set(op, fs.readFileSync(abs(op.from)));
        if (op.type === "upload") {
          const b = await this.getUpload(op.id);
          if (!b) throw new StoreError("An uploaded file has expired. Please add it again.");
          data.set(op, b);
        }
      }
      const written = new Set<string>();
      for (const op of ops) {
        if (op.type === "delete") continue;
        fs.mkdirSync(path.dirname(abs(op.path)), { recursive: true });
        fs.writeFileSync(abs(op.path), data.get(op)!);
        written.add(op.path);
      }
      for (const op of ops) {
        if (op.type !== "delete" || written.has(op.path)) continue;
        fs.rmSync(abs(op.path), { force: true });
        pruneEmpty(path.dirname(abs(op.path)));
      }
    },
  };
}

// ---------------------------------------------------------------- GitHub

type TreeEntry = { path: string; sha: string; type: string; mode: string };

// Blobs never change, so their contents can be kept between requests.
const blobCache = new Map<string, Buffer>();
const BLOB_CACHE_BYTES = 64 * 1024 * 1024;
let blobCacheBytes = 0;

export function githubStore(opts: {
  token: string;
  repo: string;
  branch: string;
  fetch?: typeof fetch;
}): Store {
  const doFetch = opts.fetch ?? fetch;
  const base = `https://api.github.com/repos/${opts.repo}`;

  async function api<T>(p: string, init?: { method?: string; body?: unknown }): Promise<T> {
    const res = await doFetch(base + p, {
      method: init?.method ?? "GET",
      headers: {
        Authorization: `Bearer ${opts.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      },
      body: init?.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new StoreError(`GitHub ${init?.method ?? "GET"} ${p}: ${res.status} ${text.slice(0, 200)}`);
      (err as StoreError & { status?: number }).status = res.status;
      throw err;
    }
    return res.json() as Promise<T>;
  }

  // The branch's latest commit and every file in it, fetched once per store
  // (a store lives for one request) and again before each commit attempt.
  let snapshot: Promise<{ commit: string; tree: string; files: Map<string, TreeEntry> }> | null = null;
  async function load() {
    const ref = await api<{ object: { sha: string } }>(`/git/ref/heads/${opts.branch}`);
    const commit = await api<{ tree: { sha: string } }>(`/git/commits/${ref.object.sha}`);
    const tree = await api<{ tree: TreeEntry[]; truncated: boolean }>(`/git/trees/${commit.tree.sha}?recursive=1`);
    if (tree.truncated) throw new StoreError("The repository is too large to read in one go.");
    const files = new Map(tree.tree.filter((e) => e.type === "blob").map((e) => [e.path, e]));
    return { commit: ref.object.sha, tree: commit.tree.sha, files };
  }
  const current = () => (snapshot ??= load().catch((e) => ((snapshot = null), Promise.reject(e))));

  async function blob(sha: string) {
    const hit = blobCache.get(sha);
    if (hit) return hit;
    const b = await api<{ content: string; encoding: string }>(`/git/blobs/${sha}`);
    const buf = Buffer.from(b.content, b.encoding === "base64" ? "base64" : "utf8");
    if (blobCacheBytes + buf.length > BLOB_CACHE_BYTES) {
      blobCache.clear();
      blobCacheBytes = 0;
    }
    blobCache.set(sha, buf);
    blobCacheBytes += buf.length;
    return buf;
  }

  return {
    kind: "github",
    async listPaths(prefix) {
      const dir = prefix.replace(/\/?$/, "/");
      return [...(await current()).files.keys()].filter((p) => p.startsWith(dir));
    },
    async readBytes(p) {
      const entry = (await current()).files.get(p);
      return entry ? blob(entry.sha) : null;
    },
    async putUpload(bytes) {
      // An unreferenced blob: it only becomes part of the site when a save
      // commits a tree that points at it.
      const res = await api<{ sha: string }>("/git/blobs", {
        method: "POST",
        body: { content: bytes.toString("base64"), encoding: "base64" },
      });
      return res.sha;
    },
    async getUpload(id) {
      if (!/^[0-9a-f]{40}$/.test(id)) return null;
      try {
        return await blob(id);
      } catch {
        return null;
      }
    },
    async commit(ops, message) {
      // Someone else may push between reading and updating the branch; then
      // the update is refused and we start again from the new commit.
      for (let attempt = 0; ; attempt++) {
        snapshot = null;
        const snap = await current();
        const written = new Set(ops.filter((o) => o.type !== "delete").map((o) => o.path));
        type Item = { path: string; mode: string; type: string; content?: string; sha?: string | null };
        const tree = ops.flatMap((op): Item[] => {
          const entry = { path: op.path, mode: "100644", type: "blob" };
          switch (op.type) {
            case "write":
              return [{ ...entry, content: op.text }];
            case "upload":
              return [{ ...entry, sha: op.id }];
            case "copy": {
              const from = snap.files.get(op.from);
              if (!from) throw new StoreError(`File not found: ${op.from}`);
              return [{ ...entry, sha: from.sha }];
            }
            case "delete":
              return snap.files.has(op.path) && !written.has(op.path) ? [{ ...entry, sha: null }] : [];
          }
        });
        const newTree = await api<{ sha: string }>("/git/trees", {
          method: "POST",
          body: { base_tree: snap.tree, tree },
        });
        const commit = await api<{ sha: string }>("/git/commits", {
          method: "POST",
          body: { message, tree: newTree.sha, parents: [snap.commit] },
        });
        try {
          await api(`/git/refs/heads/${opts.branch}`, { method: "PATCH", body: { sha: commit.sha, force: false } });
          snapshot = null;
          return;
        } catch (e) {
          if ((e as { status?: number }).status !== 422 || attempt >= 2) throw e;
        }
      }
    },
  };
}

// ---------------------------------------------------------------- choice

/** The store for this request, or null when saving isn't set up (the live
 *  site without a GitHub token: its own disk is read-only). */
export function getStore(): Store | null {
  const { GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH, VERCEL } = process.env;
  if (GITHUB_TOKEN && GITHUB_REPO) {
    return githubStore({ token: GITHUB_TOKEN, repo: GITHUB_REPO, branch: GITHUB_BRANCH || "main" });
  }
  // ADMIN_LOCAL_ROOT points local saves at a copy of the site (the e2e tests use one).
  return VERCEL ? null : localStore(process.env.ADMIN_LOCAL_ROOT || process.cwd());
}
