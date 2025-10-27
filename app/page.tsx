import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { PROJECTS } from "../data/projects";
import { MapPin, Award, Handshake, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Fuchs Sales & Consulting — Technical Sales in Canada",
  description:
    "Technical sales & manufacturer representation for commercial and industrial construction across Canada, specializing in tilt-up and precast.",
  alternates: { canonical: "/" },
  keywords: [
    "technical sales",
    "manufacturer representation",
    "tilt-up",
    "precast",
    "concrete",
    "construction",
    "Canada",
    "specification support",
    "distribution",
    "commercial construction",
    "industrial construction",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      ["max-snippet"]: -1,
      ["max-image-preview"]: "large",
      ["max-video-preview"]: -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Fuchs Sales & Consulting",
    title: "Fuchs Sales & Consulting — Technical Sales in Canada",
    description:
      "Technical sales & manufacturer representation for commercial and industrial construction across Canada.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Fuchs Sales & Consulting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fuchs Sales & Consulting — Technical Sales in Canada",
    description:
      "Technical sales & manufacturer representation for commercial and industrial construction across Canada.",
    images: ["/og.jpg"],
  },
};

export default function HomePage() {
  const featured = [...PROJECTS]
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    .slice(0, 3);

  return (
    <main className="bg-white text-gray-900">
      {/* HERO */}
      <section className="relative h-screen w-full overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <div className="max-w-3xl w-full">
            <div
              className="hero-rotator relative h-[9.5rem] md:h-[12rem]"
              aria-live="off"
            >
              {/* Slide 1: brand + description */}
              <div className="hero-slide absolute inset-0 flex flex-col items-center justify-center px-2">
                <h1 className="text-4xl md:text-6xl font-bold">
                  Fuchs Sales and Consulting
                </h1>
                <p className="mt-4 max-w-3xl text-lg md:text-2xl text-white/95">
                  Technical Sales and Marketing Services for Commercial and
                  Industrial Construction Markets in Canada
                </p>
              </div>

              {/* Slide 2 */}
              <div className="hero-slide absolute inset-0 flex flex-col items-center justify-center px-2">
                <h2 className="text-3xl md:text-5xl font-semibold">
                  Sustainable Materials & Envelopes
                </h2>
                <p className="mt-3 max-w-2xl text-base md:text-xl text-white/90">
                  Thermal breaks, insulation systems, and energy-efficient
                  details.
                </p>
              </div>

              {/* Slide 3 */}
              <div className="hero-slide absolute inset-0 flex flex-col items-center justify-center px-2">
                <h2 className="text-3xl md:text-5xl font-semibold">
                  Blue-Green Stormwater Systems
                </h2>
                <p className="mt-3 max-w-2xl text-base md:text-xl text-white/90">
                  Capture, store, and reuse rainwater where it falls with
                  Permavoid.
                </p>
              </div>

              {/* Slide 4 */}
              <div className="hero-slide absolute inset-0 flex flex-col items-center justify-center px-2">
                <h2 className="text-3xl md:text-5xl font-semibold">
                  From Spec to Install
                </h2>
                <p className="mt-3 max-w-2xl text-base md:text-xl text-white/90">
                  Presentations, distribution, and hands-on technical support
                  across Canada.
                </p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <span
              aria-hidden="true"
              className="block text-emerald-500 text-4xl drop-shadow-[0_0_10px_rgba(16,185,129,0.65)] animate-bounce motion-reduce:animate-none"
            >
              ↓
            </span>
          </div>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
              .hero-rotator .hero-slide{
                opacity:0; transform:translateY(8px) scale(.985);
                transition:opacity .6s ease, transform .6s ease;
                animation:heroFade 24s infinite;
              }
              .hero-rotator .hero-slide:nth-child(1){ animation-delay: 0s; }
              .hero-rotator .hero-slide:nth-child(2){ animation-delay: 6s; }
              .hero-rotator .hero-slide:nth-child(3){ animation-delay: 12s; }
              .hero-rotator .hero-slide:nth-child(4){ animation-delay: 18s; }
              @keyframes heroFade{
                0%   { opacity:0; transform:translateY(8px) scale(.985); }
                6%   { opacity:1; transform:translateY(0) scale(1); }
                25%  { opacity:1; transform:translateY(0) scale(1); }
                31%  { opacity:0; transform:translateY(-6px) scale(.99); }
                100% { opacity:0; transform:translateY(-6px) scale(.99); }
              }
              @media (prefers-reduced-motion: reduce){
                .hero-rotator{ height:auto }
                .hero-rotator .hero-slide{ animation:none; opacity:1; position:static; transform:none }
                .hero-rotator .hero-slide:not(:first-child){ display:none }
              }
            `,
          }}
        />
      </section>

      {/* ABOUT */}
      <section className="py-20 px-6 md:px-16 text-center bg-gray-50">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">About Us</h2>
        <p className="max-w-4xl mx-auto text-lg text-gray-700 leading-relaxed">
          We provide technical sales and marketing services for manufacturers in
          the commercial and industrial construction markets in Canada. From
          specification to installation, we are your partner through the entire
          process. Manufacturers can leverage their sales and marketing dollars
          into a results-only expense through our commission-only fee structure.
          <br />
          <br />
          Our strong relationships with designers, distributors, and contractors
          drive product sales through the full sales cycle. We pride ourselves
          on delivering expert technical support and product knowledge to the
          entire construction team. We specialize in cast-in-place and precast
          construction materials, working with leading manufacturers who provide
          ongoing technical innovation and reliable, cost-effective solutions.
        </p>
      </section>

      {/* SERVICES */}
      <section className="py-20 px-6 md:px-16 bg-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          Services Provided
        </h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {[
            {
              t: "Product Specifications",
              p: "We provide technical training and product expertise to design professionals. Through technical presentations, we introduce effective methods and connect manufacturers with design teams early in the process to drive product specifications.",
            },
            {
              t: "Distribution",
              p: "Our network of regional and national distribution partners helps streamline the supply chain. We work with leading distribution companies to ensure reliable product availability and sales support for manufacturers.",
            },
            {
              t: "Sales",
              p: "We maintain relationships with general and specialized contractors, providing expert product knowledge and technical support. These trusted relationships help manufacturers achieve results through proven sales performance.",
            },
          ].map((c) => (
            <div
              key={c.t}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-lg hover:border-gray-300 focus-within:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2">{c.t}</h3>
              <p className="text-gray-700">{c.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROOF POINTS */}
      <section className="px-6 md:px-16 py-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">
            Why Teams Work With Us
          </h2>
          <div className="mt-8 grid gap-y-8 gap-x-12 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:pl-8 lg:border-l lg:border-gray-200 first:lg:border-none first:lg:pl-0">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-gray-200">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                </span>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">
                    Canada-Wide
                  </div>
                  <p className="text-sm text-gray-600">Coverage & support</p>
                </div>
              </div>
            </div>
            <div className="lg:pl-8 lg:border-l lg:border-gray-200">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-gray-200">
                  <Award className="h-4 w-4 text-emerald-600" />
                </span>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">
                    15+ Years
                  </div>
                  <p className="text-sm text-gray-600">
                    Technical sales experience
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:pl-8 lg:border-l lg:border-gray-200">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-gray-200">
                  <Handshake className="h-4 w-4 text-emerald-600" />
                </span>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">
                    0 Retainers
                  </div>
                  <p className="text-sm text-gray-600">
                    Commission-only representation
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:pl-8 lg:border-l lg:border-gray-200">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-gray-200">
                  <Clock className="h-4 w-4 text-emerald-600" />
                </span>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">
                    Fast Response
                  </div>
                  <p className="text-sm text-gray-600">
                    We respond fast and promptly
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="py-20 px-6 md:px-16 bg-gray-50 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          Featured Projects
        </h2>
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {featured.map((p, i) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="group rounded-2xl overflow-hidden border border-gray-200 bg-white hover:shadow-lg transition text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src={p.hero}
                  alt={p.title}
                  fill
                  sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  priority={i === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <div className="absolute bottom-2 left-2 flex flex-wrap gap-2">
                  {p.sectors.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-900 ring-1 ring-emerald-200/60"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {p.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {p.location}
                  {p.year ? ` • ${p.year}` : ""}
                </p>
                <p className="text-gray-800 mt-3 line-clamp-3">{p.summary}</p>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/projects"
          className="mt-8 inline-block bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          View All Projects
        </Link>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-16 bg-black text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Looking for representation in Canada?
        </h2>
        <p className="max-w-2xl mx-auto mb-6 text-lg text-white/90">
          Let us connect your products with the right partners in the tilt-up
          and precast construction markets.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          Contact Us
        </Link>
      </section>
    </main>
  );
}
