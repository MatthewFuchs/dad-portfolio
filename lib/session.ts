// Admin session cookie: `<base64url(payload)>.<base64url(HMAC-SHA256)>`,
// signed with ADMIN_SESSION_SECRET. Uses Web Crypto only, so it works both in
// middleware and in route handlers.

export const SESSION_COOKIE = "admin_session";
export const SESSION_HOURS = 8;

export type Session = { email: string; name: string; exp: number };

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

/** The signing secret, or null when the admin isn't configured. */
export function sessionSecret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

async function key(secret: string) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function signSession(session: Omit<Session, "exp">, secret: string, now = Date.now()) {
  const payload: Session = { ...session, exp: now + SESSION_HOURS * 3600_000 };
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await key(secret), enc.encode(body));
  return `${body}.${b64url(sig)}`;
}

/** The session if the cookie is genuine and not expired, else null. */
export async function verifySession(
  token: string | undefined,
  secret: string,
  now = Date.now()
): Promise<Session | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await key(secret), fromB64url(sig), enc.encode(body));
    if (!ok) return null;
    const s = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Session;
    if (typeof s.exp !== "number" || s.exp <= now || !s.email) return null;
    return s;
  } catch {
    return null;
  }
}
