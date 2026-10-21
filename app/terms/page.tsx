import { jsonLdHtml } from "../../components/JsonLd";
import type { Metadata } from "next";

export const dynamic = "force-static";

// The live site redirects the bare domain to www, so www is canonical.
const SITE_URL = "https://www.fuchs-sales.ca";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of Use for Fuchs Sales & Consulting.",
  alternates: { canonical: `${SITE_URL}/terms` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/terms`,
    title: "Terms of Use | Fuchs Sales & Consulting",
    description: "Terms of Use for Fuchs Sales & Consulting.",
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
    title: "Terms of Use | Fuchs Sales & Consulting",
    description: "Terms of Use for Fuchs Sales & Consulting.",
    images: [`${SITE_URL}/og.jpg`],
  },
};

export default function TermsPage() {
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Terms of Use",
        item: `${SITE_URL}/terms`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbsJsonLd) }}
      />
      <div className="bg-ground text-ink gutter pt-24 lg:pt-28 pb-20">
        <h1 className="text-[length:var(--text-head)] mb-10 md:mb-14">Terms of Use</h1>
        <iframe
          title="Terms of Use"
          src="/legal/terms.html"
          loading="lazy"
          className="block w-full h-[70svh] md:h-[calc(100svh-14rem)] bg-white"
        />
        <p className="mt-5 text-[length:var(--text-small)] text-soft">
          If the document doesn’t load,{" "}
          <a
            href="/legal/terms.html"
            target="_blank"
            rel="noopener noreferrer"
            className="link text-ink"
          >
            open it in a new tab
          </a>
          .
        </p>
      </div>
    </>
  );
}
