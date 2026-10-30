import Link from "next/link";

// The footer's link lists. Add or remove a line here to change a list; the main
// menu has its own list in Navbar.tsx.
const SITE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/projects", label: "Projects" },
  { href: "/presentations", label: "Presentations" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms of Use" },
  { href: "/privacy", label: "Privacy Policy" },
];

// min-h-11 keeps every footer link a comfortable tap target on phones.
const linkCls =
  "link inline-flex min-h-11 items-center decoration-transparent hover:decoration-current md:min-h-0";

export default function Footer() {
  // Keeps the copyright year current.
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white">
      <div className="gutter pt-16 md:pt-20 pb-8">
        {/* The name, at full width */}
        <Link
          href="/"
          aria-label="Fuchs Sales & Consulting, home"
          className="block whitespace-nowrap text-[8.6vw] leading-[0.95] tracking-[-0.04em] transition-colors hover:text-olive"
        >
          Fuchs Sales &amp; Consulting
        </Link>

        <div className="mt-12 md:mt-14 grid gap-14 md:grid-cols-12 md:gap-x-6">
          {/* Ways to reach us */}
          <div className="md:col-span-6 lg:col-span-5">
            <ul className="space-y-2 text-[length:var(--text-lead)] leading-tight tracking-[-0.02em]">
              <li>
                <a
                  href="mailto:gfuchs@fuchs-sales.ca"
                  className="inline-flex min-h-11 items-center text-olive transition-colors hover:text-white"
                >
                  gfuchs@fuchs-sales.ca
                </a>
              </li>
              <li>
                <a
                  href="tel:+17782416316"
                  className="inline-flex min-h-11 items-center text-olive transition-colors hover:text-white"
                >
                  +1 (778) 241-6316
                </a>
              </li>
              <li className="text-white/75">British Columbia, Canada</li>
            </ul>
            <p className="mt-8 max-w-[40ch] text-white/75">
              Technical sales and marketing services for commercial and
              industrial construction markets in Canada.
            </p>
          </div>

          {/* Links */}
          <nav
            aria-label="Footer navigation"
            className="md:col-start-7 md:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8 text-[length:var(--text-small)]"
          >
            <div>
              <h2 className="text-white/60 text-[length:var(--text-small)] tracking-normal">Site</h2>
              <ul className="mt-2 md:mt-4 md:space-y-2.5">
                {SITE_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={linkCls}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-white/60 text-[length:var(--text-small)] tracking-normal">Legal</h2>
              <ul className="mt-2 md:mt-4 md:space-y-2.5">
                {LEGAL_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={linkCls}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h2 className="text-white/60 text-[length:var(--text-small)] tracking-normal">Get in touch</h2>
              <ul className="mt-2 md:mt-4 md:space-y-2.5">
                <li>
                  <Link href="/contact" className={linkCls}>
                    Contact
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:gfuchs@fuchs-sales.ca?subject=Presentation%20request"
                    className={linkCls}
                  >
                    Request a presentation
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-14 md:mt-16 flex flex-wrap items-baseline justify-between gap-4 text-[length:var(--text-small)] text-white/60">
          <p>
            &copy; {year} Fuchs Sales and Consulting Limited. All rights
            reserved.
          </p>
          <a href="#main" className={`${linkCls} hover:text-white`}>
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
