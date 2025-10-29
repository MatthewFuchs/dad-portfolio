import type { Metadata } from "next";
import ResourcesClient from "./ResourcesClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.fuchs-sales.ca";

export const metadata: Metadata = {
  title: "Learning Resources | Fuchs Sales & Consulting",
  description:
    "Download brochures, specifications, installation guides, and technical documents from the manufacturers we represent.",
  alternates: { canonical: `${SITE_URL}/resources` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/resources`,
    title: "Learning Resources | Fuchs Sales & Consulting",
    description:
      "Download brochures, specifications, installation guides, and technical documents from the manufacturers we represent.",
    images: [
      {
        url: `${SITE_URL}/og.jpg`,
        width: 1200,
        height: 630,
        alt: "Fuchs Sales",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Learning Resources | Fuchs Sales & Consulting",
    description:
      "Download brochures, specifications, installation guides, and technical documents from the manufacturers we represent.",
    images: [`${SITE_URL}/og.jpg`],
  },
};

export default function ResourcesPage() {
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Resources",
        item: `${SITE_URL}/resources`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <ResourcesClient />
    </>
  );
}
