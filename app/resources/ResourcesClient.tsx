"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, FileText, Download, ArrowUpRight } from "lucide-react";
import type { Manufacturer } from "../../data/manufacturers";
import { MANUFACTURERS } from "../../data/manufacturers";

const PUBLIC_INBOX =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "gfuchs@fuchs-sales.ca";

const cx = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

function ResourceRow({
  title,
  href,
  type = "PDF",
  size,
  updated,
  tags = [],
}: {
  title: string;
  href: string;
  type?: string;
  size?: string;
  updated?: string;
  tags?: string[];
}) {
  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 opacity-70" />
            <p className="font-medium text-gray-900 leading-5 truncate">
              {title}
            </p>
          </div>
          <div className="pl-6 mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
            <span className="rounded-full border border-gray-300 px-2 py-0.5">
              {type}
            </span>
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-gray-300 px-2 py-0.5"
              >
                {t}
              </span>
            ))}
            {size && <span className="text-gray-500">{size}</span>}
            {updated && (
              <span className="text-gray-500">Updated {updated}</span>
            )}
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden sm:flex shrink-0 items-center gap-1.5">
          <a
            href={href}
            target="_blank"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1 text-sm font-semibold hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
          >
            View
          </a>
          <a
            href={href}
            download
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-sm font-semibold hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
        </div>
      </div>

      {/* Mobile actions */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
        <a
          href={href}
          target="_blank"
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
        >
          View
        </a>
        <a
          href={href}
          download
          className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
        >
          <Download className="h-4 w-4" />
          Download
        </a>
      </div>
    </li>
  );
}

