// data/projects.ts
import type { Manufacturer } from "./manufacturers";

export type ProjectImage = {
  src: string;          // /public/projects/...
  alt?: string;
};

export type Project = {
  slug: string;
  title: string;
  location: string;
  year?: number;
  sectors: string[];
  manufacturers: Manufacturer["id"][];
  hero: string;
  summary: string;
  gallery?: ProjectImage[];
  resources?: { title: string; href: string }[];
  tags?: string[];
};

export const PROJECTS: Project[] = [
  {
    slug: "metro-data-center-expansion",
    title: "Metro Data Center Expansion",
    location: "Vancouver, BC",
    year: 2022,
    sectors: ["Precast", "Mission Critical", "Envelope"],
    manufacturers: ["jkthermal", "abtdrains"],
    hero: "/projects/metro-dc.jpg",
    summary:
      "High-performance envelope detailing with thermal breaks and robust surface-water control in service yards.",
    gallery: [
      { src: "/projects/metro-dc.jpg", alt: "Thermal break locations" },
    ],
    tags: ["Thermal", "Drainage"],
  },
];

// simple helpers
export const ALL_SECTORS = Array.from(new Set(PROJECTS.flatMap((p) => p.sectors))).sort();
export const ALL_TAGS = Array.from(new Set(PROJECTS.flatMap((p) => p.tags ?? []))).sort();