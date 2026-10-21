import { cookies } from "next/headers";
import { sameOrigin } from "../../../../lib/auth";
import { SESSION_COOKIE } from "../../../../lib/session";

export const runtime = "nodejs";

// The "Sign out" button is a plain form, so this answers with a redirect.
export async function POST(req: Request) {
  if (!(await sameOrigin())) return Response.json({ error: "Forbidden" }, { status: 403 });
  (await cookies()).delete(SESSION_COOKIE);
  return Response.redirect(new URL("/admin/login?signedout=1", req.url), 303);
}
