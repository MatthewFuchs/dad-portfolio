"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Item = { src: string; alt?: string };

export default function Gallery({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const openAt = (i: number) => {
    setIdx(i);
    setAnimKey((k) => k + 1);
    setOpen(true);
  };

  const close = useCallback(() => setOpen(false), []);

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <button
            key={it.src + i}
            onClick={() => openAt(i)}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-white"
            aria-label={`Open image ${i + 1}`}
          >
            <Image
              src={it.src}
              alt={it.alt || ""}
              fill
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={close}
          aria-hidden="true"
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
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden ring-1 ring-white/10 bg-black/30">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-black/30 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-black/30 to-transparent" />

              <figure
                key={animKey}
                className="absolute inset-0 will-change-[opacity,transform] animate-[fadeIn_320ms_ease-out] motion-reduce:animate-none"
              >
                <Image
                  src={items[idx].src}
                  alt={items[idx].alt || ""}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
                {items[idx].alt && (
                  <figcaption className="absolute bottom-2 left-3 right-3 text-[13px] leading-5 text-white/95 drop-shadow">
                    {items[idx].alt}
                  </figcaption>
                )}
              </figure>

              <button
                onClick={close}
                aria-label="Close"
                className="absolute top-2 right-2 inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/90 ring-1 ring-gray-300 shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              >
                <X className="h-5 w-5" />
              </button>

              {items.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 ring-1 ring-gray-300 shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 ring-1 ring-gray-300 shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {items.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center">
                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium ring-1 ring-gray-300 shadow-sm">
                    {idx + 1} / {items.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.995);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