function BrandRow({
  m,
  open,
  onToggle,
}: {
  m: Manufacturer;
  open: boolean;
  onToggle: (id: string) => void;
}) {
  const hasResources = m.resources.length > 0;
  const label = open ? "Hide resources" : "Show resources";

  return (
    <article id={m.id} className="bg-white">
      {/* Header */}
      <div className="py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Logo + name */}
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3 min-w-0">
            <div
              className={cx(
                "relative h-10 w-36 rounded-md border border-gray-200 overflow-hidden shrink-0",
                m.logoBgClass ?? "bg-white"
              )}
            >
              <Image
                src={m.logoSrc}
                alt={`${m.name} logo`}
                fill
                sizes="144px"
                className="object-contain p-2"
              />
            </div>

            <h2 className="text-center sm:text-left text-base sm:text-lg font-semibold text-gray-900 truncate">
              {m.name}
            </h2>
          </div>

          {/* Desktop controls */}
          <div className="hidden sm:flex flex-wrap items-center gap-2 sm:gap-3">
            <a
              href={m.website}
              target="_blank"
              className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 underline decoration-transparent underline-offset-[3px] hover:decoration-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
            >
              Visit Website <ArrowUpRight className="h-3.5 w-3.5" />
            </a>

            <button
              type="button"
              onClick={() => hasResources && onToggle(m.id)}
              aria-expanded={open}
              aria-controls={`${m.id}-resources`}
              disabled={!hasResources}
              className={cx(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300",
                hasResources
                  ? "border-gray-300 bg-white hover:bg-gray-100"
                  : "border-gray-200 bg-gray-50 text-gray-400 cursor-default"
              )}
              title={hasResources ? label : "Resources coming soon"}
            >
              <ChevronDown
                className={cx(
                  "h-3.5 w-3.5 transition-transform",
                  open ? "rotate-180" : "rotate-0",
                  !hasResources && "opacity-40"
                )}
                aria-hidden="true"
              />
              <span>
                {label} <span className="sr-only">for {m.name}</span>
                <span className="ml-1 tabular-nums inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs border border-gray-200">
                  {m.resources.length}
                </span>
              </span>
            </button>
          </div>

          {/* Mobile controls */}
          <div className="flex sm:hidden w-full items-center justify-center gap-2">
            <a
              href={m.website}
              target="_blank"
              className="flex-1 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
            >
              Website
            </a>
            <button
              type="button"
              onClick={() => hasResources && onToggle(m.id)}
              aria-expanded={open}
              aria-controls={`${m.id}-resources`}
              disabled={!hasResources}
              className={cx(
                "flex-1 inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300",
                hasResources
                  ? "border border-gray-300 bg-white hover:bg-gray-100 text-gray-900"
                  : "border border-gray-200 bg-gray-50 text-gray-400 cursor-default"
              )}
              title={hasResources ? label : "Resources coming soon"}
            >
              <ChevronDown
                className={cx(
                  "h-4 w-4 transition-transform",
                  open ? "rotate-180" : "rotate-0",
                  !hasResources && "opacity-40"
                )}
                aria-hidden="true"
              />
              <span className="truncate">{label}</span>
              <span
                className={cx(
                  "tabular-nums text-xs px-1.5 py-0.5 rounded border",
                  hasResources
                    ? "bg-gray-100 border-gray-200 text-gray-800"
                    : "bg-gray-50 border-gray-200 text-gray-400"
                )}
              >
                {m.resources.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        id={`${m.id}-resources`}
        aria-hidden={!open}
        className={cx(
          "overflow-hidden transition-[max-height,opacity,margin] duration-300 motion-reduce:transition-none",
          open ? "max-h-[1200px] opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
        )}
      >
        {hasResources && (
          <ul className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
            {m.resources.map((r) => (
              <ResourceRow key={r.id} {...r} />
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

function TinyPresentationCTA({
  manufacturers,
}: {
  manufacturers: Manufacturer[];
}) {
  const [brandId, setBrandId] = useState(manufacturers[0]?.id ?? "");
  const [meeting, setMeeting] = useState("Presentation");

  const brandName = useMemo(
    () => manufacturers.find((m) => m.id === brandId)?.name || "",
    [brandId, manufacturers]
  );

  const emailHref = useMemo(() => {
    const subject = `${meeting} request: ${brandName}`;
    const body = [
      `Hi Greg,`,
      ``,
      `I'd like to schedule a ${meeting.toLowerCase()} on ${brandName}.`,
      `Preferred dates/times:`,
      `-`,
      ``,
    ].join("\n");
    return `mailto:${PUBLIC_INBOX}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }, [brandName, meeting]);

  return (
    <section
      id="request"
      className="mt-10 md:mt-14 pt-6 border-t border-gray-200 mb-24"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 text-center sm:text-left">
          <h2 className="text-sm font-semibold text-gray-900">
            Request a presentation
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Pick a brand &amp; meeting type. We’ll follow up to schedule a
            convenient time.
          </p>
        </div>

        <div className="grid w-full gap-2 sm:grid-cols-[minmax(160px,1fr)_minmax(160px,1fr)_auto] sm:w-auto">
          <label className="relative inline-flex items-center rounded-full border border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-gray-300">
            <select
              aria-label="Brand"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="appearance-none bg-transparent border-0 pl-3 pr-9 py-2 text-sm text-gray-900 focus:outline-none"
            >
              {manufacturers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </label>

          <label className="relative inline-flex items-center rounded-full border border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-gray-300">
            <select
              aria-label="Meeting type"
              value={meeting}
              onChange={(e) => setMeeting(e.target.value)}
              className="appearance-none bg-transparent border-0 pl-3 pr-9 py-2 text-sm text-gray-900 focus:outline-none"
            >
              <option>Presentation</option>
              <option>Lunch & Learn</option>
              <option>Spec Review</option>
              <option>Training</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </label>

          <div className="flex items-center justify-center sm:justify-start">
            <a
              href={emailHref}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 transition"
            >
              Email to schedule
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Page ---------- */
export default function ResourcesClient() {
  const [openId, setOpenId] = useState<string | null>(null);

  const items = useMemo(() => MANUFACTURERS, []);
  const onToggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="pt-32 pb-6 px-4 sm:px-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold">Learning Resources</h1>
          <p className="text-gray-700 mt-2">
            Download brochures, specifications, installation guides, and
            technical documents from the manufacturers we represent.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="border-t border-gray-200 divide-y divide-gray-200">
            {items.map((m) => (
              <BrandRow
                key={m.id}
                m={m}
                open={openId === m.id}
                onToggle={onToggle}
              />
            ))}
          </div>

          <TinyPresentationCTA manufacturers={items} />
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 pb-1" />
    </main>
  );
}
