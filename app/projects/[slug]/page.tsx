import { jsonLdHtml } from "../../../components/JsonLd";
import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getManufacturers, getProject, getProjects } from "../../../lib/content";
import Gallery from "../../../components/Gallery";
import BuildSequence from "../../../components/BuildSequence";

const SITE_URL = "https://www.fuchs-sales.ca";

// Search snippets cut off near 155 characters: keep whole sentences that fit.
function snippet(text: string, max = 155) {
  const sentences = text.replace(/\s+/g, " ").trim().split(/(?<=\.)\s/);
  let out = "";
  for (const s of sentences) {
    if ((out + " " + s).trim().length > max) break;
    out = (out + " " + s).trim();
  }
  return out || text.slice(0, max - 1).trimEnd() + "…";
}

const projectName = (title: string) => title.split("|")[0].trim();

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return {
      title: "Project not found",
      robots: { index: false, follow: false },
      alternates: { canonical: `${SITE_URL}/projects/${slug}` },
    };
  }

  const url = `${SITE_URL}/projects/${project.slug}`;
  const heroAbs = project.hero.startsWith("http")
    ? project.hero
    : `${SITE_URL}${project.hero}`;

  const title = `${projectName(project.title)}, ${project.location}`;
  const description = snippet(project.summary);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: project.title,
      description,
      images: [{ url: heroAbs, width: 1200, height: 630, alt: project.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description,
      images: [heroAbs],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await getProject(slug);
  if (!project) return notFound();

  const mfgMap = new Map((await getManufacturers()).map((m) => [m.id, m]));
  const gallery = project.gallery ?? [];
  // Photos labelled with build stages read better as a step-through sequence.
  const staged = gallery.length >= 4 && gallery.every((g) => g.stage);

  // "Name | Focus" titles: the name heads the page, the focus leads the text.
  const [name, focus] = project.title.split("|").map((t) => t.trim());

  // JSON-LD breadcrumbs
  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: `${SITE_URL}/projects/${project.slug}`,
    image: [project.hero, ...(project.gallery ?? []).map((g) => g.src)].map(
      (src) => `${SITE_URL}${src}`
    ),
    dateCreated: project.year ? String(project.year) : undefined,
    locationCreated: { "@type": "Place", name: project.location },
    keywords: [...project.sectors, ...(project.tags ?? [])].join(", "),
    mentions: project.manufacturers
      .map((id) => mfgMap.get(id))
      .filter(Boolean)
      .map((m) => ({ "@type": "Brand", name: m!.name, url: m!.website })),
    provider: { "@id": `${SITE_URL}/#org` },
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projects",
        item: `${SITE_URL}/projects`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.title,
        item: `${SITE_URL}/projects/${project.slug}`,
      },
    ],
  };

  return (
    <div className="bg-ground text-ink">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(projectJsonLd) }}
      />

      {/* TITLE */}
      <header className="gutter pt-24 lg:pt-28 pb-8 md:pb-10 grid gap-6 md:grid-cols-12 md:gap-x-6 md:items-end">
        <h1
          className="md:col-span-8 text-[length:var(--text-head)]"
        >
          {name}
        </h1>
        <p
          className="md:col-start-9 md:col-span-4 text-soft"
        >
          {project.location}
          {project.year ? `, ${project.year}` : ""}
          <br />
          {project.sectors.join(", ")}
        </p>
      </header>

      {/* HERO PICTURE */}
      <div className="relative aspect-[4/3] md:aspect-[21/9] w-full overflow-hidden bg-surface">
        <Image
          src={project.hero}
          alt={project.title}
          fill
          sizes="100vw"
          data-parallax
          className="object-cover"
          priority
        />
      </div>

      {/* BODY */}
      <section className="gutter py-14 md:py-20 grid gap-14 md:grid-cols-12 md:gap-x-6">
        <div className="md:col-span-7">
          {focus && (
            <p
              className="text-[length:var(--text-lead)] leading-snug max-w-[40ch]"
            >
              {focus}
            </p>
          )}
          <p className="mt-6 max-w-[62ch]">
            {project.summary}
          </p>
        </div>

        <aside className="md:col-start-9 md:col-span-4">
          <h2 className="text-[length:var(--text-body)] font-medium tracking-normal">
            Products on this project
          </h2>
          <ul className="mt-5 grid grid-cols-2 gap-1.5">
            {project.manufacturers.map((id) => {
              const m = mfgMap.get(id);
              if (!m) return null;
              return (
                <li key={id}>
                  <a
                    href={m.website}
                    target="_blank"
                    rel="noreferrer"
                    className="group block"
                  >
                    <span
                      className={`relative block h-20 overflow-hidden ${
                        m.logoBgClass ?? "bg-white"
                      }`}
                    >
                      <Image
                        src={m.logoSrc}
                        alt=""
                        fill
                        sizes="200px"
                        className="object-contain p-4 transition-transform duration-500 ease-[var(--ease-out-strong)] group-hover:scale-[1.05]"
                      />
                    </span>
                    <span className="mt-2 flex min-h-11 items-center gap-1.5 text-[length:var(--text-small)] font-medium">
                      {m.name}
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
          {project.resources && project.resources.length > 0 && (
            <div className="mt-10">
              <h3 className="text-[length:var(--text-body)] font-medium tracking-normal">
                Related documents
              </h3>
              <ul className="mt-3 space-y-2">
                {project.resources.map((res) => (
                  <li key={res.href}>
                    <a
                      href={res.href}
                      className="link"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {res.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>

      {gallery.length > 0 && (
        <section className="gutter pb-16 md:pb-24">
          <h2 className="text-[length:var(--text-head)]">
            {staged ? "Start to finish" : "On site"}
          </h2>
          <div className="mt-8 md:mt-10">
            {staged ? (
              <div className="max-w-5xl">
                <BuildSequence
                  frames={gallery.map((g) => ({
                    src: g.src,
                    name: g.stage!,
                    alt: g.alt ?? g.stage!,
                    fact:
                      g === gallery[gallery.length - 1]
                        ? `${project.location}${project.year ? `, ${project.year}` : ""}`
                        : "Under construction",
                  }))}
                />
              </div>
            ) : (
              <Gallery items={gallery} />
            )}
          </div>
        </section>
      )}

      {/* CLOSE */}
      <section className="bg-olive">
        <div className="gutter py-14 md:py-20 grid gap-8 md:grid-cols-12 md:gap-x-6 md:items-end">
          <div className="md:col-span-7">
            <h2 className="text-[length:var(--text-head)]">
              Have a similar project?
            </h2>
            <p className="mt-5 max-w-[48ch]">
              We can walk your team through detailing, options and lessons
              learned on this one.
            </p>
          </div>
          <div className="md:col-start-9 md:col-span-4 md:justify-self-end">
            <a
              href="mailto:gfuchs@fuchs-sales.ca?subject=Project%20consultation%20request"
              className="btn w-full sm:w-auto"
            >
              Email Greg
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
