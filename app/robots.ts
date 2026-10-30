import type { MetadataRoute } from "next";
// The live site redirects the bare domain to www, so www is canonical.
const BASE_URL = "https://www.fuchs-sales.ca";

// Served as /robots.txt: tells search engines they may read the site, except the
// admin, and where to find the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin"] },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}