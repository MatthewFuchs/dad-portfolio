// The Resources page, server side: search-engine details, plus loading each
// manufacturer's documents from the admin content. ResourcesClient.tsx draws the page.
import { jsonLdHtml } from "../../components/JsonLd";
import type { Metadata } from "next";
import { getManufacturers } from "../../lib/content";
import ResourcesClient from "./ResourcesClient";

// The live site redirects the bare domain to www, so www is canonical.
const SITE_URL = "https://www.fuchs-sales.ca";

// What search engines and link previews show for this page.
export const metadata: Metadata = {
  title: "Technical Data Sheets & Brochures",
  description:
    "Download brochures, specifications, installation guides, and technical documents from the manufacturers we represent.",
  alternates: { canonical: `${SITE_URL}/resources` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/resources`,
    title: "Resources | Fuchs Sales & Consulting",
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
    title: "Resources | Fuchs Sales & Consulting",
    description:
      "Download brochures, specifications, installation guides, and technical documents from the manufacturers we represent.",
    images: [`${SITE_URL}/og.jpg`],
  },
};

export default async function ResourcesPage() {
  // Tells search engines where this page sits in the site. Visitors never see it.
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
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbsJsonLd) }}
      />
      <ResourcesClient manufacturers={await getManufacturers()} />
    </>
  );
}
