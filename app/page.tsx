import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PROJECTS } from "../data/projects";
import { MANUFACTURERS } from "../data/manufacturers";
import HeroVideo from "../components/HeroVideo";
import Card from "../components/Card";

export const metadata: Metadata = {
  title: { absolute: "Fuchs Sales & Consulting | Technical Sales in Canada" },
  description:
    "Technical sales & manufacturer representation for commercial and industrial construction across Canada, specializing in tilt-up and precast.",
  alternates: { canonical: "/" },
  keywords: [
    "technical sales",
    "manufacturer representation",
    "tilt-up",
    "precast",
    "concrete",
    "construction",
    "Canada",
    "specification support",
    "distribution",
    "commercial construction",
    "industrial construction",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      ["max-snippet"]: -1,
      ["max-image-preview"]: "large",
      ["max-video-preview"]: -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Fuchs Sales & Consulting",
    title: "Fuchs Sales & Consulting | Technical Sales in Canada",
    description:
      "Technical sales & manufacturer representation for commercial and industrial construction across Canada.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Fuchs Sales & Consulting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fuchs Sales & Consulting | Technical Sales in Canada",
    description:
      "Technical sales & manufacturer representation for commercial and industrial construction across Canada.",
    images: ["/og.jpg"],
  },
};

const SERVICES = [
  {
    name: "Specification",
    items: [
      "Technical presentations",
      "Lunch and learns",
      "Spec reviews",
      "Detailing support",
      "Training for design teams",
    ],
    text: "We bring manufacturers to design teams early, through technical presentations and product training, so the right product is written into the specification.",
  },
  {
    name: "Distribution",
    items: [
      "Regional distributors",
      "National distributors",
      "Product availability",
      "Supply coordination",
    ],
    text: "Our regional and national distribution partners keep product in stock and close to the job, with sales support behind every order.",
  },
  {
    name: "Sales",
    items: [
      "General contractors",
      "Tilt-up and precast trades",
      "Product knowledge",
      "Site and install support",
    ],
    text: "We work directly with general and specialty contractors, answering the technical questions that close the order and get it installed right.",
  },
];

const FIGURES = [
  { figure: "2010", text: "Founded, with Fabrikem as the first partner" },
  { figure: String(MANUFACTURERS.length), text: "Manufacturers represented" },
  { figure: "8", text: "Technical presentations to book" },
  { figure: "0", text: "Retainers: commission only" },
];

// Secondary button on photographs: white outline, fills white on hover.
const onPhotoGhost =
  "btn [--btn-bg:transparent] [--btn-fg:#fff] [--btn-line:#fff] [--btn-hover:#fff] [--btn-hover-fg:var(--color-ink)]";

