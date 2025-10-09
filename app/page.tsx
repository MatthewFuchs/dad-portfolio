import Link from "next/link";
import Image from "next/image";
import { PROJECTS } from "../data/projects";

export const metadata = {
  title: "Fuchs Sales and Consulting | Home",
  description:
    "Fuchs Sales and Consulting Limited provides technical sales and manufacturer representation for commercial and industrial construction across Canada.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const featured = [...PROJECTS]
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    .slice(0, 3);

  return (
    <main className="bg-white text-gray-900">
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
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold">
            Fuchs Sales and Consulting
          </h1>
          <p className="mt-4 max-w-3xl text-lg md:text-2xl">
            Technical Sales and Marketing Services for Commercial and Industrial
            Construction Markets in Canada
          </p>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <span
              aria-hidden="true"
              className="block text-emerald-500 text-4xl drop-shadow-[0_0_10px_rgba(16,185,129,0.65)] animate-bounce motion-reduce:animate-none"
            >
              ↓
            </span>
          </div>
        </div>
      </section>

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

      <section className="py-20 px-6 md:px-16 bg-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          Services Provided
        </h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          <div className="p-6 bg-gray-100 rounded-xl shadow hover:shadow-lg transition text-left">
            <h3 className="text-xl font-semibold mb-2">
              Product Specifications
            </h3>
            <p>
              We provide technical training and product expertise to design
              professionals. Through technical presentations, we introduce
              effective methods and connect manufacturers with design teams
              early in the process to drive product specifications.
            </p>
          </div>

          <div className="p-6 bg-gray-100 rounded-xl shadow hover:shadow-lg transition text-left">
            <h3 className="text-xl font-semibold mb-2">Distribution</h3>
            <p>
              Our network of regional and national distribution partners helps
              streamline the supply chain. We work with leading distribution
              companies to ensure reliable product availability and sales
              support for manufacturers.
            </p>
          </div>

          <div className="p-6 bg-gray-100 rounded-xl shadow hover:shadow-lg transition text-left">
            <h3 className="text-xl font-semibold mb-2">Sales</h3>
            <p>
              We maintain relationships with general and specialized
              contractors, providing expert product knowledge and technical
              support. These trusted relationships help manufacturers achieve
              results through proven sales performance.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 md:px-16 bg-gray-50 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          Featured Projects
        </h2>

        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {featured.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="group rounded-2xl overflow-hidden border border-gray-200 bg-white hover:shadow-lg transition text-left"
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src={p.hero}
                  alt={p.title}
                  fill
                  sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <div className="absolute bottom-2 left-2 flex flex-wrap gap-2">
                  {p.sectors.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-900"
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
          className="mt-8 inline-block bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          View All Projects
        </Link>
      </section>

      <section className="py-20 px-6 md:px-16 bg-black text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Looking for representation in Canada?
        </h2>
        <p className="max-w-2xl mx-auto mb-6 text-lg">
          Let us connect your products with the right partners in the tilt-up
          and precast construction markets.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Contact Us
        </Link>
      </section>
    </main>
  );
}
