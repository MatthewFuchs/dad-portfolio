"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, ArrowUpRight } from "lucide-react";
import FilterBar from "@/components/FilterBar";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";

type Company = {
  id: string;
  name: string;
  website: string;
  shortInfo: string;
  innovation: string;
  categories: string[];
  logoSrc?: string;
  logoBgClass?: string;
  logoImgClass?: string;
};

const COMPANIES: Company[] = [
  {
    id: "thermomass",
    name: "Thermomass",
    website: "https://www.thermomass.com",
    shortInfo:
      "Insulation systems for precast, tilt-up and cast-in-place concrete walls.",
    innovation:
      "Pioneering concrete sandwich panel insulation that reduces thermal bridging while preserving structural performance.",
    categories: ["Insulation", "Envelope"],
    logoSrc: "/logos/thermomass.png",
  },
  {
    id: "leviat",
    name: "Leviat",
    website: "https://www.leviat.com/en-us",
    shortInfo:
      "Global provider of lifting, connecting, anchoring and façade support systems.",
    innovation:
      "Engineered connection systems for tilt-up and precast with strong safety and R&D focus (brands include Meadow Burke & HALFEN).",
    categories: ["Connections", "Lifting"],
    logoSrc: "/logos/leviat.png",
  },
  {
    id: "meadow-burke",
    name: "Meadow Burke",
    website: "https://meadowburke.com",
    shortInfo:
      "Leviat brand specializing in tilt-up hardware, accessories and safety solutions.",
    innovation:
      "Field-proven lifting hardware and accessories trusted across North America.",
    categories: ["Connections", "Lifting"],
    logoSrc: "/logos/meadowburke.png",
  },
  {
    id: "halfen",
    name: "HALFEN",
    website: "https://www.leviat.com/en-us/halfen",
    shortInfo:
      "Anchoring channels, reinforcement and framing technology for precast and concrete.",
    innovation:
      "Adjustable façade brackets and high-reliability anchoring channel systems for efficient install and tolerance.",
    categories: ["Connections", "Façade"],
    logoSrc: "/logos/halfen.png",
  },
  {
    id: "airfoam",
    name: "AirFoam",
    website: "https://www.airfoam.com",
    shortInfo:
      "Expanded polystyrene (EPS) solutions for insulation and geofoam.",
    innovation:
      "Lightweight EPS that increases thermal performance and reduces material/installation costs.",
    categories: ["Insulation", "Envelope"],
    logoSrc: "/logos/airfoam.png",
  },
  {
    id: "truefoam",
    name: "TrueFoam",
    website: "https://www.truefoam.com",
    shortInfo:
      "EPS insulation for foundations, under-slab, floors, walls and roofs, made in Atlantic Canada since 1968.",
    innovation:
      "Foundation Plus insulates and sheathes in one CCMC-evaluated board, and InsulWorks panels hold hydronic tubing for in-floor heating without wire mesh, under slabs designed for heavy loads.",
    categories: ["Insulation", "Envelope", "Siteworks"],
    logoSrc: "/logos/truefoam.png",
  },
  {
    id: "abt-drains",
    name: "ABT Drains",
    website: "https://www.abtdrains.com",
    shortInfo:
      "High-performance trench drains, grates and surface water management.",
    innovation:
      "Durable modular drainage systems engineered for fast install and long-term performance.",
    categories: ["Drainage", "Siteworks"],
    logoSrc: "/logos/abtdrains.png",
  },
  {
    id: "jk-thermal",
    name: "JK Thermal",
    website: "https://www.jkthermal.com",
    shortInfo:
      "Thermal break products and insulation systems for precast and tilt-up envelopes.",
    innovation:
      "Thermal break components designed to cut heat loss while maintaining structural capacity.",
    categories: ["Insulation", "Envelope"],
    logoSrc: "/logos/jkthermal.png",
    logoBgClass: "bg-neutral-900",
  },
  {
    id: "saf-t-rail",
    name: "Saf-T-Rail",
    website: "https://www.saf-t-rail.com",
    shortInfo: "Guardrails, fall protection and safety railing systems.",
    innovation:
      "Compliance-driven, rugged safety solutions optimized for quick install and jobsite durability.",
    categories: ["Safety"],
    logoSrc: "/logos/saf-t-rail.png",
  },
  {
    id: "evergreen-solutions",
    name: "Evergreen Solutions",
    website: "https://www.evergreensolutions.com",
    shortInfo:
      "Environmentally-focused construction and maintenance solutions.",
    innovation:
      "Emphasis on sustainability and lifecycle value in product design.",
    categories: ["Sustainability"],
    logoSrc: "/logos/evergreen.png",
  },
  {
    id: "fabrikem",
    name: "Fabrikem",
    website: "https://fabrikem.com",
    shortInfo:
      "Concrete & masonry chemicals: cleaners, coatings/sealers, and colour systems for manufactured stone, pavers and masonry.",
    innovation:
      "Fabriglaze® sealers, Fabrishield® repellents/anti-graffiti, and Fabritone® stains — effective cleaning & protection without harsh muriatic acid issues.",
    categories: ["Cleaners", "Coatings", "Sealants", "Masonry"],
    logoSrc: "/logos/fabrikem.png",
  },
];

