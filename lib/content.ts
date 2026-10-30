import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// Site content, edited in the admin panel (/admin) and stored as JSON in
// content/. Read at build time only; pages stay statically generated.
//
// Loading is deliberately lenient: an entry with a missing file or an unknown
// manufacturer is skipped with a warning instead of failing the build, so one
// mistake in the admin never blocks every other change from deploying.

export type Resource = {
  id: string;
  title: string;
  href: string;
  type: string;
  size?: string;
  updated?: string;
  tags?: string[];
};

export type Manufacturer = {
  id: string;
  name: string;
  website: string;
  logoSrc: string;
  logoBgClass?: string;
  shortInfo: string;
  innovation: string;
  categories: string[];
  resources: Resource[];
};

export type ProjectImage = { src: string; alt?: string; stage?: string };

export type Project = {
  slug: string;
  /** "Name | Focus", as the pages expect. */
  title: string;
  location: string;
  year?: number;
  sectors: string[];
  manufacturers: string[];
  hero: string;
  summary: string;
  gallery?: ProjectImage[];
  resources?: { title: string; href: string }[];
  tags?: string[];
};

export type Presentation = {
  id: string;
  /** "Title | Subtitle", as the page expects. */
  title: string;
  blurb: string;
  banner: string;
  tags: string[];
  /** Labels shown on the card, without the manufacturer's own name. */
  topics: string[];
  /** How long it runs, e.g. "1 hour". */
  duration?: string;
  /** How it's delivered, e.g. "In person or online". */
  format?: string;
  /** Continuing-education credit, if any. */
  credits?: string;
  brand?: string;
  bannerFit?: "cover" | "contain";
};

// Raw shapes of the JSON files in content/ (as written by the admin panel).
export type ManufacturerFile = {
  name: string;
  website: string;
  logo: string;
  logoBackground?: "white" | "dark";
  shortInfo: string;
  innovation?: string;
  categories: string[];
  order?: number;
  resources: { title: string; file: string; type: string; updated?: string }[];
};
export type ProjectFile = {
  name: string;
  focus?: string;
  location: string;
  year?: string;
  sectors: string[];
  manufacturers: string[];
  hero: string;
  summary: string;
  gallery: { image: string; caption?: string; stage?: string }[];
  tags: string[];
  resources: { title: string; file: string }[];
};
export type PresentationFile = {
  title: string;
  subtitle?: string;
  manufacturer?: string | null;
  blurb: string;
  topics: string[];
  duration?: string;
  format?: string;
  credits?: string;
  banner: string;
  bannerFit?: "cover" | "contain";
  order?: number;
};
type Collections = {
  manufacturers: ManufacturerFile;
  projects: ProjectFile;
  presentations: PresentationFile;
};

const CONTENT = () => path.join(process.cwd(), "content");
const PUBLIC = path.join(process.cwd(), "public");

// Every entry of a collection; unreadable files are skipped with a warning.
export function readCollection<K extends keyof Collections>(name: K): { slug: string; entry: Collections[K] }[] {
  const dir = path.join(CONTENT(), name);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .flatMap((f) => {
      try {
        return [{ slug: f.slice(0, -5), entry: JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) }];
      } catch (e) {
        console.warn(`[content] skipped ${name}/${f}: not valid JSON (${(e as Error).message})`);
        return [];
      }
    });
}

const exists = (url: string | null | undefined): url is string =>
  !!url && fs.existsSync(path.join(PUBLIC, url));

function warn(what: string, why: string) {
  console.warn(`[content] skipped ${what}: ${why}`);
}

