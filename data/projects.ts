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
    slug: "east-village-qualicum-beach",
    title: "East Village | Qualicum Beach",
    location: "Qualicum Beach, BC",
    year: 2022,
    sectors: ["Drainage", "Landscape Architecture"],
    manufacturers: ["abtdrains"],
    hero: "/projects/east-village-qb/IMG_2107.jpg",
    summary:
      "ABT Permavoid is used on the North side of the street to collect surface storm water.  Water is stored in Permavoid and uses patented capillary action to provide water to the trees during drought periods.  Once the water reservoir is full, storm water is released to the municipal collection system through control structures.  Permavoid can support traffic loads while providing a truly sustainable method to manage storm water, excelerating bio mass and reducing storm water management.  Contract Fuchs Sales & Consulting to learn the many ways Permavoid can be used to reduce storm water run-off and prioritize storm water as a resource.",
    gallery: [
      { src: "/projects/east-village-qb/IMG_2107.jpg", alt: "Finished Project" },
      { src: "/projects/east-village-qb/IMG_2109.jpg", alt: "Finished Project" },
      { src: "/projects/east-village-qb/IMG_2111.jpg", alt: "Finished Project" },
      { src: "/projects/east-village-qb/IMG_2927.jpg", alt: "Finished Project" },
      { src: "/projects/east-village-qb/IMG_2928.jpg", alt: "Finished Project" },
    ],
    tags: ["Drainage", "Sustainable Development", "Tree Pits"],
  },
  {
    slug: "cloverdale-athletic-park-soccer-clubhouse",
    title: "Cloverdale Athletic Park Soccer Clubhouse | Tree Pits",
    location: "Surrey, BC",
    year: 2021,
    sectors: ["Drainage", "Landscape Architecture"],
    manufacturers: ["abtdrains"],
    hero: "/projects/cloverdale-athletic-park-soccer-clubhouse/IMG_0191.jpg",
    summary:
      "ABT Permavoid is used under trees to store and provide passive irrigation.  Water is collected from catch basins and roof leaders on the adjacent paved surfaces and building and directed to Permavoid for storage and to irrigate the trees.  Once the Permavoid storage tank is full, water is directed through a control structure and slowly released to the city storm system.",
    gallery: [
      { src: "/projects/cloverdale-athletic-park-soccer-clubhouse/IMG_0191.jpg", alt: "Finished Project" },
      { src: "/projects/cloverdale-athletic-park-soccer-clubhouse/IMG_0072.jpg", alt: "Under Construction" },
      { src: "/projects/cloverdale-athletic-park-soccer-clubhouse/IMG_0073.jpg", alt: "Under Construction" },
      { src: "/projects/cloverdale-athletic-park-soccer-clubhouse/IMG_0077.jpg", alt: "Under Construction" },
      { src: "/projects/cloverdale-athletic-park-soccer-clubhouse/IMG_0089.jpg", alt: "Under Construction" },
      { src: "/projects/cloverdale-athletic-park-soccer-clubhouse/IMG_0092.jpg", alt: "Under Construction" },
      { src: "/projects/cloverdale-athletic-park-soccer-clubhouse/IMG_0095.jpg", alt: "Under Construction" },
    ],
    tags: ["Sustainable Development", "Storm Water Management", "Tree Pits"],
  },
];

// simple helpers
export const ALL_SECTORS = Array.from(new Set(PROJECTS.flatMap((p) => p.sectors))).sort();
export const ALL_TAGS = Array.from(new Set(PROJECTS.flatMap((p) => p.tags ?? []))).sort();