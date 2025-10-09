import type { Metadata } from "next";

export const dynamic = "force-static";

const SITE_URL = "https://www.fuchs-sales.ca";

export const metadata: Metadata = {
  title: "Privacy Policy | Fuchs Sales and Consulting",
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
    <main className="min-h-screen bg-white text-gray-900 pt-32 px-6 md:px-16 pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <iframe
        title="Privacy Policy"
        src="/legal/privacy.html"
        loading="lazy"
        className="w-full h-[70vh] md:h-[calc(100vh-14rem)] border border-gray-200 rounded-xl shadow-sm"
      />
      <p className="mt-4 text-sm text-gray-600">
        If the document doesn’t load,{" "}
        <a
          href="/legal/privacy.html"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          open it in a new tab
        </a>
        .
      </p>
    </main>
  );
}
