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
          "sticky z-30 bg-white border-b border-gray-200 supports-[backdrop-filter]:bg-white/80 backdrop-blur",
          className,
        ].join(" ")}
        style={{
          top: topValue,
          marginTop: topValue,
          scrollMarginTop: `calc(${topValue} + 8px)`,
        }}
      >
        <nav
          aria-label="Breadcrumb"
          className="max-w-6xl mx-auto px-4 md:px-16 py-2 text-sm text-gray-700"
        >
          <ol className="flex flex-wrap items-center gap-1.5">
            <li className="shrink-0">
              <Link
                href="/"
                className="underline decoration-transparent hover:decoration-gray-500"
              >
                Home
              </Link>
            </li>
            {crumbs.map((c, idx) => (
              <li key={c.href} className="flex items-center gap-1.5">
                <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden />
                {idx === crumbs.length - 1 ? (
                  <span className="text-gray-900 font-medium">{c.label}</span>
                ) : (
                  <Link
                    href={c.href}
                    className="underline decoration-transparent hover:decoration-gray-500"
                  >
                    {c.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              ...crumbs.map((c, i) => ({
                "@type": "ListItem",
                position: i + 2,
                name: c.label,
                item: c.href,
              })),
            ],
          }),
        }}
      />
    </>
  );
}
