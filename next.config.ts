import type { NextConfig } from "next";
import legacyRedirects from "./lib/legacy-redirects.json";

// Redirect sources are path patterns: percent-encode spaces and escape the
// characters the pattern syntax reserves (some old filenames contain them).
const redirectSource = (p: string) =>
  encodeURI(p).replace(/[()[\]{}*+?:!]/g, (c) => `\\${c}`);

const isDev = process.env.NODE_ENV === "development";

// Next.js inlines small bootstrap scripts in every page, so scripts need
// 'unsafe-inline' (a nonce-based policy would make every page dynamic).
// Everything else is locked to this site; Vercel Analytics / Speed Insights
// load from the same origin in production and va.vercel-scripts.com in debug.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "media-src 'self'",
  "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' mailto:",
  // No upgrade-insecure-requests: HSTS on the live domain already forces HTTPS,
  // and WebKit would also upgrade http://localhost, breaking local testing.
].join("; ");

// The admin panel (/admin): never indexed, never cached, never framed. It uses
// the site's own CSP (it loads nothing from other origins).
const adminHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Cache-Control", value: "no-store" },
];

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Optimized photos are reused for a month instead of the 60s default.
    minimumCacheTTL: 60 * 60 * 24 * 31,
    // Allows the "?v=..." on image addresses (see versioned() in lib/content.ts),
    // which is what makes a replaced photo show up despite that long cache.
    localPatterns: [{ pathname: "/**" }],
  },
  // Old document and photo URLs (before the admin panel gave every file a
  // fixed name under its entry's folder) keep working: bookmarks, Google and
  // social previews. The list is in lib/legacy-redirects.json.
  async redirects() {
    return Object.entries(legacyRedirects).map(([from, to]) => ({
      source: redirectSource(from),
      destination: encodeURI(to),
      permanent: true,
    }));
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin", headers: adminHeaders },
      { source: "/admin/:path*", headers: adminHeaders },
      { source: "/api/admin/:path*", headers: adminHeaders },
      {
        // Hero footage and its poster: cache for 30 days, refresh in the background.
        source: "/video/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
