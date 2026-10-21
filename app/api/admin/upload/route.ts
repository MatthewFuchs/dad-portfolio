import { guard, readJson } from "../../../../lib/admin-api";
import { checkUpload, readUploadToken, uploadToken } from "../../../../lib/admin-uploads";
import { UPLOAD_LIMITS, UPLOAD_PART_BYTES, type UploadKind } from "../../../../lib/admin-types";
import { sessionSecret } from "../../../../lib/session";

export const runtime = "nodejs";
export const maxDuration = 60;

// Files go up in parts (the host refuses requests over about 4.5 MB):
//   1. multipart POST with a "part" file, once per part   -> { part: token }
//   2. JSON POST { parts: [tokens], kind }                 -> { upload: token }
// Step 2 joins the parts, checks the file really is a photo or PDF and stores
// it. Nothing goes on the site until the editor presses Save.

const UPLOAD_FAILED = "The file didn't upload. Please check your connection and try again.";

export async function POST(req: Request) {
  const ok = await guard({ post: true });
  if (ok instanceof Response) return ok;
  const { store } = ok;
  const secret = sessionSecret()!;

  try {
    if ((req.headers.get("content-type") ?? "").startsWith("multipart/form-data")) {
      if (Number(req.headers.get("content-length") ?? 0) > UPLOAD_PART_BYTES + 64 * 1024) {
        return Response.json({ error: "Too large" }, { status: 413 });
      }
      const part = (await req.formData()).get("part");
      if (!(part instanceof Blob) || part.size === 0 || part.size > UPLOAD_PART_BYTES) {
        return Response.json({ error: UPLOAD_FAILED }, { status: 400 });
      }
      const id = await store.putUpload(Buffer.from(await part.arrayBuffer()));
      return Response.json({ part: uploadToken(id, "part", secret) });
    }

    const body = await readJson(req, 10_000);
    const kind = body?.kind as UploadKind;
    const parts = Array.isArray(body?.parts) ? (body.parts as unknown[]) : [];
    const maxParts = kind in UPLOAD_LIMITS ? Math.ceil((UPLOAD_LIMITS[kind].mb * 1048576) / UPLOAD_PART_BYTES) + 1 : 0;
    const ids = parts.map((t) => readUploadToken(String(t), secret));
    if (!parts.length || parts.length > maxParts || ids.some((p) => !p || p.ext !== "part")) {
      return Response.json({ error: UPLOAD_FAILED }, { status: 400 });
    }
    const chunks = await Promise.all(ids.map((p) => store.getUpload(p!.id)));
    if (chunks.some((c) => !c)) return Response.json({ error: UPLOAD_FAILED }, { status: 400 });

    const file = Buffer.concat(chunks as Buffer[]);
    const checked = checkUpload(file, kind);
    if ("error" in checked) return Response.json({ error: checked.error }, { status: 400 });
    // A one-part file is already stored as it is.
    const id = ids.length === 1 ? ids[0]!.id : await store.putUpload(file);
    return Response.json({ upload: uploadToken(id, checked.ext, secret), ext: checked.ext });
  } catch (e) {
    console.error("ADMIN UPLOAD ERROR:", (e as Error).message);
    return Response.json({ error: UPLOAD_FAILED }, { status: 500 });
  }
}
