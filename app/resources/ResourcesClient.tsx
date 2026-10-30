"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, FileText, Download, ArrowUpRight } from "lucide-react";
import type { Manufacturer } from "../../lib/content";
import PageHeader from "../../components/PageHeader";

const PUBLIC_INBOX =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "gfuchs@fuchs-sales.ca";

const cx = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

// Uploaded files can have generic names (e.g. ".../0/file.pdf"); save them
// under the document's title instead.
function downloadName(title: string, href: string) {
  const ext = href.match(/\.[a-z0-9]+$/i)?.[0] ?? ".pdf";
  return title.replace(/[\\/:*?"<>|]+/g, "").trim() + ext;
}

// One document: its name and details, with View and Download links.
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
  const meta = [type, ...tags, size, updated && `Updated ${updated}`]
    .filter(Boolean)
    .join(" · ");
  return (
    <li className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6">
      <div className="min-w-0 flex gap-3">
        <FileText className="mt-1 h-4 w-4 shrink-0 text-soft" aria-hidden />
        <div className="min-w-0">
          <p className="font-medium leading-snug">{title}</p>
          <p className="mt-1 text-[length:var(--text-small)] text-soft">{meta}</p>
        </div>
      </div>
      <div className="flex gap-6 pl-7 sm:pl-0 text-[length:var(--text-small)]">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="link inline-flex min-h-11 items-center font-medium"
        >
          View
        </a>
        <a
          href={href}
          download={downloadName(title, href)}
          className="link inline-flex min-h-11 items-center gap-1.5 font-medium"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          Download
        </a>
      </div>
    </li>
  );
}

// One manufacturer: a row that opens to show its documents.
function BrandRow({
  m,
  open,
  onToggle,
}: {
  m: Manufacturer;
  open: boolean;
  onToggle: (id: string) => void;
}) {
  const count = m.resources.length;
  const hasResources = count > 0;

  return (
    <article id={m.id} className="bg-white">
      <button
        type="button"
        onClick={() => hasResources && onToggle(m.id)}
        aria-expanded={open}
        aria-controls={`${m.id}-resources`}
        disabled={!hasResources}
        className="group flex w-full items-center gap-4 p-3 sm:p-4 text-left transition-colors hover:bg-surface disabled:cursor-default"
      >
        <span
          className={cx(
            "relative h-14 w-24 shrink-0 overflow-hidden sm:h-16 sm:w-36",
            m.logoBgClass ?? "bg-white"
          )}
        >
          <Image
            src={m.logoSrc}
            alt=""
            fill
            sizes="144px"
            className="object-contain p-2"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[length:var(--text-lead)] leading-tight tracking-[-0.02em]">
            {m.name}
          </span>
          <span className="mt-0.5 block text-[length:var(--text-small)] text-soft">
            {hasResources
              ? `${count} document${count === 1 ? "" : "s"}`
              : "Documents coming soon"}
          </span>
        </span>
        {hasResources && (
          <ChevronDown
            className={cx(
              "h-5 w-5 shrink-0 transition-transform duration-300",
              open ? "rotate-180" : "rotate-0"
            )}
            aria-hidden="true"
          />
        )}
      </button>

      <div
        id={`${m.id}-resources`}
        aria-hidden={!open}
        inert={!open}
        className={cx(
          "grid transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none",
          open ? "grid-rows-[1fr] opacity-100" : "invisible grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          {hasResources && (
            <div className="px-3 pb-4 sm:px-4">
              <ul className="bg-surface px-4 sm:px-6 py-2">
                {m.resources.map((r) => (
                  <ResourceRow key={r.id} {...r} />
                ))}
              </ul>
              <a
                href={m.website}
                target="_blank"
                rel="noopener noreferrer"
                className="link mt-3 inline-flex min-h-11 items-center gap-1 text-[length:var(--text-small)] font-medium"
              >
                {m.name} website <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// The "Book a session" band: builds a ready-to-send email from the two dropdowns.
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

  const field =
    "relative flex items-center bg-ground focus-within:outline-2 focus-within:outline-olive-ink";
  const select =
    "w-full appearance-none bg-transparent min-h-13 pl-4 pr-10 text-ink focus:outline-none";

  return (
    <section id="request" className="bg-olive">
      <div className="gutter py-14 md:py-20 grid gap-10 md:grid-cols-12 md:gap-x-6 md:items-end">
        <div className="md:col-span-5">
          <h2 className="text-[length:var(--text-head)]">
            Book a session
          </h2>
          <p className="mt-5 max-w-[40ch]">
            Pick a brand and a meeting type. We will follow up to find a time
            that suits your team.
          </p>
        </div>
        <div
          className="md:col-start-7 md:col-span-6 grid gap-1.5 sm:grid-cols-2"
        >
          <label className={field}>
            <select
              aria-label="Brand"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className={select}
            >
              {manufacturers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4" />
          </label>
          <label className={field}>
            <select
              aria-label="Meeting type"
              value={meeting}
              onChange={(e) => setMeeting(e.target.value)}
              className={select}
            >
              <option>Presentation</option>
              <option>Lunch & Learn</option>
              <option>Spec Review</option>
              <option>Training</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4" />
          </label>
          <a href={emailHref} className="btn btn-dark sm:col-span-2 mt-1.5">
            Email to schedule
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Page ---------- */
export default function ResourcesClient({
  manufacturers,
}: {
  manufacturers: Manufacturer[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const items = manufacturers;
  const onToggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <div className="bg-ground text-ink">
      <PageHeader
        title="Resources"
        lead="Brochures, data sheets, installation guides and technical documents from the manufacturers we represent."
      />

      <section className="gutter pb-16 md:pb-24">
        <div className="space-y-2">
          {items.map((m) => (
            <BrandRow
              key={m.id}
              m={m}
              open={openId === m.id}
              onToggle={onToggle}
            />
          ))}
        </div>
      </section>

      <TinyPresentationCTA manufacturers={items} />
    </div>
  );
}
