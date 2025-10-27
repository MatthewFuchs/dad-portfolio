import type { Metadata } from "next";
import PresentationsClient from "./PresentationsClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.fuchs-sales.ca";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Technical Presentations | Fuchs Sales & Consulting",
  description:
    "Filter and register for technical presentations on thermal breaks, blue-green roofs, storm water management, and more from our manufacturer partners.",
  alternates: { canonical: `${SITE_URL}/presentations` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/presentations`,
    title: "Technical Presentations | Fuchs Sales & Consulting",
    description:
      "Explore and register for technical presentations across building envelope, thermal breaks, resilient cities, and storm water management.",
    images: [
      {
        url: `${SITE_URL}/og.jpg`,
        width: 1200,
        height: 630,
        alt: "Fuchs Sales & Consulting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Technical Presentations | Fuchs Sales & Consulting",
    description:
      "Explore and register for technical presentations across building envelope, thermal breaks, resilient cities, and storm water management.",
    images: [`${SITE_URL}/og.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export default function PresentationsPage() {
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Presentations",
        item: `${SITE_URL}/presentations`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <PresentationsClient />
    </>
  );
}
