import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { signSession, verifySession } from '../lib/session';
import { hashPassword, verifyPassword, checkCredentials, lockedOut, recordFailure, clearFailures } from '../lib/auth';
import { slugify, uniqueSlug, saveEntry, deleteEntry, listEntries, ValidationError, toDraft } from '../lib/admin-content';
import { localStore, githubStore, type Store } from '../lib/admin-store';
import { uploadToken, readUploadToken, sniff, checkUpload } from '../lib/admin-uploads';

const SECRET = 'x'.repeat(40);
const JPG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 9]);
const PDF = Buffer.from('%PDF-1.7 test');

describe('session cookie', () => {
  it('accepts its own cookie and rejects tampered, expired or foreign ones', async () => {
    const now = Date.now();
    const token = await signSession({ email: 'greg@example.com', name: 'Greg' }, SECRET, now);
    expect((await verifySession(token, SECRET, now))?.name).toBe('Greg');

    const [body, sig] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ email: 'evil@example.com', name: 'x', exp: now + 1e9 })).toString('base64url');
    expect(await verifySession(`${forged}.${sig}`, SECRET, now)).toBeNull();
    expect(await verifySession(`${body}.${sig.slice(0, -2)}AA`, SECRET, now)).toBeNull();
    expect(await verifySession(token, 'y'.repeat(40), now)).toBeNull();
    expect(await verifySession(token, SECRET, now + 9 * 3600_000)).toBeNull(); // 8 h session
    expect(await verifySession(undefined, SECRET)).toBeNull();
    expect(await verifySession('garbage', SECRET)).toBeNull();
  });
});

