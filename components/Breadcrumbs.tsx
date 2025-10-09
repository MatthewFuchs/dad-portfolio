// components/Breadcrumbs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

type Props = {
  /** Hide breadcrumbs on these exact paths */
  hideOn?: string[];
  /** Extra classes for the outer wrapper (positioning, etc.) */
  className?: string;
  /** Optional pretty labels per segment */
  labelMap?: Record<string, string>;
};

function humanize(seg: string) {
  return seg.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Breadcrumbs({
  hideOn = ["/"],
  className = "",
  labelMap = {
    products: "Manufacturers",
    resources: "Learning Resources",
    projects: "Projects",
    contact: "Contact",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    team: "Team",
  },
}: Props) {
  const pathname = usePathname() || "/";
  if (hideOn.includes(pathname)) return null;

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  const crumbs = parts.map((seg, i) => {
    const href = "/" + parts.slice(0, i + 1).join("/");
    const label = labelMap[seg] ?? humanize(seg);
    return { href, label };
  });

  return (
    <div
      className={
        "border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 " +
        className
      }
    >
      <nav
        aria-label="Breadcrumb"
        className="max-w-6xl mx-auto px-4 md:px-16 py-2.5 text-sm text-gray-600"
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
  );
}
