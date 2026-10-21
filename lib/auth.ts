import { scrypt as scryptCb, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies, headers } from "next/headers";
import { SESSION_COOKIE, sessionSecret, verifySession, type Session } from "./session";

// Admin users and passwords. ADMIN_USERS is a JSON list kept in the
// environment (never in the repo):
//   [{"email":"greg@example.com","name":"Greg","hash":"scrypt:16384:8:1:<salt>:<hash>"}]
// Create a hash with: node scripts/hash-password.mjs

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;

export type AdminUser = { email: string; name: string; hash: string };

export function adminUsers(): AdminUser[] {
  try {
    const list = JSON.parse(process.env.ADMIN_USERS ?? "[]");
    return Array.isArray(list) ? list.filter((u) => u?.email && u?.hash) : [];
  } catch {
    return [];
  }
}

/** The admin exists only when users and a session secret are configured. */
export function adminConfigured() {
  return adminUsers().length > 0 && sessionSecret() !== null;
}

export async function hashPassword(password: string, N = 16384, r = 8, p = 1) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64, { N, r, p, maxmem: 64 * 1024 * 1024 });
  // ":" separators: "$" would be expanded as a variable when read from .env files.
  return `scrypt:${N}:${r}:${p}:${salt.toString("base64")}:${hash.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [alg, N, r, p, salt, hash] = stored.split(":");
  if (alg !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await scrypt(password, Buffer.from(salt, "base64"), expected.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
    maxmem: 64 * 1024 * 1024,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// A fixed hash to compare against when the email is unknown, so a wrong
// email takes as long as a wrong password.
const DUMMY = "scrypt:16384:8:1:AAAAAAAAAAAAAAAAAAAAAA==:" + "A".repeat(86) + "==";

/** The user if the email and password match, else null. */
export async function checkCredentials(email: string, password: string): Promise<AdminUser | null> {
  const user = adminUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  const ok = await verifyPassword(password, user?.hash ?? DUMMY);
  return user && ok ? user : null;
}

// Lock-out: 5 failed attempts per email or per IP within 15 minutes.
const FAIL_LIMIT = 5;
const FAIL_WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, number[]>();

export function lockedOut(keys: string[], now = Date.now()) {
  return keys.some((k) => (failures.get(k) ?? []).filter((t) => now - t < FAIL_WINDOW_MS).length >= FAIL_LIMIT);
}

export function recordFailure(keys: string[], now = Date.now()) {
  for (const k of keys) {
    failures.set(k, [...(failures.get(k) ?? []).filter((t) => now - t < FAIL_WINDOW_MS), now]);
  }
}

export function clearFailures(keys: string[]) {
  for (const k of keys) failures.delete(k);
}

/** The signed-in admin for this request, or null. Route handlers call this
 *  even though middleware already checked (defence in depth). */
export async function currentAdmin(): Promise<Session | null> {
  const secret = sessionSecret();
  if (!secret || !adminConfigured()) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySession(token, secret);
  // A removed user loses access at once, even with an unexpired cookie.
  if (!session || !adminUsers().some((u) => u.email.toLowerCase() === session.email.toLowerCase())) return null;
  return session;
}

/** Same-origin check for admin POSTs (the cookie is also SameSite=Strict). */
export async function sameOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (!origin) return false;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
