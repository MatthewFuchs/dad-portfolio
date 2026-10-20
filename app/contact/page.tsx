// app/contact/page.tsx
import type { Metadata } from "next";
import EmailForm from "../../components/EmailForm";

const SITE_URL = "https://www.fuchs-sales.ca";

export const metadata: Metadata = {
  title: "Contact",
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
    <div className="bg-ground text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />

      <section className="gutter pt-24 lg:pt-28 pb-16 md:pb-24 grid gap-14 md:grid-cols-12 md:gap-x-6">
        <div className="md:col-span-5">
          <h1 className="text-[length:var(--text-display)] leading-[0.98] tracking-[-0.035em]">
            Talk to Greg
          </h1>
          <p className="mt-5 text-[length:var(--text-lead)] leading-snug max-w-[34ch]">
            Representation, a product question or a project in tilt-up or
            precast. We reply promptly.
          </p>
          <ul className="mt-10 space-y-2 text-[length:var(--text-lead)] tracking-[-0.02em]">
            <li>
              <a href="mailto:gfuchs@fuchs-sales.ca" className="link inline-flex min-h-11 items-center text-olive-ink">
                gfuchs@fuchs-sales.ca
              </a>
            </li>
            <li>
              <a href="tel:+17782416316" className="link inline-flex min-h-11 items-center text-olive-ink">
                +1 (778) 241-6316
              </a>
            </li>
            <li className="text-soft">British Columbia, Canada</li>
          </ul>
        </div>

        <div className="md:col-start-7 md:col-span-6 bg-surface p-6 sm:p-10">
          <h2 className="text-[length:var(--text-lead)] tracking-[-0.02em]">
            Send a message
          </h2>
          <div className="mt-6">
            <EmailForm />
          </div>
        </div>
      </section>
    </div>
  );
}
