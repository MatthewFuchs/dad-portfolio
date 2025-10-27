import type { Metadata } from "next";
import ProjectsIndexClient from "./ProjectsIndexClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.fuchs-sales.ca";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Browse selected work by sector or manufacturer. Tilt-up & precast projects represented by Fuchs Sales & Consulting across Canada.",
  alternates: { canonical: "/projects" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/projects`,
    title: "Projects | Fuchs Sales & Consulting",
    description:
      "Browse selected work by sector or manufacturer. Industrial and commercial construction projects represented by Fuchs Sales & Consulting across Canada.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Fuchs Sales & Consulting",
    description:
      "Browse selected work by sector or manufacturer. Tilt-up & precast projects represented by Fuchs Sales & Consulting across Canada.",
  },
};

export default function ProjectsPage() {
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projects",
        item: `${SITE_URL}/projects`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <ProjectsIndexClient />
    </>
  );
}
