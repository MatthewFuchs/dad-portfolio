"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const POSTER = "/video/hero-poster.jpg";
const SOURCES = { small: "/video/hero-540.mp4", large: "/video/hero-720.mp4" };

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

// The hero's background footage. The poster frame paints first (it is the
// largest image on the page); the clip only starts downloading once the page
// has loaded, and fades in when it is actually playing. Visitors who prefer
// reduced motion, have Data Saver on or are on 2G keep the still frame, and so
// does anyone whose browser fails to load or play the clip.
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: NetworkInformation })
      .connection;
    const skip =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      conn?.saveData === true ||
      /(^|-)2g$/.test(conn?.effectiveType ?? "");
    if (skip) return;

    const pick = () =>
      setSrc(
        window.matchMedia("(max-width: 767px)").matches
          ? SOURCES.small
          : SOURCES.large
      );
    if (document.readyState === "complete") pick();
    else {
      window.addEventListener("load", pick, { once: true });
      return () => window.removeEventListener("load", pick);
    }
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    // Autoplay can still be refused (Low Power Mode); the poster then stays.
    v.play().catch(() => setPlaying(false));
  }, [src]);

  return (
    <>
      {/* Optimized and sized per screen; priority so it is the first image fetched. */}
      <Image
        src={POSTER}
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        data-parallax
        className="object-cover"
      />
      {src && (
        <video
          ref={ref}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-hidden="true"
          data-parallax
          onPlaying={() => setPlaying(true)}
          onError={() => setSrc(null)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            playing ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </>
  );
}
