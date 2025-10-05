"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type Item = { src: string; alt?: string };

export default function Gallery({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const openAt = (i: number) => {
    setIdx(i);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % items.length);
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items.length]);

  return (
    <>
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

      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="relative w-full max-w-5xl aspect-[16/10]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={items[idx].src}
              alt={items[idx].alt || ""}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold hover:bg-white"
              aria-label="Close"
            >
              Close
            </button>
            {items.length > 1 && (
              <>
                <button
                  onClick={() => setIdx((i) => (i - 1 + items.length) % items.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold hover:bg-white"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  onClick={() => setIdx((i) => (i + 1) % items.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold hover:bg-white"
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}