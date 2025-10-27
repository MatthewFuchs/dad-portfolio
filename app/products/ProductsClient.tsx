"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, ArrowUpRight } from "lucide-react";

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

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "px-3 py-1.5 rounded-full text-sm border transition whitespace-nowrap",
        active
          ? "bg-black text-white border-black"
          : "bg-white text-gray-900 border-gray-300 hover:border-gray-500"
      )}
    >
      {label}
    </button>
  );
}

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
        className="fixed inset-0 z-[110] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-3xl bg-white text-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={cx(
              "relative h-44 sm:h-56 border-b border-gray-200",
              company.logoBgClass ?? "bg-white"
            )}
          >
            {company.logoSrc && (
              <img
                src={company.logoSrc}
                alt={`${company.name} logo`}
                className={cx(
                  "absolute inset-0 h-full w-full object-contain p-6",
                  company.logoImgClass
                )}
              />
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/90 px-3 py-1.5 text-sm font-medium hover:bg-white transition"
          >
            <X className="h-4 w-4" /> Close
          </button>
          <div className="p-6">
            <h2 className="text-2xl font-semibold">{company.name}</h2>
            <p className="text-gray-800 mt-2">{company.shortInfo}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {company.categories.map((cat) => (
                <span
                  key={cat}
                  className="px-2.5 py-1 rounded-full text-xs border border-gray-300 text-gray-900"
                >
                  {cat}
                </span>
              ))}
            </div>
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold">Innovation</h3>
              <p className="text-gray-800 mt-1">{company.innovation}</p>
            </div>
            <a
              href={company.website}
              target="_blank"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-black text-white px-5 py-3 font-semibold hover:bg-gray-800 transition"
            >
              Visit Website <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

function CompanyCard({
  company,
  onOpen,
}: {
  company: Company;
  onOpen: (c: Company) => void;
}) {
  return (
    <div
      data-testid="company-card"
      className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-transform duration-300 hover:-translate-y-1"
    >
      <div
        className={cx(
          "relative h-28 sm:h-32 border-b border-gray-200",
          company.logoBgClass ?? "bg-white"
        )}
      >
        {company.logoSrc && (
          <img
            src={company.logoSrc}
            alt={`${company.name} logo`}
            className={cx(
              "absolute inset-0 h-full w-full object-contain p-6",
              company.logoImgClass
            )}
          />
        )}
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {company.name}
            </h2>
            <p className="text-gray-800 mt-1">{company.shortInfo}</p>
          </div>
          <button
            onClick={() => onOpen(company)}
            aria-label="Open details"
            className="shrink-0 inline-flex items-center justify-center rounded-full border border-gray-300 w-9 h-9 transition hover:border-gray-500 text-gray-900"
            title="Show details"
          >
            ▼
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {company.categories.map((cat) => (
            <span
              key={cat}
              className="px-2.5 py-1 rounded-full text-xs border border-gray-300 text-gray-900"
            >
              {cat}
            </span>
          ))}
        </div>
        <div className="mt-4">
          <a
            href={company.website}
            target="_blank"
            className="inline-flex items-center gap-2 text-sm font-medium underline text-gray-900 hover:opacity-80"
          >
            Visit Website <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ProductsClient() {
  const [activeCats, setActiveCats] = useState<string[]>([]);
  const [selected, setSelected] = useState<Company | null>(null);

  const toggleCat = (cat: string) =>
    setActiveCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  const hasFilters = activeCats.length > 0;
  const clearFilters = () => setActiveCats([]);

  const filtered = useMemo(() => {
    if (!hasFilters) return COMPANIES;
    return COMPANIES.filter((c) =>
      c.categories.some((cat) => activeCats.includes(cat))
    );
  }, [hasFilters, activeCats]);

  return (
    <main className="bg-white text-gray-900 min-h-screen">
      <section className="pt-32 pb-6">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <h1 className="text-4xl font-bold">Manufacturers We Represent</h1>
          <p className="text-gray-800 mt-3">
            Browse by solution area. Use the filters to quickly find a
            manufacturer.
          </p>
        </div>
      </section>

      <section>
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="rounded-2xl border border-gray-200 bg-white/70 px-3 py-3 md:px-4 md:py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* SCROLLABLE PILLS */}
              <div className="w-full flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <Chip
                  label="All categories"
                  active={!hasFilters}
                  onClick={clearFilters}
                />
                {ALL_CATEGORIES.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    active={activeCats.includes(cat)}
                    onClick={() => toggleCat(cat)}
                  />
                ))}
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="self-start md:self-auto text-sm text-gray-600 underline decoration-transparent hover:decoration-gray-400 hover:text-gray-900"
                >
                  Reset
                </button>
              )}
            </div>

            {hasFilters && (
              <div className="mt-3 flex flex-wrap items-center gap-2 px-3 md:px-4">
                {activeCats.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setActiveCats((prev) => prev.filter((c) => c !== cat))
                    }
                    className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50"
                    aria-label={`Remove category filter ${cat}`}
                  >
                    {cat} <span aria-hidden>×</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-12">
          {filtered.length === 0 ? (
            <p className="text-gray-800">
              No matches. Try another category or{" "}
              <button
                onClick={clearFilters}
                className="underline underline-offset-2 hover:no-underline"
              >
                reset
              </button>
              .
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <CompanyCard key={c.id} company={c} onOpen={setSelected} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CompanyModal company={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
