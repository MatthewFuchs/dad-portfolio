import { adminConfigured, currentAdmin, sameOrigin } from "./auth";
import { getStore, type Store } from "./admin-store";
import type { Session } from "./session";

// The checks every admin API route starts with. Returns the signed-in editor
// and the store, or the response to send instead.
export async function guard(opts: { post: boolean }): Promise<{ session: Session; store: Store } | Response> {
  if (!adminConfigured()) return new Response(null, { status: 404 });
  if (opts.post && !(await sameOrigin())) return Response.json({ error: "Forbidden" }, { status: 403 });
  const session = await currentAdmin();
  if (!session) return Response.json({ error: "Please sign in again." }, { status: 401 });
  const store = getStore();
  if (!store) {
    return Response.json(
      { error: "Saving isn't switched on for the live website yet. Ask Matt to finish the setup." },
      { status: 503 }
    );
  }
  return { session, store };
}

export const SAVE_FAILED = "Saving didn't work. Please try again in a minute. If it keeps happening, let Matt know.";

/** The request body as JSON, or null if it's too large or not JSON. */
export async function readJson(req: Request, maxBytes: number): Promise<Record<string, unknown> | null> {
  if (Number(req.headers.get("content-length") ?? 0) > maxBytes) return null;
  try {
    const raw = await req.text();
    if (raw.length > maxBytes) return null;
    const body = JSON.parse(raw);
    return body && typeof body === "object" ? body : null;
  } catch {
    return null;
  }
}
