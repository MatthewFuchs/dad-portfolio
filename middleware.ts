import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, sessionSecret, verifySession } from "./lib/session";

// Only signed-in editors get past /admin and /api/admin. Pages send everyone
// else to the sign-in page; the API answers 401. Each page and API route
// checks the session again on the server.
//
// When the admin isn't set up (no ADMIN_USERS or ADMIN_SESSION_SECRET), the
// requests pass through and the pages and routes answer 404.

const PUBLIC_PATHS = new Set(["/admin/login", "/api/admin/login"]);

function configured() {
  try {
    const users = JSON.parse(process.env.ADMIN_USERS ?? "[]");
    return Array.isArray(users) && users.length > 0 && sessionSecret() !== null;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (PUBLIC_PATHS.has(pathname) || !configured()) return NextResponse.next();

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value, sessionSecret()!);
  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }
  const login = new URL("/admin/login", req.url);
  if (pathname !== "/admin") login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
