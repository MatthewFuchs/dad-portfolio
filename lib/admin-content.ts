import type { ManufacturerFile, PresentationFile, ProjectFile } from "./content";
import { readText, type Op, type Store } from "./admin-store";
import { readUploadToken } from "./admin-uploads";
import {
  NOUNS,
  UPLOAD_LIMITS,
  type CollectionName,
  type FileRef,
  type ManufacturerDraft,
  type PresentationDraft,
  type ProjectDraft,
  type UploadKind,
} from "./admin-types";

// Turning what the admin forms send into content files: checks every field,
// gives new entries their web address, puts uploaded files at their fixed
// names (hero.jpg, gallery/0/image.jpg, …) and tidies away files an entry no
// longer uses. The result is a list of changes the store saves in one go.

type Files = { projects: ProjectFile; manufacturers: ManufacturerFile; presentations: PresentationFile };

export class ValidationError extends Error {
  constructor(public fields: Record<string, string>) {
    super(Object.values(fields)[0] ?? "Please check the form.");
  }
}

/** A web address from a name: "Café Plaza, Phase 2" -> "cafe-plaza-phase-2". */
export function slugify(name: string) {
  const slug = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return slug || "item";
}

export function uniqueSlug(name: string, taken: Iterable<string>) {
  const used = new Set(taken);
  const base = slugify(name);
  let slug = base;
  for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}

// Folders holding each entry's files (repo paths).
export function assetDirs(collection: CollectionName, id: string) {
  switch (collection) {
    case "projects":
      return [`public/projects/${id}`];
    case "manufacturers":
      return [`public/logos/${id}`, `public/resources/${id}`];
    case "presentations":
      return [`public/presentations/${id}`];
  }
}

const jsonPath = (collection: CollectionName, id: string) => `content/${collection}/${id}.json`;

export async function listEntries<K extends CollectionName>(store: Store, collection: K) {
  const paths = (await store.listPaths(`content/${collection}`)).filter((p) => /^content\/[^/]+\/[^/]+\.json$/.test(p));
  const entries = await Promise.all(
    paths.map(async (p) => {
      try {
        return { id: p.slice(collection.length + 9, -5), entry: JSON.parse((await readText(store, p)) ?? "") as Files[K] };
      } catch {
        return null;
      }
    })
  );
  return entries.filter((e): e is { id: string; entry: Files[K] } => e !== null);
}

