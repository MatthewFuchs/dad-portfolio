import type { Metadata } from "next";

export const dynamic = "force-static";

const SITE_URL = "https://fuchs-sales.ca";

export const metadata: Metadata = {
  title: "Terms of Use | Fuchs Sales & Consulting",
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
  return (
    <main className="min-h-screen bg-white text-gray-900 pt-32 px-6 md:px-16 pb-10">
      <h1 className="text-4xl font-bold mb-6">Terms of Use</h1>
      <iframe
        title="Terms of Use"
        src="/legal/terms.html"
        loading="lazy"
        className="w-full h-[70vh] md:h-[calc(100vh-14rem)] border border-gray-200 rounded-xl shadow-sm"
      />
      <p className="mt-4 text-sm text-gray-600">
        If the document doesn’t load,{" "}
        <a
          href="/legal/terms.html"
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
