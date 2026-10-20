"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

type Props = {
  hideOn?: string[];
  offsetPx?: number;
  className?: string;
  labelMap?: Record<string, string>;
};

function humanize(seg: string) {
  return seg.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Breadcrumbs({
  hideOn = ["/"],
  offsetPx = 64,
  className = "",
  labelMap = {
    products: "Products",
    resources: "Resources",
    projects: "Projects",
    presentations: "Presentations",
    contact: "Contact",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    about: "About",
  },
}: Props) {
  const pathname = usePathname() || "/";
  if (hideOn.includes(pathname)) return null;

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  const crumbs = parts.map((seg, i) => ({
    href: "/" + parts.slice(0, i + 1).join("/"),
    label: labelMap[seg] ?? humanize(seg),
  }));

  const topValue = `var(--nav-h, ${offsetPx}px)`;

  return (
    <>
      <div
        className={[
          "sticky z-30 bg-ground",
          className,
        ].join(" ")}
        style={{
          top: topValue, // sits directly under the nav
          scrollMarginTop: `calc(${topValue} + 8px)`,
        }}
      >
        <nav
          aria-label="Breadcrumb"
          className="gutter py-3 text-[length:var(--text-small)] text-soft"
        >
          <ol className="flex flex-wrap items-center gap-1.5">
            <li className="shrink-0">
              <Link
                href="/"
                className="link decoration-transparent hover:decoration-current hover:text-ink"
              >
                Home
              </Link>
            </li>
            {crumbs.map((c, idx) => (
              <li key={c.href} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                {idx === crumbs.length - 1 ? (
                  <span className="text-ink" aria-current="page">{c.label}</span>
                ) : (
                  <Link
                    href={c.href}
                    className="link decoration-transparent hover:decoration-current hover:text-ink"
                  >
                    {c.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

    </>
  );
}
