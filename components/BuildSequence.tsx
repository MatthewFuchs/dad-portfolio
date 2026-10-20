"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

export type Frame = { src: string; name: string; fact: string; alt: string };

type Status = "loading" | "ready" | "failed";

// One project shown as its build sequence: the chosen step large, every step
// as a thumbnail underneath. Thumbnails, the arrow buttons and the keyboard
// arrows all change the step; nothing scrolls sideways.
export default function BuildSequence({ frames }: { frames: Frame[] }) {
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const current = frames[active];
  const state = status[current.src] ?? "loading";

  const go = (i: number) =>
    setActive((i + frames.length) % frames.length);
  const mark = (src: string, s: Status) =>
    setStatus((prev) => (prev[src] === s ? prev : { ...prev, [src]: s }));

  // Swipe left/right on the photo to change step (touch screens).
  const touchX = useRef<number | null>(null);

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(active + 1);
        if (e.key === "ArrowLeft") go(active - 1);
      }}
    >
      <figure>
        {/* Height is capped so the whole photo, its arrows and the step row
            fit on screen together; the photo is shown whole, not cropped. */}
        <div
          className="relative aspect-[4/3] max-h-[calc(100svh-16rem)] w-full overflow-hidden bg-ink"
          aria-busy={state === "loading"}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (dx > 40) go(active - 1);
            else if (dx < -40) go(active + 1);
          }}
        >
          {state !== "failed" && (
            <Image
              key={current.src}
              src={current.src}
              alt={current.alt}
              fill
              sizes="(min-width:1024px) 66vw, 100vw"
              onLoad={() => mark(current.src, "ready")}
              onError={() => mark(current.src, "failed")}
              className={`object-contain transition-opacity duration-500 ${
                state === "ready" ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
          {state === "loading" && (
            <span className="absolute inset-0 grid place-items-center text-[length:var(--text-small)] text-white/80">
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none"
                />
                Loading photo
              </span>
            </span>
          )}
          {state === "failed" && (
            <p className="absolute inset-0 grid place-items-center px-6 text-center text-white/80">
              This photo could not be loaded. {current.alt}.
            </p>
          )}

          {/* Arrows sit on the photo, so stepping never needs a scroll. */}
          <button
            type="button"
            onClick={() => go(active - 1)}
            aria-label="Previous step"
            className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center bg-white/95 text-ink shadow-[inset_0_0_0_1px_rgba(22,24,21,0.25)] transition-colors hover:bg-ink hover:text-white active:scale-[0.97]"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            aria-label="Next step"
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center bg-white/95 text-ink shadow-[inset_0_0_0_1px_rgba(22,24,21,0.25)] transition-colors hover:bg-ink hover:text-white active:scale-[0.97]"
          >
            <ArrowRight className="h-5 w-5" aria-hidden />
          </button>
          <span className="absolute bottom-2 right-2 bg-ink/85 px-2.5 py-1 text-[length:var(--text-small)] tabular-nums text-white">
            {active + 1} / {frames.length}
          </span>
        </div>

        <figcaption className="mt-3" aria-live="polite">
          <span className="font-medium">{current.name}</span>
          <span className="text-soft"> · {current.fact}</span>
        </figcaption>
      </figure>

      <ol
        aria-label="Build sequence"
        className="mt-3 grid max-w-2xl gap-1.5"
        style={{ gridTemplateColumns: `repeat(${frames.length}, minmax(0, 1fr))` }}
      >
        {frames.map((f, i) => {
          const on = i === active;
          return (
            <li key={f.src}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-pressed={on}
                aria-label={`${f.name}: ${f.fact}`}
                className="group block w-full"
              >
                <span
                  className={`relative block aspect-square md:aspect-[4/3] overflow-hidden bg-[#dcdcd5] outline-offset-2 ${
                    on ? "outline-2 outline-ink" : ""
                  }`}
                >
                  <Image
                    src={f.src}
                    alt=""
                    fill
                    sizes="(min-width:1024px) 9vw, 14vw"
                    className={`object-cover transition-opacity duration-300 ${
                      on ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                    }`}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