export async function getEntry<K extends CollectionName>(store: Store, collection: K, id: string) {
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  const text = await readText(store, jsonPath(collection, id));
  try {
    return text ? (JSON.parse(text) as Files[K]) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- field checks

class Checker {
  fields: Record<string, string> = {};
  text(v: unknown, field: string, label: string, opts: { required?: boolean; max?: number } = {}) {
    const s = typeof v === "string" ? v.trim() : "";
    if (opts.required && !s) this.fields[field] ??= `Please fill in ${label}.`;
    if (s.length > (opts.max ?? 300)) this.fields[field] ??= `${label[0].toUpperCase()}${label.slice(1)} is too long (${opts.max ?? 300} characters at most).`;
    return s;
  }
  list(v: unknown, field: string, max = 20, itemMax = 60) {
    const items = Array.isArray(v) ? v : [];
    const out = Array.from(new Set(items.filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean)));
    if (out.length > max || out.some((x) => x.length > itemMax)) this.fields[field] ??= "Too many items, or one is too long.";
    return out.slice(0, max);
  }
  done() {
    if (Object.keys(this.fields).length) throw new ValidationError(this.fields);
  }
}

// Places one file at its fixed name and remembers it, so everything else in
// the entry's folders can be removed.
class Placer {
  ops: Op[] = [];
  keep = new Set<string>();
  constructor(
    private existing: Set<string>,
    private secret: string,
    private check: Checker
  ) {}
  /** `base` is the web address without extension, e.g. "/projects/x/hero". */
  place(ref: FileRef | null | undefined, base: string, kind: UploadKind, field: string, label: string): string {
    if (!ref) {
      this.check.fields[field] ??= `Please add ${label}.`;
      return "";
    }
    if ("path" in ref) {
      const from = `public${ref.path}`;
      const ext = /\.([a-z0-9]+)$/i.exec(ref.path)?.[1]?.toLowerCase();
      if (!this.existing.has(from) || !ext) {
        this.check.fields[field] ??= `${label[0].toUpperCase()}${label.slice(1)} is missing. Please add it again.`;
        return "";
      }
      const url = `${base}.${ext}`;
      if (`public${url}` !== from) this.ops.push({ type: "copy", path: `public${url}`, from });
      this.keep.add(`public${url}`);
      return url;
    }
    const upload = readUploadToken(ref.upload, this.secret);
    if (!upload || !UPLOAD_LIMITS[kind].types.includes(upload.ext)) {
      this.check.fields[field] ??= `${label[0].toUpperCase()}${label.slice(1)} didn't upload properly. Please add it again.`;
      return "";
    }
    const url = `${base}.${upload.ext}`;
    this.ops.push({ type: "upload", path: `public${url}`, id: upload.id });
    this.keep.add(`public${url}`);
    return url;
  }
  /** Keep a file the form doesn't edit (a project's documents, say). */
  hold(url: string) {
    this.keep.add(`public${url}`);
  }
  cleanup() {
    for (const p of this.existing) if (!this.keep.has(p)) this.ops.push({ type: "delete", path: p });
  }
}

const json = (data: unknown) => JSON.stringify(data, null, 2) + "\n";
const nextOrder = (orders: (number | undefined)[]) => Math.max(0, ...orders.map((o) => o ?? 0)) + 10;

// ---------------------------------------------------------------- save

export type SaveContext = { store: Store; secret: string; who: string };

/** Saves an entry (a new one when `id` is null) and returns its id. */
export async function saveEntry(ctx: SaveContext, collection: CollectionName, id: string | null, draft: unknown) {
  const all = await listEntries(ctx.store, collection);
  const before = id ? all.find((e) => e.id === id) : undefined;
  if (id && !before) throw new ValidationError({ form: `This ${NOUNS[collection].one} no longer exists. It may have been removed.` });

  const d = (draft ?? {}) as Record<string, unknown>;
  const name = typeof d.name === "string" ? d.name : typeof d.title === "string" ? d.title : "";
  // "new" is taken by the "Add" page's own address.
  const newId = id ?? uniqueSlug(name || NOUNS[collection].one, ["new", ...all.map((e) => e.id)]);

  const existing = new Set((await Promise.all(assetDirs(collection, newId).map((dir) => ctx.store.listPaths(dir)))).flat());
  const check = new Checker();
  const placer = new Placer(existing, ctx.secret, check);

  let entry: Files[CollectionName];
  let title: string;
  if (collection === "projects") {
    const manufacturerIds = new Set((await listEntries(ctx.store, "manufacturers")).map((m) => m.id));
    ({ entry, title } = composeProject(d as ProjectDraft, before?.entry as ProjectFile | undefined, newId, check, placer, manufacturerIds));
  } else if (collection === "manufacturers") {
    ({ entry, title } = composeManufacturer(d as ManufacturerDraft, before?.entry as ManufacturerFile | undefined, newId, check, placer, all.map((e) => (e.entry as ManufacturerFile).order)));
  } else {
    const manufacturerIds = new Set((await listEntries(ctx.store, "manufacturers")).map((m) => m.id));
    ({ entry, title } = composePresentation(d as PresentationDraft, before?.entry as PresentationFile | undefined, newId, check, placer, manufacturerIds, all.map((e) => (e.entry as PresentationFile).order)));
  }
  check.done();
  placer.cleanup();

  const ops: Op[] = [{ type: "write", path: jsonPath(collection, newId), text: json(entry) }, ...placer.ops];
  await ctx.store.commit(ops, `Admin: ${id ? "update" : "add"} ${NOUNS[collection].one} "${title}" (by ${ctx.who})`);
  return newId;
}

function composeProject(d: ProjectDraft, before: ProjectFile | undefined, id: string, check: Checker, placer: Placer, manufacturerIds: Set<string>) {
  const name = check.text(d.name, "name", "the project name", { required: true, max: 120 });
  const focus = check.text(d.focus, "focus", "the short description", { max: 80 });
  const location = check.text(d.location, "location", "the city and province", { required: true, max: 80 });
  const year = check.text(d.year, "year", "the year", { max: 4 });
  if (year && !/^(19|20)\d\d$/.test(year)) check.fields.year ??= "Please enter the year as four digits, like 2024.";
  const summary = check.text(d.summary, "summary", "a description of the project", { required: true, max: 3000 });
  const sectors = check.list(d.sectors, "sectors");
  const manufacturers = check.list(d.manufacturers, "manufacturers", 30).filter((m) => manufacturerIds.has(m));

  const hero = placer.place(d.hero, `/projects/${id}/hero`, "photo", "hero", "a main photo");
  const items = Array.isArray(d.gallery) ? d.gallery.slice(0, 60) : [];
  const gallery = items.map((g, i) => {
    const out: ProjectFile["gallery"][number] = {
      image: placer.place(g?.image, `/projects/${id}/gallery/${i}/image`, "photo", `gallery.${i}`, `photo ${i + 1}`),
    };
    const caption = check.text(g?.caption, `gallery.${i}.caption`, `the caption of photo ${i + 1}`, { max: 200 });
    const stage = check.text(g?.stage, `gallery.${i}.stage`, `the step name of photo ${i + 1}`, { max: 40 });
    if (caption) out.caption = caption;
    if (stage) out.stage = stage;
    return out;
  });
  for (const r of before?.resources ?? []) placer.hold(r.file);

  const entry: ProjectFile = {
    name,
    focus,
    location,
    year,
    sectors,
    manufacturers,
    hero,
    summary,
    gallery,
    tags: before?.tags ?? [],
    resources: before?.resources ?? [],
  };
  return { entry, title: name };
}

function composeManufacturer(d: ManufacturerDraft, before: ManufacturerFile | undefined, id: string, check: Checker, placer: Placer, orders: (number | undefined)[]) {
  const name = check.text(d.name, "name", "the company name", { required: true, max: 80 });
  let website = check.text(d.website, "website", "the website", { required: true, max: 300 });
  if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`;
  try {
    if (website && !/^https?:$/.test(new URL(website).protocol)) throw new Error();
  } catch {
    check.fields.website ??= "That doesn't look like a website address. Try something like www.example.com.";
  }
  const shortInfo = check.text(d.shortInfo, "shortInfo", "the one-line description", { required: true, max: 300 });
  const innovation = check.text(d.innovation, "innovation", "what makes them stand out", { max: 1000 });
  const categories = check.list(d.categories, "categories", 10, 40);
  const logo = placer.place(d.logo, `/logos/${id}/logo`, "logo", "logo", "a logo");

  const docs = Array.isArray(d.documents) ? d.documents.slice(0, 60) : [];
  const resources = docs.map((doc, i) => {
    const out: ManufacturerFile["resources"][number] = {
      title: check.text(doc?.title, `documents.${i}.title`, `the name of document ${i + 1}`, { required: true, max: 160 }),
      file: placer.place(doc?.file, `/resources/${id}/resources/${i}/file`, "pdf", `documents.${i}.file`, `the PDF for document ${i + 1}`),
      type: check.text(doc?.type, `documents.${i}.type`, `the kind of document ${i + 1}`, { max: 40 }) || "PDF",
    };
    const updated = check.text(doc?.updated, `documents.${i}.updated`, `the date of document ${i + 1}`, { max: 40 });
    if (updated) out.updated = updated;
    return out;
  });

  const entry: ManufacturerFile = {
    name,
    website,
    logo,
    logoBackground: d.logoBackground === "dark" ? "dark" : "white",
    shortInfo,
    innovation,
    categories,
    order: before?.order ?? nextOrder(orders),
    resources,
  };
  return { entry, title: name };
}

function composePresentation(d: PresentationDraft, before: PresentationFile | undefined, id: string, check: Checker, placer: Placer, manufacturerIds: Set<string>, orders: (number | undefined)[]) {
  const title = check.text(d.title, "title", "the title", { required: true, max: 160 });
  const subtitle = check.text(d.subtitle, "subtitle", "the second line", { max: 160 });
  const blurb = check.text(d.blurb, "blurb", "a description", { required: true, max: 1500 });
  const topics = check.list(d.topics, "topics");
  const manufacturer = typeof d.manufacturer === "string" && manufacturerIds.has(d.manufacturer) ? d.manufacturer : null;
  const banner = placer.place(d.banner, `/presentations/${id}/banner`, "photo", "banner", "a picture");

  const entry: PresentationFile = {
    title,
    subtitle,
    manufacturer,
    blurb,
    topics,
    banner,
    bannerFit: d.bannerFit === "contain" ? "contain" : "cover",
    order: before?.order ?? nextOrder(orders),
  };
  return { entry, title };
}

// ---------------------------------------------------------------- delete

/** Removes an entry and its files. Removing a manufacturer also takes it off
 *  every project and presentation that mentions it, in the same save. */
export async function deleteEntry(ctx: SaveContext, collection: CollectionName, id: string) {
  const entry = await getEntry(ctx.store, collection, id);
  if (!entry) throw new ValidationError({ form: `This ${NOUNS[collection].one} no longer exists.` });
  const ops: Op[] = [{ type: "delete", path: jsonPath(collection, id) }];
  for (const dir of assetDirs(collection, id)) {
    for (const p of await ctx.store.listPaths(dir)) ops.push({ type: "delete", path: p });
  }
  if (collection === "manufacturers") {
    for (const p of await listEntries(ctx.store, "projects")) {
      if (p.entry.manufacturers?.includes(id)) {
        const updated = { ...p.entry, manufacturers: p.entry.manufacturers.filter((m) => m !== id) };
        ops.push({ type: "write", path: jsonPath("projects", p.id), text: json(updated) });
      }
    }
    for (const p of await listEntries(ctx.store, "presentations")) {
      if (p.entry.manufacturer === id) {
        ops.push({ type: "write", path: jsonPath("presentations", p.id), text: json({ ...p.entry, manufacturer: null }) });
      }
    }
  }
  const title = "name" in entry ? entry.name : entry.title;
  await ctx.store.commit(ops, `Admin: remove ${NOUNS[collection].one} "${title}" (by ${ctx.who})`);
}

// ---------------------------------------------------------------- forms

const ref = (url: string | undefined | null) => (url ? { path: url } : null);

/** What the edit form starts with: the saved entry, or a blank one. */
export function toDraft(collection: "projects", entry?: ProjectFile): ProjectDraft;
export function toDraft(collection: "manufacturers", entry?: ManufacturerFile): ManufacturerDraft;
export function toDraft(collection: "presentations", entry?: PresentationFile): PresentationDraft;
export function toDraft(collection: CollectionName, entry?: Files[CollectionName]): ProjectDraft | ManufacturerDraft | PresentationDraft {
  if (collection === "projects") {
    const e = entry as ProjectFile | undefined;
    return {
      name: e?.name ?? "",
      focus: e?.focus ?? "",
      location: e?.location ?? "",
      year: e?.year ?? "",
      summary: e?.summary ?? "",
      sectors: e?.sectors ?? [],
      manufacturers: e?.manufacturers ?? [],
      hero: ref(e?.hero),
      gallery: (e?.gallery ?? []).filter((g) => g.image).map((g) => ({ image: { path: g.image }, caption: g.caption ?? "", stage: g.stage ?? "" })),
    } satisfies ProjectDraft;
  }
  if (collection === "manufacturers") {
    const e = entry as ManufacturerFile | undefined;
    return {
      name: e?.name ?? "",
      website: e?.website ?? "",
      logo: ref(e?.logo),
      logoBackground: e?.logoBackground === "dark" ? "dark" : "white",
      shortInfo: e?.shortInfo ?? "",
      innovation: e?.innovation ?? "",
      categories: e?.categories ?? [],
      documents: (e?.resources ?? []).map((r) => ({ title: r.title, type: r.type || "PDF", updated: r.updated ?? "", file: ref(r.file) })),
    } satisfies ManufacturerDraft;
  }
  const e = entry as PresentationFile | undefined;
  return {
    title: e?.title ?? "",
    subtitle: e?.subtitle ?? "",
    manufacturer: e?.manufacturer ?? "",
    blurb: e?.blurb ?? "",
    topics: e?.topics ?? [],
    banner: ref(e?.banner),
    bannerFit: e?.bannerFit === "contain" ? "contain" : "cover",
  } satisfies PresentationDraft;
}
