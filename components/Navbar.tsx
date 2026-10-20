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
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Publish nav height to --nav-h CSS var (used by Breadcrumbs)
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

  const solid = !onHome || isSolid;
  const surface = isOpen
    ? "bg-ink text-white"
    : solid
    ? "bg-olive text-ink"
    : "bg-transparent text-white";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* a11y skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:bg-ink focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <nav ref={navRef} className={`${wrapper} ${surface}`}>
        <div className="gutter pt-[env(safe-area-inset-top)]">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            <Link
              href="/"
              aria-label="Go to homepage"
              className="flex min-h-11 items-center"
            >
              <img
                src="/fuchs.png"
                alt="Fuchs Sales Logo"
                className="h-10 lg:h-12 w-auto transition-opacity hover:opacity-90"
              />
            </Link>

            {/* Desktop */}
            <div className="hidden lg:flex items-center gap-8 xl:gap-9 text-[length:var(--text-small)] font-medium">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="relative group py-2"
                  aria-current={isActive(l.href) ? "page" : undefined}
                >
                  {l.label}
                  <span
                    className={`absolute left-0 bottom-1 h-0.5 w-full origin-left bg-current transition-transform duration-300 ease-[var(--ease-out-strong)] group-hover:scale-x-100 ${
                      isActive(l.href) ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
              ))}
              <Link
                href="/contact"
                aria-current={isActive("/contact") ? "page" : undefined}
                className={`inline-flex h-11 items-center px-5 transition-[background-color,transform] duration-200 active:scale-[0.98] ${
                  solid
                    ? "bg-ink text-white hover:bg-black"
                    : "bg-olive text-ink hover:bg-olive-deep"
                }`}
              >
                Contact
              </Link>
            </div>

            {/* Mobile: the main action stays visible next to the menu */}
            <div className="flex items-center gap-2 lg:hidden">
              <Link
                href="/contact"
                aria-current={isActive("/contact") ? "page" : undefined}
                className={`inline-flex h-11 items-center px-4 text-[length:var(--text-small)] font-medium transition-[background-color,transform] duration-200 active:scale-[0.98] ${
                  solid
                    ? "bg-ink text-white hover:bg-black"
                    : "bg-white text-ink hover:bg-olive"
                }`}
              >
                Contact
              </Link>
              <button
                onClick={() => setIsOpen(true)}
                aria-label="Open menu"
                className="-mr-2 inline-flex h-11 w-11 items-center justify-center"
              >
                <Menu size={30} className="stroke-current" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mounted &&
        createPortal(
          <>
            {isOpen && (
              <div
                className="fixed inset-0 z-[60] bg-black/50"
                onClick={() => setIsOpen(false)}
              />
            )}

            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              data-lenis-prevent
              aria-hidden={!isOpen}
              inert={!isOpen}
              className={`fixed top-0 right-0 z-[70] h-full w-[88vw] max-w-[420px] transform bg-ink text-white transition-transform duration-500 ease-[var(--ease-out-strong)] ${
                isOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between px-6 py-5">
                <span className="text-lg text-white/70">Menu</span>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                  className="-mr-2 inline-flex h-11 w-11 items-center justify-center transition-colors hover:text-olive"
                >
                  <X size={28} className="stroke-current" />
                </button>
              </div>
              <nav className="flex flex-col px-6 pt-4 pb-10 space-y-1 text-[1.75rem] leading-tight tracking-[-0.02em]">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex min-h-11 items-center transition-colors hover:text-olive"
                  aria-current={pathname === "/" ? "page" : undefined}
                >
                  Home
                </Link>
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex min-h-11 items-center transition-colors hover:text-olive ${
                      isActive(l.href) ? "text-olive" : ""
                    }`}
                    aria-current={isActive(l.href) ? "page" : undefined}
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="btn !mt-10 self-start"
                >
                  Contact
                </Link>
              </nav>
            </aside>
          </>,
          document.body
        )}
    </>
  );
}
