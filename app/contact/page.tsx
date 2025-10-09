// app/contact/page.tsx
import type { Metadata } from "next";
import EmailForm from "../../components/EmailForm";

const SITE_URL = "https://www.fuchs-sales.ca";

export const metadata: Metadata = {
  title: "Contact | Fuchs Sales and Consulting",
  description:
    "Get in touch about manufacturer representation, tilt-up and precast consulting.",
  alternates: { canonical: `${SITE_URL}/contact` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/contact`,
    title: "Contact | Fuchs Sales and Consulting",
    description:
      "Get in touch about manufacturer representation, tilt-up and precast consulting.",
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
    title: "Contact | Fuchs Sales and Consulting",
    description:
      "Get in touch about manufacturer representation, tilt-up and precast consulting.",
    images: [`${SITE_URL}/og.jpg`],
  },
};

export default function ContactPage() {
  // JSON-LD: breadcrumbs
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Contact",
        item: `${SITE_URL}/contact`,
      },
    ],
  };

  // JSON-LD: ContactPage entity
  const contactPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact | Fuchs Sales and Consulting",
    url: `${SITE_URL}/contact`,
    about:
      "Get in touch about manufacturer representation, tilt-up and precast consulting.",
    primaryImageOfPage: { "@type": "ImageObject", url: `${SITE_URL}/og.jpg` },
    publisher: {
      "@type": "Organization",
      name: "Fuchs Sales and Consulting Limited",
      url: SITE_URL,
      logo: `${SITE_URL}/fuchs.png`,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "sales",
          telephone: "+1-778-241-6316",
          email: "gfuchs@fuchs-sales.ca",
          areaServed: "CA",
          availableLanguage: ["en"],
        },
      ],
    },
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 pt-32 px-6 md:px-16 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />

      <h1 className="text-4xl font-bold mb-4">Contact</h1>
      <p className="text-gray-700 mb-10">
        Ready to talk representation or a project in tilt-up / precast? Reach
        out and we’ll respond promptly.
      </p>

      <section className="rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Send a quick message</h2>
        <EmailForm />
      </section>
    </main>
  );
}
