"use client";

import { useMemo, useState } from "react";
import FilterBar from "@/components/FilterBar";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";

type Company = {
  id: string;
  name: string;
  shortInfo: string;
  categories: string[];
  logoSrc?: string;
  logoBgClass?: string;
};

// The manufacturer cards and filters. Each card is a real link to that
// company's own page, which search engines can follow.
export default function ProductsClient({ companies }: { companies: Company[] }) {
  // The filter buttons: every category used by at least one manufacturer.
  const ALL_CATEGORIES = useMemo(
    () => Array.from(new Set(companies.flatMap((c) => c.categories))).sort(),
    [companies],
  );
  const [activeCats, setActiveCats] = useState<string[]>([]);

  // With no filter on, show everyone; otherwise anyone in a chosen category.
  const filtered = useMemo(() => {
    if (activeCats.length === 0) return companies;
    return companies.filter((c) =>
      c.categories.some((cat) => activeCats.includes(cat)),
    );
  }, [activeCats, companies]);

  return (
    <div className="bg-ground text-ink">
      <PageHeader
        title="Manufacturers"
        lead={`The ${companies.length} manufacturers we represent across Canada: concrete, envelope, safety and site-works products.`}
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
                  href={`/products/${c.id}`}
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
    </div>
  );
}
