import type { Metadata } from "next";
import ProductsClient from "./ProductsClient";

const SITE_URL = "https://www.fuchs-sales.ca";

export const metadata: Metadata = {
  title: "Products | Fuchs Sales & Consulting",
  description:
    "Browse manufacturers we represent and filter by solution area: insulation, connections, lifting, drainage and more.",
  alternates: { canonical: "/products" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/products`,
    title: "Products | Fuchs Sales & Consulting",
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
    title: "Products | Fuchs Sales & Consulting",
    description:
      "Filter and explore manufacturers for tilt-up and precast construction across Canada.",
    images: [`${SITE_URL}/og.jpg`],
  },
};

export default function ProductsPage() {
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Manufacturers",
        item: `${SITE_URL}/products`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <ProductsClient />
    </>
  );
}
