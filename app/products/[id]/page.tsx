// One manufacturer's page. The [id] folder name means this one file serves every
// manufacturer: "id" is the end of the web address, which is also the name of
// the manufacturer's file in content/manufacturers/.
//
// These pages are what search engines and AI assistants can point to when
// someone asks who represents a manufacturer in Canada, so everything important
// is plain text in the page, not hidden behind a click.
import { jsonLdHtml } from "../../../components/JsonLd";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getManufacturers, getPresentations, getProjects } from "../../../lib/content";
import Card from "../../../components/Card";
import PageHeader from "../../../components/PageHeader";
import ResourceRow from "../../../components/ResourceRow";

const SITE_URL = "https://www.fuchs-sales.ca";

type Params = { params: Promise<{ id: string }> };

const findManufacturer = async (id: string) =>
  (await getManufacturers()).find((m) => m.id === id);

// Builds a page for every manufacturer when the site is built. Any other
// address is "not found" straight away.
export async function generateStaticParams() {
  return (await getManufacturers()).map((m) => ({ id: m.id }));
}
export const dynamicParams = false;

// What search engines and link previews show for this manufacturer.
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const m = await findManufacturer((await params).id);
  if (!m) return { title: "Manufacturer not found", robots: { index: false, follow: false } };

  const url = `${SITE_URL}/products/${m.id}`;
  const title = `${m.name} in Canada`;
  const description = `Fuchs Sales & Consulting represents ${m.name} across Canada. ${m.shortInfo}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description, images: [{ url: `${SITE_URL}/og.jpg`, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [`${SITE_URL}/og.jpg`] },
  };
}

export default async function ManufacturerPage({ params }: Params) {
  const m = await findManufacturer((await params).id);
  if (!m) return notFound();

  // Everything else on the site about this company.
  const [allProjects, allPresentations] = await Promise.all([getProjects(), getPresentations()]);
  const projects = allProjects.filter((p) => p.manufacturers.includes(m.id));
  const presentations = allPresentations.filter((p) => p.brand === m.name);

  // Tells search engines what this page is about. Visitors never see it.
  const brandJsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: m.name,
    description: m.shortInfo,
    url: m.website,
    logo: `${SITE_URL}${m.logoSrc}`,
    subjectOf: { "@id": `${SITE_URL}/#org` },
  };
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Manufacturers", item: `${SITE_URL}/products` },
      { "@type": "ListItem", position: 3, name: m.name, item: `${SITE_URL}/products/${m.id}` },
    ],
  };

  return (
    <div className="bg-ground text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(brandJsonLd) }} />

      <PageHeader title={m.name} lead={`Fuchs Sales & Consulting represents ${m.name} across Canada.`} />

      {/* ABOUT */}
      <section className="gutter pb-14 md:pb-20 grid gap-8 md:grid-cols-12 md:gap-x-6">
        <div className={`relative aspect-[3/2] md:col-span-5 lg:col-span-4 ${m.logoBgClass ?? "bg-white"}`}>
          <Image
            src={m.logoSrc}
            alt={`${m.name} logo`}
            fill
            sizes="(min-width:768px) 33vw, 100vw"
            className="object-contain p-8"
            priority
          />
        </div>
        <div className="md:col-start-7 md:col-span-6">
          <p className="text-[length:var(--text-lead)] leading-snug">{m.shortInfo}</p>
          {m.categories.length > 0 && <p className="mt-2 text-soft">{m.categories.join(", ")}</p>}
          {m.innovation && <p className="mt-6 max-w-[60ch]">{m.innovation}</p>}
          <a href={m.website} target="_blank" rel="noopener noreferrer" className="btn mt-8">
            Visit {m.name} <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </section>

      {/* DOCUMENTS */}
      {m.resources.length > 0 && (
        <section className="gutter pb-14 md:pb-20">
          <h2 className="text-[length:var(--text-head)]">Documents</h2>
          <ul className="mt-6 bg-surface px-4 sm:px-6 py-2">
            {m.resources.map((r) => (
              <ResourceRow key={r.id} {...r} />
            ))}
          </ul>
        </section>
      )}

      {/* PROJECTS */}
      {projects.length > 0 && (
        <section className="gutter pb-14 md:pb-20">
          <h2 className="text-[length:var(--text-head)]">Projects</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <li key={p.slug}>
                <Card
                  href={`/projects/${p.slug}`}
                  title={p.title.split("|")[0].trim()}
                  meta={`${p.location}${p.year ? `, ${p.year}` : ""}`}
                  cue="View project"
                  image={{ src: p.hero, alt: p.title }}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* PRESENTATIONS */}
      {presentations.length > 0 && (
        <section className="gutter pb-14 md:pb-20">
          <h2 className="text-[length:var(--text-head)]">Presentations</h2>
          <ul className="mt-6 space-y-1.5 max-w-3xl">
            {presentations.map((p) => (
              <li key={p.id}>
                {p.title.split("|")[0].trim()}
              </li>
            ))}
          </ul>
          <Link
            href={`/presentations?manufacturer=${encodeURIComponent(m.name)}`}
            className="btn btn-ghost mt-6 w-full sm:w-auto"
          >
            See {m.name} presentations
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>
      )}

      {/* CLOSE */}
      <section className="bg-olive">
        <div className="gutter py-14 md:py-20 grid gap-8 md:grid-cols-12 md:gap-x-6 md:items-end">
          <div className="md:col-span-7">
            <h2 className="text-[length:var(--text-head)]">Looking for {m.name} products?</h2>
            <p className="mt-5 max-w-[48ch]">
              Ask us about availability, specifications or a product for your project.
            </p>
          </div>
          <div className="md:col-start-9 md:col-span-4 md:justify-self-end">
            <Link
              href={`/contact?about=${encodeURIComponent(`Question about ${m.name}`)}`}
              className="btn btn-dark w-full sm:w-auto"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
