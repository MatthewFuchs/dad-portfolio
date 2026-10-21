import { createHmac, timingSafeEqual } from "node:crypto";
import { UPLOAD_LIMITS, type UploadKind } from "./admin-types";

// Upload tokens: "<id>.<ext>.<signature>". The server hands one out for each
// stored upload and only accepts its own back, so a save can't point at a
// file of the wrong type or one that was never checked.

function sign(body: string, secret: string) {
  return createHmac("sha256", secret).update(body).digest("base64url").slice(0, 22);
}

export function uploadToken(id: string, ext: string, secret: string) {
  const body = `${id}.${ext}`;
  return `${body}.${sign(body, secret)}`;
}

export function readUploadToken(token: string, secret: string): { id: string; ext: string } | null {
  const m = /^([0-9a-f]{32,40})\.([a-z]{3,4})\.([\w-]{22})$/.exec(token ?? "");
  if (!m) return null;
  const expected = Buffer.from(sign(`${m[1]}.${m[2]}`, secret));
  const given = Buffer.from(m[3]);
  return given.length === expected.length && timingSafeEqual(given, expected) ? { id: m[1], ext: m[2] } : null;
}

/** The file type from its first bytes (never trusting the name or browser). */
export function sniff(bytes: Buffer): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (bytes.subarray(0, 4).toString("latin1") === "RIFF" && bytes.subarray(8, 12).toString("latin1") === "WEBP") return "webp";
  if (bytes.subarray(0, 5).toString("latin1") === "%PDF-") return "pdf";
  return null;
}

const KIND_NAMES: Record<UploadKind, string> = {
  photo: "a JPEG, PNG or WebP photo",
  logo: "a PNG, JPEG or WebP image",
  pdf: "a PDF",
};

/** The file's type if it's allowed for this kind of upload, else a message
 *  for the editor. */
export function checkUpload(bytes: Buffer, kind: UploadKind): { ext: string } | { error: string } {
  const limit = UPLOAD_LIMITS[kind];
  if (bytes.length > limit.mb * 1024 * 1024) {
    return { error: `This file is too large (${(bytes.length / 1048576).toFixed(1)} MB). The limit is ${limit.mb} MB.` };
  }
  const ext = sniff(bytes);
  if (!ext || !limit.types.includes(ext)) return { error: `This file isn't ${KIND_NAMES[kind]}.` };
  return { ext };
}
