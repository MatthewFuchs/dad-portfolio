// The page visitors see when a web address doesn't exist (a 404).
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Suggested pages, so a wrong link isn't a dead end.
const PLACES = [
  { href: "/", label: "Homepage", note: "Start again from the top." },
  { href: "/products", label: "Manufacturers", note: "Companies we represent." },
  { href: "/projects", label: "Projects", note: "Selected work across BC." },
  { href: "/resources", label: "Resources", note: "Specs, brochures and install guides." },
  { href: "/contact", label: "Contact", note: "Representation or a project." },
];

export default function NotFound() {
  return (
    <div className="bg-ground text-ink gutter pt-24 lg:pt-28 pb-16 md:pb-24 grid gap-12 md:grid-cols-12 md:gap-x-6">
      <div className="md:col-span-5">
        <h1 className="text-[length:var(--text-display)] leading-[0.98] tracking-[-0.035em]">
          Not found
        </h1>
        <p className="mt-5 text-[length:var(--text-lead)] leading-snug max-w-[30ch]">
          This page does not exist.{" "}
          The link may be broken or the page may have moved.
        </p>
        <p className="mt-8 text-soft">
          Think this is a mistake?{" "}
          <a
            href="mailto:gfuchs@fuchs-sales.ca?subject=Broken%20link%20on%20fuchs-sales.ca"
            className="link text-ink"
          >
            Report a broken link
          </a>
          .
        </p>
      </div>
      <ul className="md:col-start-7 md:col-span-6 space-y-1.5 md:mt-4">
        {PLACES.map((p, i) => (
          <li key={p.href} >
            <Link
              href={p.href}
              className="group flex items-center justify-between gap-6 bg-surface px-5 py-5 transition-colors hover:bg-olive"
            >
              <span>
                <span className="block text-[length:var(--text-lead)] tracking-[-0.02em]">
                  {p.label}
                </span>
                <span className="block text-[length:var(--text-small)] text-soft group-hover:text-ink">
                  {p.note}
                </span>
              </span>
              <ArrowRight
                className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
