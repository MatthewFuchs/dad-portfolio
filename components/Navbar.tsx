"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const onHome = pathname === "/";

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/projects", label: "Projects" },
    { href: "/presentations", label: "Presentations" },
    { href: "/resources", label: "Resources" },
    { href: "/about", label: "About" },
  ];

  const navClass = onHome
    ? "absolute top-0 left-0 w-full z-40 p-6 flex items-center justify-between text-white"
    : "fixed top-0 left-0 w-full z-40 p-4 flex items-center justify-between bg-white/95 backdrop-blur border-b border-gray-200 text-gray-900";

  return (
    <>
      <nav className={navClass}>
        <Link
          href="/"
          className="flex items-center"
          aria-label="Go to homepage"
        >
          <img
            src="/fuchs.png"
            alt="Fuchs Sales Logo"
            className="h-12 w-auto transition hover:opacity-80"
          />
        </Link>

        <button
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          className="z-10 p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black transition-transform duration-300 hover:scale-110"
        >
          {isOpen ? (
            <X size={36} className="stroke-current" />
          ) : (
            <Menu size={36} className="stroke-current" />
          )}
        </button>
      </nav>

      {mounted &&
        createPortal(
          <>
            {isOpen && (
              <div
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm opacity-100 transition-opacity duration-300"
              />
            )}

            <aside
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              className={`fixed top-0 right-0 h-full w-72 z-[100] bg-black text-white transform transition-transform duration-500 ease-in-out ${
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
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="relative group"
                  >
                    {link.label}
                    <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
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
