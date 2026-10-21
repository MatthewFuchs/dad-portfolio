import { UPLOAD_LIMITS, UPLOAD_PART_BYTES, type UploadKind } from "../../lib/admin-types";

// Browser side of uploading: photos are shrunk here first (phone photos are
// often 5-10 MB; the site never shows them wider than 2400 px), then every
// file goes up in parts and the server checks and stores it.

const MAX_PX = 2400;

export class UploadError extends Error {}

async function decode(file: Blob) {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new UploadError(
      "This photo couldn't be opened. Please choose a JPEG or PNG (on an iPhone photo, use Share > Save as JPEG)."
    );
  }
}

/** A photo ready to upload: resized to 2400 px and saved as JPEG, unless it's
 *  already small. Logos keep their format (and see-through background). */
export async function prepareImage(file: File, kind: "photo" | "logo"): Promise<Blob> {
  const smallEnough = file.size <= 1.5 * 1024 * 1024 && /^image\/(jpeg|png|webp)$/.test(file.type);
  if (kind === "logo" && /^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  if (smallEnough) {
    const bmp = await decode(file);
    const fits = Math.max(bmp.width, bmp.height) <= MAX_PX;
    bmp.close();
    if (fits) return file;
  }
  const bmp = await decode(file);
  const scale = Math.min(1, MAX_PX / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  const ctx = canvas.getContext("2d")!;
  // JPEG has no transparency: put see-through areas on white.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.82));
  if (!blob) throw new UploadError("This photo couldn't be prepared. Please try a different photo.");
  return blob;
}

async function post(body: BodyInit, json: boolean) {
  let res: Response;
  try {
    res = await fetch("/api/admin/upload", {
      method: "POST",
      body,
      headers: json ? { "Content-Type": "application/json" } : undefined,
    });
  } catch {
    throw new UploadError("The upload stopped. Please check your internet connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new UploadError("You've been signed out. Please sign in again in a new tab, then try again.");
  if (!res.ok) throw new UploadError(data.error || "The file didn't upload. Please try again.");
  return data;
}

/** Uploads a file and returns its token for saving. */
export async function uploadFile(blob: Blob, kind: UploadKind, onProgress?: (fraction: number) => void) {
  const limit = UPLOAD_LIMITS[kind];
  if (blob.size > limit.mb * 1024 * 1024) {
    throw new UploadError(`This file is too large (${(blob.size / 1048576).toFixed(1)} MB). The limit is ${limit.mb} MB.`);
  }
  const parts: string[] = [];
  const count = Math.max(1, Math.ceil(blob.size / UPLOAD_PART_BYTES));
  for (let i = 0; i < count; i++) {
    const form = new FormData();
    form.append("part", blob.slice(i * UPLOAD_PART_BYTES, (i + 1) * UPLOAD_PART_BYTES));
    parts.push((await post(form, false)).part);
    onProgress?.((i + 1) / (count + 1));
  }
  const done = await post(JSON.stringify({ parts, kind }), true);
  onProgress?.(1);
  return done.upload as string;
}
