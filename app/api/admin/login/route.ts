import { cookies } from "next/headers";
import {
  adminConfigured,
  checkCredentials,
  clearFailures,
  lockedOut,
  recordFailure,
  sameOrigin,
} from "../../../../lib/auth";
import { SESSION_COOKIE, SESSION_HOURS, sessionSecret, signSession } from "../../../../lib/session";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 2_000;
const WRONG = "That email and password don't match. Please check them and try again.";

export async function POST(req: Request) {
  if (!adminConfigured()) return new Response(null, { status: 404 });
  if (!(await sameOrigin())) return Response.json({ error: "Forbidden" }, { status: 403 });

  let email = "";
  let password = "";
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) throw new Error("too large");
    const body = JSON.parse(raw);
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!email || !password) {
    return Response.json({ error: "Please enter your email and password." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const keys = [`email:${email}`, `ip:${ip}`];
  if (lockedOut(keys)) {
    return Response.json(
      { error: "Too many tries. For your security, sign-in is paused for 15 minutes." },
      { status: 429, headers: { "Retry-After": "900" } }
    );
  }

  const user = await checkCredentials(email, password);
  if (!user) {
    recordFailure(keys);
    await new Promise((r) => setTimeout(r, 300));
    return Response.json({ error: WRONG }, { status: 401 });
  }

  clearFailures(keys);
  const token = await signSession({ email: user.email, name: user.name || user.email }, sessionSecret()!);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: new URL(req.url).protocol === "https:" || process.env.VERCEL === "1",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
  return Response.json({ ok: true, name: user.name });
}
