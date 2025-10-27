import Link from "next/link";
import {
  Home,
  Factory,
  BookOpen,
  Layers,
  Mail,
  ArrowRight,
} from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] bg-white text-gray-900 px-6 md:px-16 pt-36 pb-16 grid place-items-center">
      <div className="w-full max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 ring-1 ring-inset ring-gray-200">
          404 • Page not found
        </span>

        <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
          We couldn’t find that page
        </h1>
        <p className="mt-2 text-gray-700 max-w-prose">
          The link may be broken or the page might have moved. Here are a few
          helpful places to go:
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 transition"
          >
            <Home className="h-4 w-4" />
            Go to homepage
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Quick links grid */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/products"
            className="group rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 ring-1 ring-inset ring-gray-200">
                <Factory className="h-4 w-4 text-gray-700" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">Manufacturers</p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  Companies we represent.
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/resources"
            className="group rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 ring-1 ring-inset ring-gray-200">
                <BookOpen className="h-4 w-4 text-gray-700" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">
                  Learning resources
                </p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  Specs, brochures, and install guides.
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/projects"
            className="group rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 ring-1 ring-inset ring-gray-200">
                <Layers className="h-4 w-4 text-gray-700" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">Projects</p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  Selected work and outcomes across sectors.
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/contact"
            className="group rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 ring-1 ring-inset ring-gray-200">
                <Mail className="h-4 w-4 text-gray-700" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">Contact</p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  Get in touch about representation or a project.
                </p>
              </div>
            </div>
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-600">
          Think this is a mistake?{" "}
          <a
            href="mailto:gfuchs@fuchs-sales.ca?subject=Broken%20link%20on%20fuchs-sales.ca"
            className="underline decoration-transparent hover:decoration-gray-700"
          >
            Report a broken link
          </a>
          .
        </p>
      </div>
    </main>
  );
}
