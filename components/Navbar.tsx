"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSolid, setIsSolid] = useState(!onHome);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => setIsOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const setVar = () =>
      document.documentElement.style.setProperty(
        "--nav-h",
        `${el.offsetHeight}px`
      );
    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    window.addEventListener("resize", setVar, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setVar);
    };
  }, []);

  useEffect(() => {
    if (!onHome) return;
    const onScroll = () => setIsSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onHome]);

  const navLinks = [
    { href: "/products", label: "Products" },
    { href: "/projects", label: "Projects" },
    { href: "/presentations", label: "Presentations" },
    { href: "/resources", label: "Resources" },
    { href: "/about", label: "About" },
  ];

  const wrapper =
    "fixed top-0 left-0 w-full z-50 transition-colors duration-300";
  const surface = onHome
    ? isSolid
      ? "bg-white text-gray-900 border-b border-gray-200 shadow-sm supports-[backdrop-filter]:bg-white/70 backdrop-blur-md"
      : "bg-transparent text-white"
    : "bg-white text-gray-900 border-b border-gray-200 shadow-sm";

  return (
    <>
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-black focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <nav ref={navRef} className={`${wrapper} ${surface}`}>
        <div className="mx-auto max-w-6xl px-6 md:px-16 pt-[env(safe-area-inset-top)]">
          <div className="flex h-16 md:h-20 items-center justify-between">
            <Link
              href="/"
              aria-label="Go to homepage"
              className="flex items-center"
            >
              <img
                src="/fuchs.png"
                alt="Fuchs Sales Logo"
                className="h-10 md:h-12 w-auto transition-opacity hover:opacity-90"
              />
            </Link>

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-8 text-[15px] font-medium">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="relative group"
                  aria-current={pathname === l.href ? "page" : undefined}
                >
                  {l.label}
                  <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-current transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Mobile trigger */}
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
              className="md:hidden p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
            >
              <Menu size={32} className="stroke-current" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mounted &&
        createPortal(
          <>
            {isOpen && (
              <div
                className="fixed inset-0 z-[45] bg-black/50 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
              />
            )}
            <aside
              role="dialog"
              aria-modal="true"
              className={`fixed top-0 right-0 z-[55] h-full w-72 max-w-[85vw] transform bg-black text-white transition-transform duration-400 ease-out ${
                isOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                <span className="text-lg font-semibold">Menu</span>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                  className="p-2 rounded-md hover:bg-white/10 transition"
                >
                  <X size={28} className="stroke-current" />
                </button>
              </div>

              <nav className="flex flex-col p-8 space-y-6 text-lg font-medium">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="relative group"
                >
                  Home
                  <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-white transition-all duration-300 group-hover:w-full" />
                </Link>
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setIsOpen(false)}
                    className="relative group"
                    aria-current={pathname === l.href ? "page" : undefined}
                  >
                    {l.label}
                    <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-white transition-all duration-300 group-hover:w-full" />
                  </Link>
                ))}
              </nav>
            </aside>
          </>,
          document.body
        )}
    </>
  );
}