describe('passwords and lock-out', () => {
  const env = process.env.ADMIN_USERS;
  afterEach(() => {
    process.env.ADMIN_USERS = env;
  });

  it('verifies scrypt hashes', async () => {
    const hash = await hashPassword('correct horse battery');
    expect(hash).toMatch(/^scrypt:16384:8:1:/);
    expect(hash).not.toContain('$'); // .env files would expand it
    expect(await verifyPassword('correct horse battery', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
    expect(await verifyPassword('x', 'not-a-hash')).toBe(false);
  });

  it('checks email (any case) and password against ADMIN_USERS', async () => {
    process.env.ADMIN_USERS = JSON.stringify([{ email: 'greg@example.com', name: 'Greg', hash: await hashPassword('secret-pass') }]);
    expect((await checkCredentials(' GREG@example.com ', 'secret-pass'))?.name).toBe('Greg');
    expect(await checkCredentials('greg@example.com', 'nope')).toBeNull();
    expect(await checkCredentials('someone@example.com', 'secret-pass')).toBeNull();
    process.env.ADMIN_USERS = 'not json';
    expect(await checkCredentials('greg@example.com', 'secret-pass')).toBeNull();
  });

  it('locks out after 5 failures in 15 minutes', () => {
    const keys = ['email:test-lock@example.com'];
    const t = Date.now();
    for (let i = 0; i < 4; i++) recordFailure(keys, t);
    expect(lockedOut(keys, t)).toBe(false);
    recordFailure(keys, t);
    expect(lockedOut(keys, t)).toBe(true);
    expect(lockedOut(keys, t + 16 * 60_000)).toBe(false);
    clearFailures(keys);
    expect(lockedOut(keys, t)).toBe(false);
  });
});

describe('web addresses', () => {
  it('are made from the name, lowercase with hyphens', () => {
    expect(slugify('Cloverdale Athletic Park Soccer Clubhouse')).toBe('cloverdale-athletic-park-soccer-clubhouse');
    expect(slugify('  Café Plaza, Phase 2!  ')).toBe('cafe-plaza-phase-2');
    expect(slugify('R&D Centre')).toBe('r-and-d-centre');
    expect(slugify('!!!')).toBe('item');
    expect(slugify('a'.repeat(100)).length).toBeLessThanOrEqual(60);
  });
  it('never clash with an existing one', () => {
    expect(uniqueSlug('The Linx', ['the-linx', 'the-linx-2'])).toBe('the-linx-3');
    expect(uniqueSlug('New', ['new'])).toBe('new-2');
  });
});

describe('uploads', () => {
  it('tokens only work when signed by this server', () => {
    const t = uploadToken('a'.repeat(32), 'jpg', SECRET);
    expect(readUploadToken(t, SECRET)).toEqual({ id: 'a'.repeat(32), ext: 'jpg' });
    expect(readUploadToken(t.replace('.jpg.', '.pdf.'), SECRET)).toBeNull();
    expect(readUploadToken(t, 'z'.repeat(40))).toBeNull();
    expect(readUploadToken('../../etc/passwd', SECRET)).toBeNull();
  });
  it('file type comes from the contents, not the name', () => {
    expect(sniff(JPG)).toBe('jpg');
    expect(sniff(PNG)).toBe('png');
    expect(sniff(PDF)).toBe('pdf');
    expect(sniff(Buffer.from('<svg>'))).toBeNull();
    expect(checkUpload(PDF, 'photo')).toHaveProperty('error');
    expect(checkUpload(JPG, 'pdf')).toHaveProperty('error');
    expect(checkUpload(JPG, 'photo')).toEqual({ ext: 'jpg' });
    expect(checkUpload(Buffer.concat([PDF, Buffer.alloc(26 * 1024 * 1024)]), 'pdf')).toHaveProperty('error');
  });
});

// A small site on disk: one manufacturer, one project with two photos, one presentation.
function seed(root: string) {
  const write = (p: string, data: string | Buffer) => {
    fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
    fs.writeFileSync(path.join(root, p), data);
  };
  write('content/manufacturers/acme.json', JSON.stringify({ name: 'Acme', website: 'https://acme.test', logo: '/logos/acme/logo.png', logoBackground: 'white', shortInfo: 'Anchors.', innovation: '', categories: ['Connections'], order: 10, resources: [{ title: 'Sheet', file: '/resources/acme/resources/0/file.pdf', type: 'Data Sheet' }] }));
  write('public/logos/acme/logo.png', PNG);
  write('public/resources/acme/resources/0/file.pdf', PDF);
  write('content/projects/bridge.json', JSON.stringify({ name: 'Bridge', focus: '', location: 'Surrey, BC', year: '2021', sectors: ['Civil'], manufacturers: ['acme'], hero: '/projects/bridge/hero.jpg', summary: 'A bridge.', gallery: [{ image: '/projects/bridge/gallery/0/image.jpg', caption: 'first' }, { image: '/projects/bridge/gallery/1/image.png', caption: 'second' }], tags: ['kept'], resources: [] }));
  write('public/projects/bridge/hero.jpg', JPG);
  write('public/projects/bridge/gallery/0/image.jpg', Buffer.from([...JPG, 0]));
  write('public/projects/bridge/gallery/1/image.png', PNG);
  write('content/presentations/talk.json', JSON.stringify({ title: 'Talk', subtitle: '', manufacturer: 'acme', blurb: 'About.', topics: [], banner: '/presentations/talk/banner.png', bannerFit: 'contain', order: 10 }));
  write('public/presentations/talk/banner.png', PNG);
}

describe('saving to disk (local mode)', () => {
  let root: string;
  let store: Store;
  const ctx = () => ({ store, secret: SECRET, who: 'Greg' });
  const read = (p: string) => fs.readFileSync(path.join(root, p));
  const exists = (p: string) => fs.existsSync(path.join(root, p));
  const json = (p: string) => JSON.parse(read(p).toString());

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'admin-'));
    seed(root);
    store = localStore(root, path.join(root, '.uploads'));
  });
  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  it('reorders photos: files follow their new positions, nothing is lost', async () => {
    const draft = toDraft('projects', json('content/projects/bridge.json'));
    draft.gallery.reverse();
    await saveEntry(ctx(), 'projects', 'bridge', draft);
    const saved = json('content/projects/bridge.json');
    expect(saved.gallery).toEqual([
      { image: '/projects/bridge/gallery/0/image.png', caption: 'second' },
      { image: '/projects/bridge/gallery/1/image.jpg', caption: 'first' },
    ]);
    expect(read('public/projects/bridge/gallery/0/image.png')).toEqual(PNG);
    expect(read('public/projects/bridge/gallery/1/image.jpg')).toEqual(Buffer.from([...JPG, 0]));
    expect(exists('public/projects/bridge/gallery/0/image.jpg')).toBe(false);
    expect(exists('public/projects/bridge/gallery/1/image.png')).toBe(false);
    expect(saved.tags).toEqual(['kept']); // fields the form doesn't show are kept
  });

  it('adds a project with uploaded photos at a web address made from its name', async () => {
    const hero = uploadToken(await store.putUpload(JPG), 'jpg', SECRET);
    const photo = uploadToken(await store.putUpload(PNG), 'png', SECRET);
    const id = await saveEntry(ctx(), 'projects', null, {
      ...toDraft('projects'),
      name: 'Bridge',
      location: 'Victoria, BC',
      year: '2025',
      summary: 'Another bridge.',
      manufacturers: ['acme', 'unknown'],
      hero: { upload: hero },
      gallery: [{ image: { upload: photo }, caption: '', stage: 'Done' }],
    });
    expect(id).toBe('bridge-2');
    const saved = json('content/projects/bridge-2.json');
    expect(saved.hero).toBe('/projects/bridge-2/hero.jpg');
    expect(saved.gallery).toEqual([{ image: '/projects/bridge-2/gallery/0/image.png', stage: 'Done' }]);
    expect(saved.manufacturers).toEqual(['acme']);
    expect(read('public/projects/bridge-2/hero.jpg')).toEqual(JPG);
  });

  it('removing a photo deletes its file; replacing the main photo with another type removes the old one', async () => {
    const draft = toDraft('projects', json('content/projects/bridge.json'));
    draft.gallery = draft.gallery.slice(1);
    draft.hero = { upload: uploadToken(await store.putUpload(PNG), 'png', SECRET) };
    await saveEntry(ctx(), 'projects', 'bridge', draft);
    expect(exists('public/projects/bridge/hero.jpg')).toBe(false);
    expect(read('public/projects/bridge/hero.png')).toEqual(PNG);
    expect(read('public/projects/bridge/gallery/0/image.png')).toEqual(PNG);
    expect(exists('public/projects/bridge/gallery/1')).toBe(false);
  });

  it('explains what is missing in plain words and saves nothing', async () => {
    const before = read('content/projects/bridge.json');
    const err = await saveEntry(ctx(), 'projects', 'bridge', { ...toDraft('projects', json('content/projects/bridge.json')), name: ' ', hero: null, year: '21' }).catch((e) => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.fields).toMatchObject({ name: 'Please fill in the project name.', hero: 'Please add a main photo.' });
    expect(err.fields.year).toContain('four digits');
    expect(read('content/projects/bridge.json')).toEqual(before);
  });

  it('refuses forged upload tokens and the wrong file type for a slot', async () => {
    const pdf = uploadToken(await store.putUpload(PDF), 'pdf', SECRET);
    const draft = { ...toDraft('projects', json('content/projects/bridge.json')), hero: { upload: pdf } };
    await expect(saveEntry(ctx(), 'projects', 'bridge', draft)).rejects.toBeInstanceOf(ValidationError);
    const forged = { ...draft, hero: { upload: 'a'.repeat(32) + '.jpg.' + 'b'.repeat(22) } };
    await expect(saveEntry(ctx(), 'projects', 'bridge', forged)).rejects.toBeInstanceOf(ValidationError);
  });

  it('manufacturer: website gets https://, documents are numbered in order', async () => {
    const draft = toDraft('manufacturers', json('content/manufacturers/acme.json'));
    draft.website = 'www.acme.test';
    draft.documents.unshift({ title: 'New brochure', type: 'Brochure', updated: 'May 2025', file: { upload: uploadToken(await store.putUpload(PDF), 'pdf', SECRET) } });
    await saveEntry(ctx(), 'manufacturers', 'acme', draft);
    const saved = json('content/manufacturers/acme.json');
    expect(saved.website).toBe('https://www.acme.test');
    expect(saved.order).toBe(10);
    expect(saved.resources.map((r: { title: string; file: string }) => [r.title, r.file])).toEqual([
      ['New brochure', '/resources/acme/resources/0/file.pdf'],
      ['Sheet', '/resources/acme/resources/1/file.pdf'],
    ]);
  });

  it('removing a manufacturer deletes its files and takes it off projects and presentations', async () => {
    await deleteEntry(ctx(), 'manufacturers', 'acme');
    expect(exists('content/manufacturers/acme.json')).toBe(false);
    expect(exists('public/logos/acme')).toBe(false);
    expect(exists('public/resources/acme')).toBe(false);
    expect(json('content/projects/bridge.json').manufacturers).toEqual([]);
    expect(json('content/presentations/talk.json').manufacturer).toBeNull();
    expect(await listEntries(store, 'manufacturers')).toEqual([]);
  });
});

