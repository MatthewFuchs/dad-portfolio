"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import type { Manufacturer } from "../../lib/content";
import PageHeader from "../../components/PageHeader";
import ResourceRow from "../../components/ResourceRow";

const cx = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

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

      <section className="bg-olive">
        <div className="gutter py-14 md:py-20 grid gap-8 md:grid-cols-12 md:gap-x-6 md:items-end">
          <div className="md:col-span-7">
            <h2 className="text-[length:var(--text-head)]">Prefer a walkthrough?</h2>
            <p className="mt-5 max-w-[48ch]">
              We run technical sessions for design teams and contractors.
            </p>
          </div>
          <div className="md:col-start-9 md:col-span-4 md:justify-self-end">
            <Link href="/presentations" className="btn btn-dark w-full sm:w-auto">
              See presentations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
