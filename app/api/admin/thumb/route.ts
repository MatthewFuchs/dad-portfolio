import sharp from "sharp";
import { guard } from "../../../../lib/admin-api";

export const runtime = "nodejs";

// GET ?path=/projects/x/hero.jpg -> a small WebP preview for the admin.
// Read through the store, so on the live site a photo saved a moment ago
// shows before the website has finished updating.
const ALLOWED = /^\/(projects|logos|presentations)\/[a-z0-9-]+\/[a-z0-9/-]*[a-z0-9]\.(jpg|jpeg|png|webp)$/;

export async function GET(req: Request) {
  const ok = await guard({ post: false });
  if (ok instanceof Response) return ok;

  const url = new URL(req.url);
  const path = url.searchParams.get("path") ?? "";
  const width = url.searchParams.get("w") === "200" ? 200 : 640;
  if (!ALLOWED.test(path)) return new Response(null, { status: 400 });

  try {
    const bytes = await ok.store.readBytes(`public${path}`);
    if (!bytes) return new Response(null, { status: 404 });
    const webp = await sharp(bytes).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
    return new Response(new Uint8Array(webp), { headers: { "Content-Type": "image/webp" } });
  } catch (e) {
    console.error("ADMIN THUMB ERROR:", (e as Error).message);
    return new Response(null, { status: 500 });
  }
}
