import { guard } from "../../../../lib/admin-api";

export const runtime = "nodejs";

// GET ?path=/projects/x/hero.jpg&w=200|640 -> a preview image for the admin.
//
// A file the live website already serves goes through the site's own image
// service (/_next/image: resized and cached by the host). A file saved since
// the last deploy isn't on the website yet, so it's read from the store and
// sent as it is (uploads are already shrunk in the browser).
const ALLOWED = /^\/(projects|logos|presentations)\/[a-z0-9-]+\/[a-z0-9/-]*[a-z0-9]\.(jpg|jpeg|png|webp)$/;
const TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(req: Request) {
  const ok = await guard({ post: false });
  if (ok instanceof Response) return ok;
  const { store } = ok;

  const url = new URL(req.url);
  const path = url.searchParams.get("path") ?? "";
  // Widths the image service offers (Next's default image and device sizes).
  const width = url.searchParams.get("w") === "200" ? 256 : 640;
  if (!ALLOWED.test(path)) return new Response(null, { status: 400 });

  try {
    // If GitHub can't be asked, the website's copy is the best guess.
    const live = store.deployed ? await store.deployed(`public${path}`).catch(() => true) : false;
    if (live) {
      return Response.redirect(new URL(`/_next/image?url=${encodeURIComponent(path)}&w=${width}&q=75`, req.url), 307);
    }
    const bytes = await store.readBytes(`public${path}`);
    if (!bytes) return new Response(null, { status: 404 });
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": TYPES[path.split(".").pop()!] } });
  } catch (e) {
    console.error("ADMIN THUMB ERROR:", (e as Error).message);
    return new Response(null, { status: 500 });
  }
}