// An in-memory stand-in for the GitHub Git Data API.
function fakeGitHub(initial: Record<string, Buffer>) {
  const blobs = new Map<string, Buffer>();
  const trees = new Map<string, Map<string, string>>();
  const commits = new Map<string, { tree: string; parents: string[] }>();
  const sha = (b: Buffer | string) => createHash('sha1').update(b).digest('hex');
  const putBlob = (b: Buffer) => (blobs.set(sha(b), b), sha(b));
  const putTree = (files: Map<string, string>) => {
    const id = sha('tree' + JSON.stringify([...files].sort()));
    trees.set(id, files);
    return id;
  };
  const root = putTree(new Map(Object.entries(initial).map(([p, b]) => [p, putBlob(b)])));
  let head = sha('c0');
  commits.set(head, { tree: root, parents: [] });
  const calls: string[] = [];
  let conflictOnce = false;

  const fetch = vi.fn(async (url: string, init: { method: string; body?: string }) => {
    const p = url.replace('https://api.github.com/repos/o/r', '');
    const body = init.body ? JSON.parse(init.body) : undefined;
    calls.push(`${init.method} ${p.replace(/[0-9a-f]{40}/g, ':sha')}`);
    const ok = (data: unknown) => new Response(JSON.stringify(data), { status: 200 });
    let m: RegExpExecArray | null;
    if (p === '/git/ref/heads/main') return ok({ object: { sha: head } });
    if ((m = /^\/git\/commits\/(\w+)$/.exec(p))) return ok({ tree: { sha: commits.get(m[1])!.tree } });
    if ((m = /^\/git\/trees\/(\w+)\?recursive=1$/.exec(p)))
      return ok({ truncated: false, tree: [...trees.get(m[1])!].map(([path, s]) => ({ path, sha: s, type: 'blob', mode: '100644' })) });
    if ((m = /^\/git\/blobs\/(\w+)$/.exec(p))) return ok({ content: blobs.get(m[1])!.toString('base64'), encoding: 'base64' });
    if (p === '/git/blobs') return ok({ sha: putBlob(Buffer.from(body.content, 'base64')) });
    if (p === '/git/trees') {
      const files = new Map(trees.get(body.base_tree)!);
      for (const e of body.tree) {
        if (e.content !== undefined) files.set(e.path, putBlob(Buffer.from(e.content)));
        else if (e.sha === null) {
          if (!files.has(e.path)) return new Response('{"message":"path not found"}', { status: 422 });
          files.delete(e.path);
        } else files.set(e.path, e.sha);
      }
      return ok({ sha: putTree(files) });
    }
    if (p === '/git/commits') {
      const id = sha(JSON.stringify(body) + Math.random());
      commits.set(id, { tree: body.tree, parents: body.parents });
      return ok({ sha: id });
    }
    if (p === '/git/refs/heads/main') {
      if (conflictOnce) {
        conflictOnce = false;
        return new Response('{"message":"Update is not a fast forward"}', { status: 422 });
      }
      if (commits.get(body.sha)!.parents[0] !== head) return new Response('{}', { status: 422 });
      head = body.sha;
      return ok({});
    }
    return new Response('not found', { status: 404 });
  });

  return {
    fetch,
    calls,
    conflictNextUpdate: () => (conflictOnce = true),
    files: () => new Map([...trees.get(commits.get(head)!.tree)!].map(([p, s]) => [p, blobs.get(s)!])),
    head: () => head,
  };
}

