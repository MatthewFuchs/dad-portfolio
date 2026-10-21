"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

/** An admin preview image: a soft pulse while it loads, and a plain
 *  "no preview" mark (not a broken-image icon) if it can't be shown. */
export default function Thumb({ src, className = "", label = "Preview not available" }: { src: string; className?: string; label?: string }) {
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  if (state === "failed") {
    return (
      <span className="absolute inset-0 grid place-items-center text-soft" title={label}>
        <ImageOff aria-hidden className="size-5" />
        <span className="sr-only">{label}</span>
      </span>
    );
  }
  return (
    <>
      {state === "loading" && <span aria-hidden className="absolute inset-0 animate-pulse bg-ink/[0.06]" />}
      <img
        src={src}
        alt=""
        // Already loaded from the browser cache: no load event follows.
        ref={(img) => {
          if (img?.complete && img.naturalWidth > 0 && state === "loading") setState("ready");
        }}
        onLoad={() => setState("ready")}
        onError={() => setState("failed")}
        className={`transition-opacity duration-200 ${state === "ready" ? "opacity-100" : "opacity-0"} ${className}`}
      />
    </>
  );
}
