import type { MetadataRoute } from "next";
// The live site redirects the bare domain to www, so www is canonical.
const BASE_URL = "https://www.fuchs-sales.ca";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}