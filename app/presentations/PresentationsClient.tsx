"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Mail } from "lucide-react";
import FilterBar from "@/components/FilterBar";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-static";

type Presentation = {
  id: string;
  title: string;
  blurb: string;
  banner: string;
  tags: string[];
  brand?: string;
  bannerFit?: "cover" | "contain";
  bannerAspect?: string;
  objectPosition?: string;
};

const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "gfuchs@fuchs-sales.ca";

const PRESENTATIONS: Presentation[] = [
  {
    id: "leviat-hit-thermal-breaks",
    title: "Structural Thermal Breaks | Insulated Balcony Connections",
    blurb:
      "The Green Building movement is raising the bar for energy performance. Learn how thermal bridging impacts whole-building efficiency and how Leviat’s HIT system addresses it with structural, thermally efficient balcony connections.",
    banner: "/presentations/structural-thermal-breaks.jpg",
    tags: [
      "LEVIAT",
      "Halfen",
      "Structural Engineering",
      "Building Envelope",
      "Thermal Breaks",
      "Insulation",
      "Architecture",
    ],
    brand: "LEVIAT",
    bannerFit: "contain",
    bannerAspect: "aspect-[21/9] md:aspect-[21/9]",
    objectPosition: "object-center",
  },

  {
    id: "abt-permavoid-blue-green-roofs",
    title: "Designing Blue-Green Connected Roofs for Resilient Cities",
    blurb:
      "Using ABT Permavoid, create circular, nature-based solutions that catch, store, and reuse rainwater where it falls. Explore blue-green roofs, podiums, urban trees, sports fields and SUDS to build resilient cities.",
    banner: "/presentations/blue-green-connected-roofs.jpg",
    tags: [
      "ABT",
      "Permavoid",
      "Storm Water Management",
      "Resilient Cities",
      "Building Envelope",
      "Civil Engineering",
      "Architecture",
    ],
    brand: "ABT",
  },

  {
    id: "handling-graffiti-masonry-concrete",
    title:
      "Handling Graffiti on Masonry & Concrete | Innovations in Graffiti Control",
    blurb:
      "Graffiti vandalism poses a persistent challenge for masonry and concrete assets. This session covers new-generation coatings—from sacrificial barriers to durable, breathable permanent systems—designed to prevent and simplify removal on porous mineral substrates. We’ll review materials science, real-world case studies, and performance data to help you select systems that protect architectural integrity, enhance durability, and reduce lifecycle maintenance costs.",
    banner: "/presentations/handling-graffiti.png",
    tags: ["Fabrikem", "Architecture", "Building Envelope", "Graffiti Control"],
    brand: "Fabrikem",
    bannerFit: "contain",
    bannerAspect: "aspect-[21/9] md:aspect-[21/9]",
    objectPosition: "object-center",
  },

  {
    id: "eliminating-thermal-bridges-ica",
    title:
      "Eliminating Thermal Bridges in Insulated Concrete Assemblies | Design Strategies for High Performance Envelopes",
    blurb:
      "Thermal bridging remains a key obstacle to true efficiency in concrete envelopes. This presentation explores strategies to maintain continuous insulation in precast and cast-in-place systems, including advanced connectors, detailing methods aligned with modern energy codes, and guidance for evaluating performance/cost/constructability trade-offs.",
    banner: "/presentations/eliminating-thermal-bridges.png",
    tags: ["JK Thermal", "Architecture", "Building Envelope"],
    brand: "JK Thermal",
    bannerFit: "contain",
    bannerAspect: "aspect-[21/9] md:aspect-[21/9]",
    objectPosition: "object-center",
  },

  {
    id: "advanced-anchor-channel-connections",
    title: "Advanced Cast In Place Anchor Channel Connections",
    blurb:
      "Anchor channels offer adjustable, reliable cast-in-place connections. This introduction covers configurations, typical applications, and a high-level overview of ICC design methodology—contrasting benefits over weld plates and post-installed anchors for speed, tolerance, and safety.",
    banner: "/presentations/advanced-anchor-channel-connections.png",
    tags: [
      "LEVIAT",
      "Halfen",
      "Structural Engineering",
      "Architecture",
      "Anchor Channel",
      "Structural Connections",
    ],
    brand: "LEVIAT",
    bannerFit: "contain",
    bannerAspect: "aspect-[21/9] md:aspect-[21/9]",
    objectPosition: "object-center",
  },

  {
    id: "alternative-pour-strips-expansion-joints",
    title: "Alternative Designs for Pour Strips and Expansion Joints",
    blurb:
      "Overview of expansion, movement, and temporary joints in modern concrete construction. We’ll examine challenges for contractors and how Leviat’s Shear and Lockable Dowels can offer time savings, improved safety, and added flexibility across building types.",
    banner: "/presentations/alternative-pour-strips-expansion-joints.png",
    tags: [
      "LEVIAT",
      "Halfen",
      "Structural Engineering",
      "Architecture",
      "Concrete Joints",
      "Structural Connections",
    ],
    brand: "LEVIAT",
    bannerFit: "contain",
    bannerAspect: "aspect-[21/9] md:aspect-[21/9]",
    objectPosition: "object-center",
  },

  {
    id: "alternative-solutions-concrete-corbels",
    title: "Alternative Solutions to Traditional Concrete Corbels",
    blurb:
      "Traditional corbels are labor-intensive and costly. This session introduces the Meadow Burke Rapid Lok Ultimate as a safer, more efficient alternative—covering applications, capacities, and guidance on detailing it into upcoming projects.",
    banner: "/presentations/alternative-solutions-concrete-corbels.png",
    tags: [
      "LEVIAT",
      "Meadow Burke",
      "Structural Engineering",
      "Architecture",
      "Concrete Corbels",
      "Structural Connections",
    ],
    brand: "Meadow Burke",
    bannerFit: "contain",
    bannerAspect: "aspect-[21/9] md:aspect-[21/9]",
    objectPosition: "object-center",
  },

  {
    id: "energy-efficient-sandwich-panel-anchors",
    title: "Energy Efficient Sandwich Panel Anchors",
    blurb:
      "With stricter energy codes and sustainability targets, integrally-insulated concrete panels are a compelling solution. Learn how Thermomass fiber composite connectors improve thermal efficiency over steel and reliability over plastic, plus concepts of bridging in insulated walls, anchor types, panel detailing considerations, and analysis tools for design.",
    banner: "/presentations/energy-efficient-sandwich-panel-anchors.png",
    tags: [
      "LEVIAT",
      "Thermomass",
      "Structural Engineering",
      "Architecture",
      "Building Envelope",
      "Structural Connections",
    ],
    brand: "Thermomass",
    bannerFit: "contain",
    bannerAspect: "aspect-[21/9] md:aspect-[21/9]",
    objectPosition: "object-center",
  },
];

