// The Manufacturers page, server side: search-engine details, plus loading the
// manufacturers from the admin content. ProductsClient.tsx draws the page.
import { jsonLdHtml } from "../../components/JsonLd";
import type { Metadata } from "next";
import { getManufacturers } from "../../lib/content";
import ProductsClient from "./ProductsClient";

const SITE_URL = "https://www.fuchs-sales.ca";

// What search engines and link previews show for this page.
export const metadata: Metadata = {
  title: "Construction Product Manufacturers",
  description:
    "Browse manufacturers we represent and filter by solution area: insulation, connections, lifting, drainage and more.",
  alternates: { canonical: "/products" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/products`,
    title: "Manufacturers | Fuchs Sales & Consulting",
    description:
      "Filter and explore manufacturers for tilt-up and precast construction across Canada.",
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
    title: "Manufacturers | Fuchs Sales & Consulting",
    description:
      "Filter and explore manufacturers for tilt-up and precast construction across Canada.",
    images: [`${SITE_URL}/og.jpg`],
  },
};

export default async function ProductsPage() {
  // Tells search engines where this page sits in the site. Visitors never see it.
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${SITE_URL}/products`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbsJsonLd) }}
      />
      <ProductsClient companies={await getManufacturers()} />
    </>
  );
}
