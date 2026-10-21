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

export default function ProductsClient({ companies }: { companies: Company[] }) {
  const ALL_CATEGORIES = useMemo(
    () => Array.from(new Set(companies.flatMap((c) => c.categories))).sort(),
    [companies]
  );
  const [activeCats, setActiveCats] = useState<string[]>([]);
  const [selected, setSelected] = useState<Company | null>(null);

  const filtered = useMemo(() => {
    if (activeCats.length === 0) return companies;
    return companies.filter((c) =>
      c.categories.some((cat) => activeCats.includes(cat))
    );
  }, [activeCats, companies]);

  return (
    <div className="bg-ground text-ink">
      <PageHeader
        title="Manufacturers"
        lead={`The ${companies.length} manufacturers we represent across Canada: concrete, envelope, safety and site-works products. Filter by what you are building.`}
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
