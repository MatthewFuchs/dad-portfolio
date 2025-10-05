import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 text-white">
      {/* subtle gradient hairline */}
      <div
        aria-hidden
        className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />

      <div className="px-6 md:px-16">
        <div className="mx-auto max-w-6xl py-10 md:py-12 grid gap-8 md:grid-cols-3">
          {/* Brand / Mission */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <img
                src="/fuchs.png"
                alt="Fuchs Sales & Consulting logo"
                className="h-10 w-auto"
              />
              <span className="sr-only">Fuchs Sales & Consulting</span>
            </Link>

            <p className="mt-3 text-sm text-white/80 max-w-sm">
              Technical sales & manufacturer representation for tilt-up and
              precast construction across Canada.
            </p>

            {/* value chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs bg-white/10 border border-white/15">
                Sustainability-minded
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs bg-white/10 border border-white/15">
                Partner-first
              </span>
            </div>
          </div>

          {/* Site links */}
          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-6"
          >
            <div>
              <h3 className="text-sm font-semibold">Site</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href="/"
                    className="hover:underline hover:text-white/90"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="hover:underline hover:text-white/90"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/projects"
                    className="hover:underline hover:text-white/90"
                  >
                    Projects
                  </Link>
                </li>
                <li>
                  <Link
                    href="/resources"
                    className="hover:underline hover:text-white/90"
                  >
                    Learning
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Legal</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href="/terms"
                    className="hover:underline hover:text-white/90"
                  >
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:underline hover:text-white/90"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </nav>

          {/* Contact / CTA */}
          <div>
            <h3 className="text-sm font-semibold">Get in touch</h3>
            <p className="mt-3 text-sm text-white/80">
              Based in British Columbia, Canada
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href="mailto:gfuchs@fuchs-sales.ca"
                  className="underline hover:text-white/90"
                >
                  gfuchs@fuchs-sales.ca
                </a>
              </li>
              <li>
                <a
                  href="tel:+17782416316"
                  className="underline hover:text-white/90"
                >
                  +1 (778) 241-6316
                </a>
              </li>
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-white text-black px-3 py-1.5 text-sm font-semibold hover:bg-white/90"
              >
                Contact
              </Link>
              <a
                href="mailto:gfuchs@fuchs-sales.ca?subject=Presentation%20request"
                className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-sm font-semibold hover:bg-white/10"
              >
                Request a presentation
              </a>
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mx-auto max-w-6xl border-t border-white/10 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-white/70">
          <p>
            &copy; {year} Fuchs Sales and Consulting Limited. All rights
            reserved.
          </p>
          <p className="mt-2 sm:mt-0">
            <span className="text-white/60">Built with Next.js & Tailwind</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
