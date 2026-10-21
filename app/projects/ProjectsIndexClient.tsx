"use client";

import { useMemo, useState } from "react";
import Card from "@/components/Card";
import FilterBar, { SelectOption } from "@/components/FilterBar";
import PageHeader from "@/components/PageHeader";
import type { Project } from "@/lib/content";

export default function ProjectsIndexClient({
  projects,
  allSectors,
  manufacturers,
}: {
  projects: Project[];
  allSectors: string[];
  manufacturers: { id: string; name: string }[];
}) {
  const manufacturerOptions: SelectOption[] = manufacturers.map((m) => ({
    label: m.name,
    value: m.id,
  }));
  const [sectors, setSectors] = useState<string[]>([]);
  const [mfg, setMfg] = useState<string | null>(null);

  const sector = sectors[0] ?? null;

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const bySector = sector ? p.sectors.includes(sector) : true;
      const byMfg = mfg ? p.manufacturers.includes(mfg) : true;
      return bySector && byMfg;
    });
  }, [projects, sector, mfg]);

  return (
    <div className="bg-ground text-ink">
      <PageHeader
        title="Projects"
        lead="Buildings and streets in British Columbia with products we represent cast, buried or bolted into them."
      />

      <section className="gutter">
        <FilterBar
          title="Filter"
          allLabel="All sectors"
          options={allSectors}
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
      </section>

      <section className="gutter pt-10 md:pt-14 pb-20 md:pb-24">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <li key={p.slug}>
              <Card
                href={`/projects/${p.slug}`}
                title={p.title.split("|")[0].trim()}
                meta={`${p.location}${p.year ? `, ${p.year}` : ""} · ${p.sectors.join(", ")}`}
                cue="View project"
                image={{ src: p.hero, alt: p.title }}
              />
            </li>
          ))}
        </ul>
        {filtered.length === 0 && (
          <p className="py-16">
            No projects match these filters. Try another sector or
            manufacturer, or{" "}
            <button
              onClick={() => {
                setSectors([]);
                setMfg(null);
              }}
              className="link"
            >
              reset
            </button>
            .
          </p>
        )}
      </section>
    </div>
  );
}