describe('saving to GitHub (live mode)', () => {
  function setup() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'admin-gh-'));
    seed(root);
    const files: Record<string, Buffer> = {};
    const walk = (d: string) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : (files[path.relative(root, path.join(d, e.name))] = fs.readFileSync(path.join(d, e.name)))));
    walk(root);
    fs.rmSync(root, { recursive: true, force: true });
    const gh = fakeGitHub(files);
    const store = githubStore({ token: 't', repo: 'o/r', branch: 'main', fetch: gh.fetch as unknown as typeof fetch });
    return { gh, store };
  }

  it('one save is one commit: blobs, tree, commit, then the branch moves', async () => {
    const { gh, store } = setup();
    const before = gh.head();
    const draft = toDraft('projects', (await listEntries(store, 'projects'))[0].entry);
    draft.gallery.reverse();
    draft.summary = 'Updated.';
    gh.calls.length = 0;
    await saveEntry({ store, secret: SECRET, who: 'Greg' }, 'projects', 'bridge', draft);

    expect(gh.head()).not.toBe(before);
    expect(gh.calls.filter((c) => c.startsWith('POST /git/commits'))).toHaveLength(1);
    expect(gh.calls.filter((c) => c.startsWith('PATCH'))).toEqual(['PATCH /git/refs/heads/main']);
    const files = gh.files();
    expect(JSON.parse(files.get('content/projects/bridge.json')!.toString()).summary).toBe('Updated.');
    expect(files.get('public/projects/bridge/gallery/0/image.png')).toEqual(PNG);
    expect(files.get('public/projects/bridge/gallery/1/image.jpg')).toEqual(Buffer.from([...JPG, 0]));
    expect(files.has('public/projects/bridge/gallery/0/image.jpg')).toBe(false);
    expect(files.has('public/projects/bridge/gallery/1/image.png')).toBe(false);
    const commitBody = JSON.parse(gh.fetch.mock.calls.find(([u, i]) => u.endsWith('/git/commits') && i.method === 'POST')![1].body!);
    expect(commitBody.message).toBe('Admin: update project "Bridge" (by Greg)');
  });

  it('uploads become blobs and land at their fixed names', async () => {
    const { gh, store } = setup();
    const id = await store.putUpload(JPG);
    expect(id).toMatch(/^[0-9a-f]{40}$/);
    const draft = toDraft('presentations', (await listEntries(store, 'presentations'))[0].entry);
    draft.banner = { upload: uploadToken(id, 'jpg', SECRET) };
    await saveEntry({ store, secret: SECRET, who: 'Greg' }, 'presentations', 'talk', draft);
    const files = gh.files();
    expect(files.get('public/presentations/talk/banner.jpg')).toEqual(JPG);
    expect(files.has('public/presentations/talk/banner.png')).toBe(false);
  });

  it('starts again if someone else updated the branch at the same moment', async () => {
    const { gh, store } = setup();
    gh.conflictNextUpdate();
    await deleteEntry({ store, secret: SECRET, who: 'Greg' }, 'presentations', 'talk');
    expect(gh.files().has('content/presentations/talk.json')).toBe(false);
    expect(gh.calls.filter((c) => c.startsWith('PATCH'))).toHaveLength(2);
  });
});
