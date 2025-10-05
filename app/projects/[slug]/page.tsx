import Image from "next/image";
import { notFound } from "next/navigation";
import { PROJECTS } from "../../../data/projects";
import { MANUFACTURERS } from "../../../data/manufacturers";
import Gallery from "../../../components/Gallery";

export async function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // await params (Next.js async dynamic API)

  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) return notFound();

  const mfgMap = new Map(MANUFACTURERS.map((m) => [m.id, m]));

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="relative h-[42vh] min-h-[320px]">
        <Image
          src={project.hero}
          alt={project.title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        <div className="absolute bottom-8 left-6 right-6 max-w-6xl mx-auto text-white">
          <h1 className="text-3xl md:text-5xl font-bold">{project.title}</h1>
          <p className="mt-3 text-white/90 text-sm md:text-base">
            {project.location}
            {project.year ? ` • ${project.year}` : ""} •{" "}
            {project.sectors.join(" / ")}
          </p>
        </div>
      </section>

      <section className="px-6 md:px-16 py-10">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
            <article className="rounded-2xl border border-gray-200 bg-white p-6 md:p-7">
              <h2 className="text-xl font-semibold">Summary</h2>
              <p className="text-gray-800 mt-3 leading-relaxed">
                {project.summary}
              </p>
            </article>

            <aside className="rounded-2xl border border-gray-200 bg-gray-50 p-5 md:p-6">
              <h3 className="text-sm font-semibold text-gray-700">
                Manufacturers
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2.5">
                {project.manufacturers.map((id) => {
                  const m = mfgMap.get(id);
                  if (!m) return null;

                  return (
                    <li key={id}>
                      <a
                        href={m.website}
                        target="_blank"
                        className="group inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm hover:bg-gray-100 transition"
                      >
                        <span
                          className={`relative h-6 w-14 overflow-hidden rounded-sm border border-gray-200 ${
                            m.logoBgClass ?? "bg-white"
                          }`}
                        >
                          <Image
                            src={m.logoSrc}
                            alt={`${m.name} logo`}
                            fill
                            sizes="56px"
                            className="object-contain p-1"
                          />
                        </span>
                        <span className="text-gray-900 leading-tight">
                          {m.name}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>

              {project.resources && project.resources.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Related documents
                  </h4>
                  <ul className="mt-2 list-disc list-inside text-sm text-gray-800 space-y-1">
                    {project.resources.map((res) => (
                      <li key={res.href}>
                        <a
                          href={res.href}
                          className="underline hover:opacity-80"
                          target="_blank"
                        >
                          {res.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>

          {project.gallery && project.gallery.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Gallery</h2>
              <Gallery items={project.gallery} />
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-7">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Have a similar project?
                </h3>
                <p className="text-gray-700">
                  We can walk your team through detailing, options, and lessons
                  learned.
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href="mailto:gfuchs@fuchs-sales.ca?subject=Project%20consultation%20request"
                  className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800 transition"
                >
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
