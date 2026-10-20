import type { NextConfig } from "next";

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
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
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
