"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Mail } from "lucide-react";

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

const PRESENTATIONS: Presentation[] = [
  {
    id: "leviat-hit-thermal-breaks",
    title: "Structural Thermal Breaks | Insulated Balcony Connections",
    blurb:
      "The Green Building movement is raising the bar for energy performance. Learn how thermal bridging impacts whole-building efficiency and how Leviat’s HIT system addresses it with structural, thermally efficient balcony connections.",
    banner: "/presentations/structural-thermal-breaks.jpg",
    tags: [
      "LEVIAT",
      "Halfen",
      "Structural Engineering",
      "Building Envelope",
      "Thermal Breaks",
      "Insulation",
    ],
    brand: "LEVIAT",
    // panorama-friendly defaults
    bannerFit: "contain",
    bannerAspect: "aspect-[21/9] md:aspect-[21/9]",
    objectPosition: "object-center",
  },
  {
    id: "abt-permavoid-blue-green-roofs",
    title: "Designing Blue-Green Connected Roofs for Resilient Cities",
    blurb:
      "Using ABT Permavoid, create circular, nature-based solutions that catch, store, and reuse rainwater where it falls. Explore blue-green roofs, podiums, urban trees, sports fields and SUDS to build resilient cities.",
    banner: "/presentations/blue-green-connected-roofs.jpg",
    tags: [
      "ABT",
      "Permavoid",
      "Storm Water Management",
      "Resilient Cities",
      "Building Envelope",
    ],
    brand: "ABT",
    // this image is closer to standard aspect; no overrides needed
  },
];

const cx = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

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
        "shrink-0 rounded-full border px-3 py-1.5 text-sm transition",
        active
          ? "bg-black text-white border-black"
          : "bg-white text-gray-900 border-gray-300 hover:border-gray-500"
      )}
    >
      {label}
    </button>
  );
}

export default function PresentationsPage() {
  const [active, setActive] = useState<string[]>([]);

  const allTags = useMemo(
    () => Array.from(new Set(PRESENTATIONS.flatMap((p) => p.tags))).sort(),
    []
  );

  const filtered = useMemo(() => {
    if (active.length === 0) return PRESENTATIONS;
    return PRESENTATIONS.filter((p) => p.tags.some((t) => active.includes(t)));
  }, [active]);

  const toggleTag = (t: string) =>
    setActive((cur) =>
      cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]
    );

  const clear = () => setActive([]);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <section className="pt-28 sm:pt-32 pb-6 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold">Technical Presentations</h1>
          <p className="mt-3 text-gray-700">
            Short, practical sessions. Browse by topic and email us to schedule.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-gray-200 bg-white/70 px-3 py-3 md:px-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-gray-900">
                Filter topics
              </span>
              {active.length > 0 && (
                <button
                  onClick={clear}
                  className="text-sm text-gray-600 underline decoration-transparent hover:decoration-gray-400 hover:text-gray-900"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Chip label="All" active={active.length === 0} onClick={clear} />
              {allTags.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  active={active.includes(t)}
                  onClick={() => toggleTag(t)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="px-6 md:px-16 py-10">
        <div className="max-w-6xl mx-auto">
          {filtered.map((p, i) => {
            const imageLeft = i % 2 === 0;
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

            // Per-item display controls
            const aspect = p.bannerAspect ?? "aspect-[16/9] md:aspect-[4/3]";
            const fit = p.bannerFit ?? "cover";
            const objPos = p.objectPosition ?? "object-center";

            return (
              <article
                key={p.id}
                className={cx(
                  "grid items-center gap-6 md:grid-cols-2 py-10 md:py-16 border-t border-gray-200",
                  i === 0 && "border-t-0"
                )}
              >
                {/* Image */}
                <div
                  className={cx(
                    "order-1 md:order-none md:row-start-1",
                    imageLeft ? "md:col-start-1" : "md:col-start-2"
                  )}
                >
                  <div
                    className={cx(
                      "relative overflow-hidden rounded-2xl shadow-sm",
                      aspect
                    )}
                  >
                    {/* Blurred backdrop when using object-contain (so panoramas don’t look letterboxed) */}
                    {fit === "contain" && (
                      <Image
                        src={p.banner}
                        alt=""
                        aria-hidden
                        fill
                        sizes="(min-width:1024px) 45vw, 100vw"
                        className="object-cover blur-xl scale-110 opacity-30"
                        priority={i === 0}
                      />
                    )}

                    {/* Foreground image */}
                    <Image
                      src={p.banner}
                      alt={p.title}
                      fill
                      sizes="(min-width:1024px) 45vw, 100vw"
                      className={cx(
                        fit === "contain" ? "object-contain" : "object-cover",
                        objPos,
                        "relative z-10"
                      )}
                      priority={i === 0}
                    />

                    {p.brand && (
                      <span className="absolute left-3 top-3 z-20 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold ring-1 ring-black/10">
                        {p.brand}
                      </span>
                    )}
                    <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                  </div>
                </div>

                {/* Content */}
                <div
                  className={cx(
                    "order-2 md:row-start-1",
                    imageLeft ? "md:col-start-2" : "md:col-start-1"
                  )}
                >
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                    {p.title}
                  </h2>

                  {/* Full description – no clamping */}
                  <p className="mt-3 text-[15px] leading-7 text-gray-800">
                    {p.blurb}
                  </p>

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-900"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="mt-6">
                    <a
                      href={`mailto:${EMAIL}?subject=${encodeURIComponent(
                        subject
                      )}&body=${encodeURIComponent(body)}`}
                      className="inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                    >
                      <Mail className="h-4 w-4" />
                      Email to register
                    </a>
                  </div>
                </div>
              </article>
            );
          })}

          {filtered.length === 0 && (
            <p className="py-20 text-gray-700">
              No presentations match these filters. Try another topic or{" "}
              <button
                onClick={() => setActive([])}
                className="underline underline-offset-2 hover:no-underline"
              >
                reset
              </button>
              .
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