function fileSize(url: string) {
  const bytes = fs.statSync(path.join(PUBLIC, url)).size;
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// Turns "/projects/x/hero.jpg" into "/projects/x/hero.jpg?v=1a2b3c4d".
//
// The admin saves a replacement photo under the same file name, and browsers
// keep optimized images for a month, so without this visitors could keep seeing
// the old photo. The "v" value comes from the file's contents: when the picture
// changes the address changes, and browsers fetch the new one.
//
// Only for images. Document links stay plain because the Resources page reads
// the file extension from the end of the address.
const versions = new Map<string, string>();
function versioned(url: string) {
  const abs = path.join(PUBLIC, url);
  // Remembered per file, so one photo used on several pages is read only once.
  let v = process.env.NODE_ENV === "production" ? versions.get(abs) : undefined;
  if (!v) {
    v = createHash("sha256").update(fs.readFileSync(abs)).digest("hex").slice(0, 8);
    versions.set(abs, v);
  }
  return `${url}?v=${v}`;
}

// The admin keeps "Name" and "Focus" separately; the pages expect "Name | Focus".
const joinTitle = (a: string, b?: string | null) => (b ? `${a} | ${b}` : a);

let manufacturersCache: Manufacturer[] | undefined;

export async function getManufacturers(): Promise<Manufacturer[]> {
  // Cached for the build; in development the admin changes files as you go.
  if (manufacturersCache && process.env.NODE_ENV === "production") return manufacturersCache;
  const all = readCollection("manufacturers");
  manufacturersCache = all
    .filter(({ slug, entry }) => {
      if (!exists(entry.logo)) return warn(`manufacturer "${slug}"`, `logo ${entry.logo} not found`), false;
      return true;
    })
    .sort((a, b) => (a.entry.order ?? 100) - (b.entry.order ?? 100) || a.entry.name.localeCompare(b.entry.name))
    .map(({ slug, entry }) => ({
      id: slug,
      name: entry.name,
      website: entry.website,
      logoSrc: versioned(entry.logo!),
      logoBgClass: entry.logoBackground === "dark" ? "bg-neutral-900" : undefined,
      shortInfo: entry.shortInfo,
      innovation: entry.innovation ?? "",
      categories: [...(entry.categories ?? [])],
      resources: (entry.resources ?? [])
        .filter((r, i) => {
          if (!exists(r.file)) return warn(`document ${i + 1} of "${slug}"`, `${r.file} not found`), false;
          return true;
        })
        .map((r, i) => ({
          id: `${slug}-${i}`,
          title: r.title,
          href: r.file!,
          type: r.type,
          size: fileSize(r.file!),
          updated: r.updated || undefined,
          tags: [],
        })),
    }));
  return manufacturersCache;
}

export async function getProjects(): Promise<Project[]> {
  const known = new Set((await getManufacturers()).map((m) => m.id));
  const all = readCollection("projects");
  return all
    .filter(({ slug, entry }) => {
      if (!exists(entry.hero)) return warn(`project "${slug}"`, `main photo ${entry.hero} not found`), false;
      return true;
    })
    // Newest first; same year by name.
    .sort((a, b) => Number(b.entry.year || 0) - Number(a.entry.year || 0) || a.entry.name.localeCompare(b.entry.name))
    .map(({ slug, entry }) => ({
      slug,
      title: joinTitle(entry.name, entry.focus),
      location: entry.location,
      year: entry.year ? Number(entry.year) : undefined,
      sectors: (entry.sectors ?? []).filter(Boolean),
      manufacturers: (entry.manufacturers ?? []).filter((id) => !!id && known.has(id)),
      hero: versioned(entry.hero!),
      summary: entry.summary,
      gallery: (entry.gallery ?? [])
        .filter((g) => exists(g.image))
        .map((g) => ({ src: versioned(g.image!), alt: g.caption || undefined, stage: g.stage || undefined })),
      resources: (entry.resources ?? [])
        .filter((r) => exists(r.file))
        .map((r) => ({ title: r.title, href: r.file! })),
      tags: (entry.tags ?? []).filter(Boolean),
    }));
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await getProjects()).find((p) => p.slug === slug);
}

export async function getSectors(): Promise<string[]> {
  return Array.from(new Set((await getProjects()).flatMap((p) => p.sectors))).sort();
}

export async function getPresentations(): Promise<Presentation[]> {
  const byId = new Map((await getManufacturers()).map((m) => [m.id, m]));
  const companyNames = new Set([...byId.values()].map((m) => m.name.toLowerCase()));
  const all = readCollection("presentations");
  return all
    .filter(({ slug, entry }) => {
      if (!exists(entry.banner)) return warn(`presentation "${slug}"`, `banner ${entry.banner} not found`), false;
      return true;
    })
    .sort((a, b) => (a.entry.order ?? 100) - (b.entry.order ?? 100))
    .map(({ slug, entry }) => {
      const brand = entry.manufacturer ? byId.get(entry.manufacturer)?.name : undefined;
      const topics = (entry.topics ?? []).filter(Boolean);
      return {
        id: slug,
        title: joinTitle(entry.title, entry.subtitle),
        blurb: entry.blurb,
        banner: versioned(entry.banner!),
        tags: brand ? [brand, ...topics] : topics,
        // The card already names the manufacturer, so company names aren't labels.
        topics: topics.filter((t) => !companyNames.has(t.toLowerCase())),
        duration: entry.duration || undefined,
        format: entry.format || undefined,
        credits: entry.credits || undefined,
        brand,
        bannerFit: entry.bannerFit ?? "cover",
      };
    });
}
