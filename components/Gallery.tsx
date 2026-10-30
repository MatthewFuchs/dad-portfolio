"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Item = { src: string; alt?: string };


// A grid of project photos. Tapping one opens it full screen (the "lightbox"),
// with arrows, keyboard and swipe to move between photos.
export default function Gallery({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  // open: the lightbox is showing. idx: which photo. animKey: changes on every move
  // so the fade-in plays again.
  const [animKey, setAnimKey] = useState(0);
  // Load state per full-size image, so revisiting one does not flash again.
  const [loaded, setLoaded] = useState<Record<string, "ready" | "failed">>({});
  const mark = (src: string, v: "ready" | "failed") =>
    setLoaded((m) => (m[src] === v ? m : { ...m, [src]: v }));
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const openAt = (i: number) => {
    setIdx(i);
    setAnimKey((k) => k + 1);
    setOpen(true);
  };

  const close = useCallback(() => setOpen(false), []);

  // Previous and next wrap around, so the last photo leads back to the first.
  const prev = useCallback(() => {
    if (!items.length) return;
    setIdx((i) => (i - 1 + items.length) % items.length);
    setAnimKey((k) => k + 1);
  }, [items.length]);

  const next = useCallback(() => {
    if (!items.length) return;
    setIdx((i) => (i + 1) % items.length);
    setAnimKey((k) => k + 1);
  }, [items.length]);

  useEffect(() => {
    if (!open) return;
    // While the lightbox is open: Escape closes it, arrow keys change photo, and the
    // page behind stops scrolling.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, next, prev]);

  // Swipe on phones: compare where the finger started and ended. A move of more
  // than 40 pixels counts as a swipe.
  const startX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    startX.current = null;
    const THRESH = 40;
    if (dx > THRESH) prev();
    else if (dx < -THRESH) next();
  };

  return (
    <>
      {/* Thumbs */}
      {/* Two photos share the row rather than leaving a third of it empty. */}
      <div className={`grid grid-cols-2 gap-2 ${items.length === 2 ? "" : "md:grid-cols-3"}`}>
        {items.map((it, i) => (
          <button
            key={it.src + i}
            onClick={() => openAt(i)}
            className="group relative block aspect-[4/3] overflow-hidden bg-surface"
            aria-label={`Open image ${i + 1}${it.alt ? `: ${it.alt}` : ""}`}
          >
            <Image
              src={it.src}
              alt={it.alt || ""}
              fill
              sizes="(min-width:768px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 ease-[var(--ease-out-strong)] group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90"
          onClick={close}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Image ${idx + 1} of ${items.length}${
              items[idx]?.alt ? `: ${items[idx]?.alt}` : ""
            }`}
            tabIndex={-1}
            className="relative w-full max-w-5xl outline-none"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden">

              <figure
                key={animKey}
                className="absolute inset-0 animate-[fade-up_400ms_var(--ease-out-strong)_both] motion-reduce:animate-none"
              >
                {loaded[items[idx].src] !== "failed" && (
                  <Image
                    src={items[idx].src}
                    alt={items[idx].alt || ""}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    priority
                    onLoad={() => mark(items[idx].src, "ready")}
                    onError={() => mark(items[idx].src, "failed")}
                  />
                )}
                {!loaded[items[idx].src] && (
                  <span
                    role="status"
                    className="absolute inset-0 grid place-items-center text-[length:var(--text-small)] text-white/80"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none"
                      />
                      Loading photo
                    </span>
                  </span>
                )}
                {loaded[items[idx].src] === "failed" && (
                  <p
                    role="alert"
                    className="absolute inset-0 grid place-items-center px-6 text-center text-white/80"
                  >
                    This photo could not be loaded.
                  </p>
                )}
                {items[idx].alt && (
                  <figcaption className="absolute bottom-3 left-3 bg-ink px-3 py-1.5 text-[length:var(--text-small)] text-white">
                    {items[idx].alt}
                  </figcaption>
                )}
              </figure>

              <button
                onClick={close}
                aria-label="Close"
                className="absolute top-2 right-2 inline-flex items-center justify-center h-11 w-11 bg-ground text-ink transition-colors hover:bg-olive"
              >
                <X className="h-5 w-5" />
              </button>

              {items.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center bg-ground text-ink transition-colors hover:bg-olive"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center bg-ground text-ink transition-colors hover:bg-olive"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {items.length > 1 && (
                <div className="absolute bottom-3 right-3">
                  <span className="bg-ground px-3 py-1.5 text-[length:var(--text-small)] tabular-nums text-ink">
                    {idx + 1} / {items.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