const cx = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

export default function PresentationsPage() {
  const [active, setActive] = useState<string[]>([]);
  const [open, setOpen] = useState<Set<string>>(new Set());

  const brands = useMemo(
    () =>
      Array.from(
        new Set(PRESENTATIONS.map((p) => p.brand).filter(Boolean) as string[])
      ).sort(),
    []
  );

  const filtered = useMemo(() => {
    if (active.length === 0) return PRESENTATIONS;
    return PRESENTATIONS.filter((p) => p.brand && active.includes(p.brand));
  }, [active]);

  const toggle = (id: string) =>
    setOpen((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="bg-ground text-ink">
      <PageHeader
        title="Presentations"
        lead="Eight technical sessions for architects, engineers and contractors. Pick one and request a time for your team."
      />

      <section className="gutter">
        <FilterBar
          title="Filter by manufacturer"
          allLabel="All"
          options={brands}
          active={active}
          onChange={setActive}
          multi
        />
      </section>

      <section className="gutter pt-8 md:pt-12 pb-20 md:pb-24">
        <ul className="grid gap-4 md:grid-cols-2">
          {filtered.map((p, i) => {
            const [title, subtitle] = p.title.split("|").map((t) => t.trim());
            const subject = `Presentation request: ${p.title}`;
            const body = [
              "Hi Greg,",
              "",
              `I'd like to register for “${p.title}”.`,
              "Company / team:",
              "-",
              "Preferred dates/times:",
              "-",
              "",
            ].join("\n");
            const fit = p.bannerFit ?? "cover";
            const expanded = open.has(p.id);

            return (
              <li key={p.id} className="flex flex-col bg-white">
                <div className="relative aspect-[16/9] overflow-hidden bg-white">
                  <Image
                    src={p.banner}
                    alt={p.title}
                    fill
                    sizes="(min-width:768px) 50vw, 100vw"
                    className={cx(
                      fit === "contain" ? "object-contain p-4 md:p-6" : "object-cover",
                      p.objectPosition ?? "object-center"
                    )}
                    priority={i === 0}
                  />
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-6">
                  {p.brand && (
                    <p className="text-[length:var(--text-small)] text-olive-ink font-medium">
                      {p.brand}
                    </p>
                  )}
                  <h2 className="mt-1 text-[length:var(--text-lead)] tracking-[-0.02em] leading-[1.15]">
                    {title}
                  </h2>
                  {subtitle && <p className="mt-1 text-soft">{subtitle}</p>}
                  <p
                    id={`${p.id}-blurb`}
                    className={cx("mt-3", !expanded && "line-clamp-2")}
                  >
                    {p.blurb}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggle(p.id)}
                    aria-expanded={expanded}
                    aria-controls={`${p.id}-blurb`}
                    className="link mt-1 min-h-11 self-start font-medium"
                  >
                    {expanded ? "Show less" : "Read more"}
                  </button>
                  <div className="mt-auto pt-4">
                    <a
                      href={`mailto:${EMAIL}?subject=${encodeURIComponent(
                        subject
                      )}&body=${encodeURIComponent(body)}`}
                      className="btn w-full sm:w-auto"
                    >
                      <Mail className="h-4 w-4" aria-hidden />
                      Request this session
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {filtered.length === 0 && (
          <p className="py-16">
            No presentations match this filter.{" "}
            <button onClick={() => setActive([])} className="link">
              Show all
            </button>
            .
          </p>
        )}
      </section>
    </div>
  );
}
