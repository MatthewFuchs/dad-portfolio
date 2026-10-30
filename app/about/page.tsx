// The About page. None of this comes from the admin: to change the wording or
// the photo, edit this file.
import { jsonLdHtml } from "../../components/JsonLd";
import type { Metadata } from "next";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";

const SITE_URL = "https://www.fuchs-sales.ca";
const EMAIL = "gfuchs@fuchs-sales.ca";
const PHONE_TEL = "+17782416316";

// What search engines and link previews show for this page.
export const metadata: Metadata = {
  title: "About Greg Fuchs",
  description:
    "About Fuchs Sales & Consulting — who we are, what we do, and how to reach us.",
  alternates: { canonical: `${SITE_URL}/about` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/about`,
    title: "About | Fuchs Sales & Consulting",
    description:
      "About Fuchs Sales & Consulting — who we are, what we do, and how to reach us.",
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
    title: "About | Fuchs Sales & Consulting",
    description:
      "About Fuchs Sales & Consulting — who we are, what we do, and how to reach us.",
    images: [`${SITE_URL}/og.jpg`],
  },
};

export default function AboutPage() {
  // JSON-LD: breadcrumbs
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "About",
        item: `${SITE_URL}/about`,
      },
    ],
  };

  // JSON-LD: AboutPage + Person
  const aboutPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About | Fuchs Sales & Consulting",
    url: `${SITE_URL}/about`,
    primaryImageOfPage: { "@type": "ImageObject", url: `${SITE_URL}/og.jpg` },
    about: {
      "@type": "Organization",
      name: "Fuchs Sales & Consulting",
      url: SITE_URL,
      logo: `${SITE_URL}/fuchs.png`,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "sales",
          telephone: "+1-778-241-6316",
          email: EMAIL,
          areaServed: "CA",
          availableLanguage: ["en"],
        },
      ],
    },
    mainEntity: {
      "@type": "Person",
      name: "Greg Fuchs",
      jobTitle: "President",
      email: EMAIL,
      telephone: "+1-778-241-6316",
      image: `${SITE_URL}/team/greg.jpg`,
      worksFor: {
        "@type": "Organization",
        name: "Fuchs Sales & Consulting",
        url: SITE_URL,
      },
      sameAs: [
        "https://www.linkedin.com/in/gregory-fuchs-5338b121/?originalSubdomain=ca",
      ],
    },
  };

  return (
    <div className="bg-ground text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(aboutPageJsonLd) }}
      />

      <section className="gutter pt-24 lg:pt-28 pb-14 md:pb-20 grid gap-12 md:grid-cols-12 md:gap-x-6">
        <div className="md:col-span-6 lg:col-span-5">
          <h1 className="text-[length:var(--text-display)] leading-[0.98] tracking-[-0.035em]">
            Greg Fuchs
          </h1>
          <p className="mt-4 text-[length:var(--text-lead)] leading-snug">
            President, Fuchs Sales &amp; Consulting. Representing manufacturers
            across Canada since 2010.
          </p>
          <div
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3"
          >
            <a href={`mailto:${EMAIL}`} className="btn">
              <Mail className="h-4 w-4" aria-hidden />
              Email us
            </a>
            <a href={`tel:${PHONE_TEL}`} className="link inline-flex min-h-11 items-center gap-2 font-medium">
              <Phone className="h-4 w-4" aria-hidden />
              +1 (778) 241-6316
            </a>
          </div>
        </div>
        <div
          className="order-first md:order-none md:col-start-8 md:col-span-5 lg:col-start-8 lg:col-span-4"
        >
          <div className="relative aspect-square md:aspect-[4/5] overflow-hidden bg-surface">
            <Image
              src="/team/greg.jpg"
              alt="Greg Fuchs"
              fill
              sizes="(min-width:768px) 33vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <figure className="gutter py-14 md:py-20 grid gap-8 md:grid-cols-12 md:gap-x-6">
          <blockquote className="md:col-span-8">
            <p className="text-[length:var(--text-lead)] md:text-[2rem] leading-[1.2] tracking-[-0.02em] max-w-[40ch]">
              “Partnering with manufacturers that provide expert technical
              support, reliable products and innovative solutions is our
              biggest asset.”
            </p>
          </blockquote>
          <figcaption className="md:col-start-9 md:col-span-4 md:self-end text-soft">
            Greg Fuchs
          </figcaption>
        </figure>
      </section>

      <section className="gutter py-14 md:py-20 grid gap-14 md:grid-cols-12 md:gap-x-6">
        <div className="md:col-span-5">
          <h2 className="text-[length:var(--text-lead)] tracking-[-0.02em]">
            The company
          </h2>
          <div className="mt-5 space-y-4 max-w-[56ch]">
            <p>
              Fuchs Sales &amp; Consulting represents manufacturers across
              Canada. Designers, owners and contractors rely on our product
              knowledge to make the right recommendation.
            </p>
            <p>
              Since 2010 we have worked with responsible, innovative companies
              in our chosen markets. Those partnerships, and our responsiveness
              and professionalism, have built a diverse product offering that
              gives design, owner and contractor partners several solutions.
            </p>
          </div>
        </div>
        <div className="md:col-start-7 md:col-span-6 lg:col-start-8 lg:col-span-5">
          <h2 className="text-[length:var(--text-lead)] tracking-[-0.02em]">
            Greg
          </h2>
          <div className="mt-5 space-y-4 max-w-[56ch]">
            <p>
              In January 2010, Greg partnered with the company’s first
              manufacturing partner, Fabrikem Manufacturing, and founded the
              business.
            </p>
            <p>
              He combines day-to-day leadership of the business with a
              continued focus on sales and service across the complete product
              line in Canada. He holds a degree in Economics and Business from
              the University of Alberta and has lived in British Columbia for
              the past 15 years. In his spare time he is with family and
              friends, playing hockey and staying active.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
