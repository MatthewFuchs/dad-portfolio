import { guard, readJson, SAVE_FAILED } from "../../../../lib/admin-api";
import { deleteEntry, ValidationError } from "../../../../lib/admin-content";
import { COLLECTIONS, type CollectionName } from "../../../../lib/admin-types";
import { sessionSecret } from "../../../../lib/session";

export const runtime = "nodejs";

// POST { collection, id } -> { ok }
export async function POST(req: Request) {
  const ok = await guard({ post: true });
  if (ok instanceof Response) return ok;
  const { session, store } = ok;

  const body = await readJson(req, 2_000);
  const collection = body?.collection as CollectionName;
  const id = body?.id;
  if (!COLLECTIONS.includes(collection) || typeof id !== "string" || !/^[a-z0-9-]+$/.test(id)) {
    return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  try {
    await deleteEntry({ store, secret: sessionSecret()!, who: session.name }, collection, id);
    return Response.json({ ok: true, live: store.kind === "github" });
  } catch (e) {
    if (e instanceof ValidationError) return Response.json({ ok: false, error: e.message }, { status: 400 });
    console.error("ADMIN DELETE ERROR:", (e as Error).message);
    return Response.json({ ok: false, error: SAVE_FAILED }, { status: 500 });
  }
}