export default function HomePage() {
  const featured = [...PROJECTS]
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    .slice(0, 3);

  return (
    <div className="bg-ground text-ink">
      {/* HERO */}
      <section className="relative h-svh min-h-[560px] w-full overflow-hidden bg-ink text-white">
        <HeroVideo />
        <div className="absolute inset-0 bg-black/50" />

        <div className="gutter relative z-10 flex h-full flex-col justify-end pb-[8svh]">
          <h1 className="text-[length:var(--text-display)] leading-[0.98] tracking-[-0.035em]">
            Fuchs Sales
            <br />
            &amp; Consulting
          </h1>
          <p className="mt-6 max-w-[34ch] text-[length:var(--text-lead)] leading-snug">
            Technical sales and marketing for commercial and industrial
            construction in Canada.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="btn btn-light">
              Talk to Greg
            </Link>
            <Link href="/projects" className={onPhotoGhost}>
              See projects
            </Link>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="pt-16 md:pt-24">
        <div className="gutter">
          <h2 className="text-[length:var(--text-head)]">From spec to install.</h2>
          <div className="mt-5 grid gap-x-12 gap-y-2 text-soft sm:grid-cols-2 sm:max-w-3xl">
            <p>Commission only. Manufacturers pay for results, never for a retainer.</p>
            <p>
              Based in British Columbia, working with design teams,
              distributors and contractors across Canada.
            </p>
          </div>
        </div>
        <div className="relative mt-8 aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] w-full overflow-hidden bg-surface">
          <Image
            src="/projects/seaborne-tilt-up/seaborne-1.jpg"
            alt="Tilt-up panels formed on the slab at the Seaborne project in Coquitlam"
            fill
            sizes="100vw"
            data-parallax
            className="object-cover"
          />
        </div>
        <div className="gutter mt-10 md:mt-14 grid gap-6 md:grid-cols-2 md:gap-12">
          <p className="text-[length:var(--text-lead)] leading-snug">
            Manufacturers turn their sales and marketing budget into a cost
            that only arrives when product sells.
          </p>
          <p>
            Our relationships with designers, distributors and contractors
            carry a product through the full sales cycle. We specialize in
            cast-in-place and precast construction materials, and we work with
            manufacturers who keep innovating and stand behind reliable,
            cost-effective products.
          </p>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="gutter py-16 md:py-24">
        <h2 className="text-[length:var(--text-head)]">What we do</h2>
        <div className="mt-8 md:mt-12 grid gap-4 md:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.name} className="bg-surface p-5 sm:p-6">
              <h3 className="text-[length:var(--text-lead)] tracking-[-0.02em]">
                {s.name}
              </h3>
              <p className="mt-3">{s.text}</p>
              <ul className="mt-4 space-y-1.5 text-[length:var(--text-small)]">
                {s.items.map((it) => (
                  <li key={it} className="flex items-baseline gap-2.5">
                    <span aria-hidden className="h-0.5 w-3 shrink-0 translate-y-[-0.2em] bg-olive-ink" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Link href="/presentations" className="btn btn-ghost mt-6 w-full sm:w-auto">
          See the 8 presentations
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>

      {/* PROJECTS */}
      <section className="bg-surface py-16 md:py-24">
        <div className="gutter">
          <h2 className="text-[length:var(--text-head)]">Recent projects</h2>
          <p className="mt-3 max-w-[44ch] text-soft">
            Every project here has a product we represent cast, buried or
            bolted into it.
          </p>
          <ul className="mt-8 md:mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
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
          <Link href="/projects" className="btn btn-ghost mt-6 w-full sm:w-auto">
            All projects
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* FIGURES */}
      <section className="bg-olive py-14 md:py-20">
        <ul className="gutter grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {FIGURES.map((f) => (
            <li key={f.figure}>
              <span className="block text-[length:var(--text-head)] leading-none tabular-nums tracking-[-0.03em]">
                {f.figure}
              </span>
              <span className="mt-2 block text-[length:var(--text-small)] leading-snug">
                {f.text}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* PARTNERS */}
      <section className="gutter py-16 md:py-24">
        <h2 className="text-[length:var(--text-head)]">Who we represent</h2>
        <ul className="mt-8 md:mt-12 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {MANUFACTURERS.map((m) => (
            <li key={m.id}>
              <Link
                href={`/products`}
                aria-label={`${m.name}: see manufacturers`}
                className={`group relative block aspect-[3/2] overflow-hidden transition-transform active:scale-[0.98] ${
                  m.logoBgClass ?? "bg-white"
                }`}
              >
                <Image
                  src={m.logoSrc}
                  alt={`${m.name} logo`}
                  fill
                  sizes="(min-width:1024px) 18vw, 45vw"
                  className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.05]"
                />
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/products" className="btn btn-ghost mt-6 w-full sm:w-auto">
          See all manufacturers
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>

      {/* CLOSING */}
      <section className="relative bg-ink text-white md:h-[78svh] md:min-h-[560px]">
        <div className="relative h-[55svh] md:absolute md:inset-0 md:h-full overflow-hidden">
          <Image
            src="/projects/east-village-qb/IMG_2107.jpg"
            alt="Finished street at East Village, Qualicum Beach, with Permavoid under the new trees"
            fill
            sizes="100vw"
            data-parallax
            className="object-cover brightness-[0.5]"
          />
        </div>
        <div className="gutter relative py-12 md:absolute md:inset-0 md:grid md:grid-cols-12 md:items-end md:pb-[12svh]">
          <div className="md:col-start-6 md:col-span-7 lg:col-start-8 lg:col-span-5">
            <h2 className="text-[length:var(--text-head)] leading-[1.02]">
              Have a product to place?
            </h2>
            <p className="mt-4 max-w-[42ch]">
              Tell us what you make and where it belongs. We will tell you who
              in Canada needs to hear about it, and take it to them.
            </p>
            <Link href="/contact" className="btn btn-light mt-7 w-full sm:w-auto">
              Talk to Greg
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
