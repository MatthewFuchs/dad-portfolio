"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import FilterBar, { SelectOption } from "@/components/FilterBar";
import { PROJECTS, ALL_SECTORS } from "../../data/projects";
import { MANUFACTURERS } from "../../data/manufacturers";

const manufacturerOptions: SelectOption[] = MANUFACTURERS.map((m) => ({
  label: m.name,
  value: m.id,
}));

export default function ProjectsIndexClient() {
  const [sectors, setSectors] = useState<string[]>([]);
  const [mfg, setMfg] = useState<string | null>(null);

  const sector = sectors[0] ?? null;

  const filtered = useMemo(() => {
    return PROJECTS.filter((p) => {
      const bySector = sector ? p.sectors.includes(sector) : true;
      const byMfg = mfg ? p.manufacturers.includes(mfg) : true;
      return bySector && byMfg;
    });
  }, [sector, mfg]);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <section className="pt-32 pb-6 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold">Projects</h1>
          <p className="text-gray-700 mt-3">
            Browse selected work by sector or manufacturer.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <FilterBar
            title="Filter"
            allLabel="All sectors"
            options={ALL_SECTORS}
            active={sectors}
            onChange={setSectors}
            multi={true}
            secondary={{
              placeholder: "Manufacturer: All",
              value: mfg,
              options: manufacturerOptions,
              onChange: setMfg,
            }}
          />
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 md:px-16 py-10">
        <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="group rounded-2xl overflow-hidden border border-gray-200 bg-white hover:shadow-lg transition"
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src={p.hero}
                  alt={p.title}
                  fill
                  sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <div className="absolute bottom-2 left-2 flex flex-wrap gap-2">
                  {p.sectors.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-900"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {p.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {p.location}
                  {p.year ? ` • ${p.year}` : ""}
                </p>
                <p className="text-gray-800 mt-3 line-clamp-3">{p.summary}</p>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="max-w-6xl mx-auto py-16 text-gray-700">
            No projects match these filters. Try another sector or manufacturer,
            or{" "}
            <button
              onClick={() => {
                setSectors([]);
                setMfg(null);
              }}
              className="underline underline-offset-2 hover:no-underline"
            >
              reset
            </button>
            .
          </div>
        )}
      </section>
    </main>
  );
}