const ALL_CATEGORIES = Array.from(
  new Set(COMPANIES.flatMap((c) => c.categories))
).sort();

const cx = (...cls: Array<string | false | null | undefined>) =>
  cls.filter(Boolean).join(" ");

function CompanyModal({
  company,
  onClose,
}: {
  company: Company | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    document.body.style.overflow = company ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [company]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (company) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [company, onClose]);
  if (!company || !mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] bg-black/55" onClick={onClose} />
      <div
        className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-label={company.name}
        onClick={onClose}
      >
        <div
          data-lenis-prevent
          className="relative w-full max-w-3xl max-h-[92svh] overflow-y-auto bg-ground text-ink animate-[fade-up_400ms_var(--ease-out-strong)_both] motion-reduce:animate-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={cx(
              "relative h-40 sm:h-52",
              company.logoBgClass ?? "bg-white"
            )}
          >
            {company.logoSrc && (
              <img
                src={company.logoSrc}
                alt={`${company.name} logo`}
                className={cx(
                  "absolute inset-0 h-full w-full object-contain p-8",
                  company.logoImgClass
                )}
              />
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 inline-flex min-h-11 items-center gap-2 bg-ink px-4 text-[length:var(--text-small)] text-white transition-colors hover:bg-black"
          >
            <X className="h-4 w-4" /> Close
          </button>
          <div className="p-6 sm:p-10">
            <h2 className="text-[length:var(--text-head)]">{company.name}</h2>
            <p className="mt-4 text-[length:var(--text-lead)] leading-snug">
              {company.shortInfo}
            </p>
            <p className="mt-2 text-soft">{company.categories.join(", ")}</p>
            <h3 className="mt-8 text-[length:var(--text-body)] font-medium tracking-normal">
              Innovation
            </h3>
            <p className="mt-2 max-w-[60ch]">{company.innovation}</p>
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-8"
            >
              Visit website <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export default function ProductsClient() {
  const [activeCats, setActiveCats] = useState<string[]>([]);
  const [selected, setSelected] = useState<Company | null>(null);

  const filtered = useMemo(() => {
    if (activeCats.length === 0) return COMPANIES;
    return COMPANIES.filter((c) =>
      c.categories.some((cat) => activeCats.includes(cat))
    );
  }, [activeCats]);

  return (
    <div className="bg-ground text-ink">
      <PageHeader
        title="Manufacturers"
        lead={`The ${COMPANIES.length} manufacturers we represent across Canada: concrete, envelope, safety and site-works products. Filter by what you are building.`}
      />

      <section className="gutter">
        <FilterBar
          title="Filter"
          allLabel="All categories"
          options={ALL_CATEGORIES}
          active={activeCats}
          onChange={setActiveCats}
          multi
        />
      </section>

      <section className="gutter pt-6 pb-20 md:pb-24">
        {filtered.length === 0 ? (
          <p className="py-16">
            No matches. Try another category or{" "}
            <button onClick={() => setActiveCats([])} className="link">
              reset
            </button>
            .
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((c) => (
              <li key={c.id}>
                <Card
                  testId="company-card"
                  onClick={() => setSelected(c)}
                  title={c.name}
                  meta={c.shortInfo}
                  cue="Details"
                  ratio="aspect-[4/3]"
                  sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
                  image={{
                    src: c.logoSrc ?? "/fuchs.png",
                    alt: `${c.name} logo`,
                    fit: "contain",
                    bg: c.logoBgClass ?? "bg-white",
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <CompanyModal company={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
