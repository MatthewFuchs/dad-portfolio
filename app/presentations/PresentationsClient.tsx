"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Mail } from "lucide-react";
import FilterBar from "@/components/FilterBar";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-static";

type Presentation = {
  id: string;
  title: string;
  blurb: string;
  banner: string;
  tags: string[];
  brand?: string;
  bannerFit?: "cover" | "contain";
  bannerAspect?: string;
  objectPosition?: string;
};

const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "gfuchs@fuchs-sales.ca";

const cx = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

export default function PresentationsPage({
  presentations,
}: {
  presentations: Presentation[];
}) {
  const [active, setActive] = useState<string[]>([]);
  const [open, setOpen] = useState<Set<string>>(new Set());

  const brands = useMemo(
    () =>
      Array.from(
        new Set(presentations.map((p) => p.brand).filter(Boolean) as string[])
      ).sort(),
    [presentations]
  );

  const filtered = useMemo(() => {
    if (active.length === 0) return presentations;
    return presentations.filter((p) => p.brand && active.includes(p.brand));
  }, [active, presentations]);

  const toggle = (id: string) =>
    setOpen((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="bg-ground text-ink">
      <PageHeader
        title="Presentations"
        lead="Eight technical sessions for architects, engineers and contractors. Pick one and request a time for your team."
      />

      <section className="gutter">
        <FilterBar
          title="Filter by manufacturer"
          allLabel="All"
          options={brands}
          active={active}
          onChange={setActive}
          multi
        />
      </section>

      <section className="gutter pt-8 md:pt-12 pb-20 md:pb-24">
        <ul className="grid gap-4 md:grid-cols-2">
          {filtered.map((p, i) => {
            const [title, subtitle] = p.title.split("|").map((t) => t.trim());
            const subject = `Presentation request: ${p.title}`;
            const body = [
              "Hi Greg,",
              "",
              `I'd like to register for “${p.title}”.`,
              "Company / team:",
              "-",
              "Preferred dates/times:",
              "-",
              "",
            ].join("\n");
            const fit = p.bannerFit ?? "cover";
            const expanded = open.has(p.id);

            return (
              <li key={p.id} className="flex flex-col bg-white">
                <div className="relative aspect-[16/9] overflow-hidden bg-white">
                  <Image
                    src={p.banner}
                    alt={p.title}
                    fill
                    sizes="(min-width:768px) 50vw, 100vw"
                    className={cx(
                      fit === "contain" ? "object-contain p-4 md:p-6" : "object-cover",
                      p.objectPosition ?? "object-center"
                    )}
                    priority={i === 0}
                  />
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-6">
                  {p.brand && (
                    <p className="text-[length:var(--text-small)] text-olive-ink font-medium">
                      {p.brand}
                    </p>
                  )}
                  <h2 className="mt-1 text-[length:var(--text-lead)] tracking-[-0.02em] leading-[1.15]">
                    {title}
                  </h2>
                  {subtitle && <p className="mt-1 text-soft">{subtitle}</p>}
                  <p
                    id={`${p.id}-blurb`}
                    className={cx("mt-3", !expanded && "line-clamp-2")}
                  >
                    {p.blurb}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggle(p.id)}
                    aria-expanded={expanded}
                    aria-controls={`${p.id}-blurb`}
                    className="link mt-1 min-h-11 self-start font-medium"
                  >
                    {expanded ? "Show less" : "Read more"}
                  </button>
                  <div className="mt-auto pt-4">
                    <a
                      href={`mailto:${EMAIL}?subject=${encodeURIComponent(
                        subject
                      )}&body=${encodeURIComponent(body)}`}
                      className="btn w-full sm:w-auto"
                    >
                      <Mail className="h-4 w-4" aria-hidden />
                      Request this session
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {filtered.length === 0 && (
          <p className="py-16">
            No presentations match this filter.{" "}
            <button onClick={() => setActive([])} className="link">
              Show all
            </button>
            .
          </p>
        )}
      </section>
    </div>
  );
}
