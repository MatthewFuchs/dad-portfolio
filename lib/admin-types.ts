// What the admin forms send when saving. Shared by the browser and the server.

/** A file that is already on the site (`path`, its web address), or one just
 *  uploaded (`upload`, the token /api/admin/upload returned). */
export type FileRef = { path: string } | { upload: string };

export type ProjectDraft = {
  name: string;
  focus: string;
  location: string;
  year: string;
  summary: string;
  sectors: string[];
  manufacturers: string[];
  hero: FileRef | null;
  gallery: { image: FileRef; caption: string; stage: string }[];
};

export type ManufacturerDraft = {
  name: string;
  website: string;
  logo: FileRef | null;
  logoBackground: "white" | "dark";
  shortInfo: string;
  innovation: string;
  categories: string[];
  documents: { title: string; type: string; updated: string; file: FileRef | null }[];
};

export type PresentationDraft = {
  title: string;
  subtitle: string;
  manufacturer: string;
  blurb: string;
  topics: string[];
  banner: FileRef | null;
  bannerFit: "cover" | "contain";
};

export type Drafts = {
  projects: ProjectDraft;
  manufacturers: ManufacturerDraft;
  presentations: PresentationDraft;
};
export type CollectionName = keyof Drafts;

export const COLLECTIONS: CollectionName[] = ["projects", "manufacturers", "presentations"];

/** Plain words for each collection, used in headings, buttons and messages. */
export const NOUNS: Record<CollectionName, { one: string; many: string }> = {
  projects: { one: "project", many: "projects" },
  manufacturers: { one: "manufacturer", many: "manufacturers" },
  presentations: { one: "presentation", many: "presentations" },
};

/** Upload kinds: what the file is for decides what types and sizes are allowed. */
export type UploadKind = "photo" | "logo" | "pdf";
export const UPLOAD_LIMITS: Record<UploadKind, { mb: number; types: string[] }> = {
  photo: { mb: 15, types: ["jpg", "png", "webp"] },
  logo: { mb: 5, types: ["png", "jpg", "webp"] },
  pdf: { mb: 25, types: ["pdf"] },
};
/** Files go up in parts small enough for the host's request size limit. */
export const UPLOAD_PART_BYTES = 3 * 1024 * 1024;

/** Kinds of document offered for a manufacturer's PDFs. */
export const DOCUMENT_TYPES = ["Data Sheet", "Brochure", "Flyer", "Catalog", "Tech Sheet", "Summary", "Testimonial", "PDF"];

/** A small preview of a site image, read through the admin. */
export const thumb = (path: string, width: 200 | 640 = 640) =>
  `/api/admin/thumb?path=${encodeURIComponent(path)}&w=${width}`;

export type SaveResult = { ok: true; id: string; live: boolean } | { ok: false; error: string; fields?: Record<string, string> };
