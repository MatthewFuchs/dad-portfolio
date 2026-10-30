"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/Card";
import FilterBar, { SelectOption } from "@/components/FilterBar";
import PageHeader from "@/components/PageHeader";
import type { Project } from "@/lib/content";

const MIN_PROJECTS_FOR_FILTERS = 6;

// The project cards and filters. This runs in the visitor's browser because
// the filters respond to clicks.
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

  // A link like /projects?manufacturer=leviat starts with that filter on.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("manufacturer");
    if (id && manufacturers.some((m) => m.id === id)) setMfg(id);
  }, [manufacturers]);

  // Filters only help once there are enough projects to narrow down. They stay
  // visible while one is on, so it can always be cleared.
  const showFilters = projects.length >= MIN_PROJECTS_FOR_FILTERS || mfg !== null;

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

      {showFilters && (
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
      )}

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
