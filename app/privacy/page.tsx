import { jsonLdHtml } from "../../components/JsonLd";
import type { Metadata } from "next";

export const dynamic = "force-static";

const SITE_URL = "https://www.fuchs-sales.ca";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Fuchs Sales and Consulting.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/privacy`,
    title: "Privacy Policy | Fuchs Sales and Consulting",
    description: "Privacy Policy for Fuchs Sales and Consulting.",
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
    title: "Privacy Policy | Fuchs Sales and Consulting",
    description: "Privacy Policy for Fuchs Sales and Consulting.",
    images: [`${SITE_URL}/og.jpg`],
  },
};

export default function PrivacyPage() {
  // JSON-LD breadcrumbs
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Privacy Policy",
        item: `${SITE_URL}/privacy`,
      },
    ],
  };

  return (
    <div className="bg-ground text-ink gutter pt-24 lg:pt-28 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbsJsonLd) }}
      />
      <h1 className="text-[length:var(--text-head)] mb-10 md:mb-14">Privacy Policy</h1>
      <iframe
        title="Privacy Policy"
        src="/legal/privacy.html"
        loading="lazy"
        className="block w-full h-[70svh] md:h-[calc(100svh-14rem)] bg-white"
      />
      <p className="mt-5 text-[length:var(--text-small)] text-soft">
        If the document doesn’t load,{" "}
        <a
          href="/legal/privacy.html"
          target="_blank"
          rel="noopener noreferrer"
          className="link text-ink"
        >
          open it in a new tab
        </a>
        .
      </p>
    </div>
  );
}
