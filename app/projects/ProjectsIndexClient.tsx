"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { PROJECTS, ALL_SECTORS } from "../../data/projects";
import { MANUFACTURERS } from "../../data/manufacturers";

type Option = { label: string; value: string };

const cx = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

const manufacturerOptions: Option[] = MANUFACTURERS.map((m) => ({
  label: m.name,
  value: m.id,
}));

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

function SelectPill({
  id,
  value,
  onChange,
  placeholder,
  options,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: Option[];
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-full border border-gray-300 bg-white pl-3 pr-8 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
        aria-label={placeholder}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-4 w-4 text-gray-500" />
    </div>
  );
}

export default function ProjectsIndexClient() {
  const [sector, setSector] = useState<string | null>(null);
  const [mfg, setMfg] = useState<string | null>(null);

  const hasFilters = Boolean(sector || mfg);
  const mfgLabel =
    manufacturerOptions.find((o) => o.value === mfg)?.label ?? "All";
  const clearFilters = () => {
    setSector(null);
    setMfg(null);
  };

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
          <div className="rounded-2xl border border-gray-200 bg-white/70 px-3 py-3 md:px-4 md:py-3">
            <div className="flex flex-col gap-3 md:grid md:grid-cols-[1fr_auto_auto] md:items-center">
              {/* SCROLLABLE PILLS */}
              <div className="w-full flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <Chip
                  label="All sectors"
                  active={!sector}
                  onClick={() => setSector(null)}
                />
                {ALL_SECTORS.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    active={sector === s}
                    onClick={() => setSector((cur) => (cur === s ? null : s))}
                  />
                ))}
              </div>

              <div className="flex items-center md:justify-end">
                <SelectPill
                  id="mfg"
                  value={mfg ?? ""}
                  onChange={(v) => setMfg(v || null)}
                  placeholder="Manufacturer: All"
                  options={manufacturerOptions}
                />
              </div>

              <div className="flex items-center md:justify-end">
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm text-gray-600 underline decoration-transparent hover:decoration-gray-400 hover:text-gray-900"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {hasFilters && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {sector && (
                  <button
                    onClick={() => setSector(null)}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50"
                    aria-label={`Remove sector filter ${sector}`}
                  >
                    Sector: {sector} <span aria-hidden>×</span>
                  </button>
                )}
                {mfg && (
                  <button
                    onClick={() => setMfg(null)}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50"
                    aria-label={`Remove manufacturer filter ${mfgLabel}`}
                  >
                    Manufacturer: {mfgLabel} <span aria-hidden>×</span>
                  </button>
                )}
              </div>
            )}
          </div>
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
              onClick={clearFilters}
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
