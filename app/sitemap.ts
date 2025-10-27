import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { PROJECTS } from "../data/projects";

export const runtime = "nodejs";
export const revalidate = 86400;

const BASE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://www.fuchs-sales.ca") as string;

const PAGES: {
  url: string;
  file?: string;
  priority?: number;
  changeFrequency?: MetadataRoute.Sitemap[0]["changeFrequency"];
}[] = [
  { url: "/", file: "app/page.tsx", priority: 1, changeFrequency: "weekly" },
  { url: "/products", file: "app/products/page.tsx", priority: 0.8, changeFrequency: "weekly" },
  { url: "/projects", file: "app/projects/page.tsx", priority: 0.7, changeFrequency: "monthly" },
  { url: "/resources", file: "app/resources/page.tsx", priority: 0.7, changeFrequency: "weekly" },
  { url: "/presentations", file: "app/presentations/page.tsx", priority: 0.7, changeFrequency: "weekly" }, // ← NEW
  { url: "/about", file: "app/about/page.tsx", priority: 0.5, changeFrequency: "yearly" },
  { url: "/contact", file: "app/contact/page.tsx", priority: 0.6, changeFrequency: "yearly" },
  { url: "/terms", file: "app/terms/page.tsx", priority: 0.2, changeFrequency: "yearly" },
  { url: "/privacy", file: "app/privacy/page.tsx", priority: 0.2, changeFrequency: "yearly" },
];

function fileMtimeOrNow(relativeFile?: string): Date {
  try {
    if (!relativeFile) return new Date();
    const abs = path.join(process.cwd(), relativeFile);
    return fs.statSync(abs).mtime;
  } catch {
    return new Date();
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = PAGES.map(
    ({ url, file, priority, changeFrequency }) => ({
      url: `${BASE_URL}${url}`,
      lastModified: fileMtimeOrNow(file),
      changeFrequency,
      priority,
    })
  );

  const projectEntries: MetadataRoute.Sitemap = PROJECTS.map((p) => {
    const last =
      (p as any).updated
        ? new Date((p as any).updated)
        : p.year
        ? new Date(`${p.year}-01-01`)
        : new Date();

    return {
      url: `${BASE_URL}/projects/${p.slug}`,
      lastModified: last,
      changeFrequency: "yearly",
      priority: 0.6,
    };
  });

  return [...staticEntries, ...projectEntries];
}