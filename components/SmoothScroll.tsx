"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

// Smooth scrolling for the whole site, plus a gentle parallax on any picture
// marked [data-parallax] (the picture sits inside an overflow-hidden box).
// Both are skipped for visitors who prefer reduced motion.
const SCALE = 1.14; // headroom so the shifted picture never shows an edge
const TRAVEL = 0.06; // share of the box height a picture moves at most

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.1 });

    const parallax = () => {
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const box = el.parentElement?.getBoundingClientRect();
        if (!box || box.bottom < -200 || box.top > vh + 200) return;
        const progress =
          (box.top + box.height / 2 - vh / 2) / (vh / 2 + box.height / 2);
        const shift = Math.max(-1, Math.min(1, progress)) * box.height * TRAVEL;
        el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0) scale(${SCALE})`;
      });
    };

    lenis.on("scroll", parallax);
    window.addEventListener("resize", parallax, { passive: true });
    parallax();

    // New pages bring new pictures: place them before the first scroll.
    const mo = new MutationObserver(parallax);
    mo.observe(document.body, { childList: true, subtree: true });

    // Menus and dialogs lock the page with body overflow; pause Lenis with them.
    const lock = new MutationObserver(() => {
      if (document.body.style.overflow === "hidden") lenis.stop();
      else lenis.start();
    });
    lock.observe(document.body, { attributes: true, attributeFilter: ["style"] });

    return () => {
      mo.disconnect();
      lock.disconnect();
      window.removeEventListener("resize", parallax);
      lenis.destroy();
    };
  }, []);

  return null;
}
