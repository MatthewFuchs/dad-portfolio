import Image from "next/image";
import { Mail, Phone, Quote } from "lucide-react";

const EMAIL = "gfuchs@fuchs-sales.ca";
const PHONE_TEL = "+17782416316";

export const metadata = {
  title: "About | Fuchs Sales & Consulting",
  description:
    "About Fuchs Sales & Consulting — who we are, what we do, and how to reach us.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="pt-28 sm:pt-32 pb-10 px-4 sm:px-16">
        <div className="max-w-4xl mx-auto">
          <header className="flex flex-col items-center text-center gap-6 sm:flex-row sm:items-center sm:text-left">
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl ring-1 ring-black/10 bg-gray-100 shrink-0">
              <Image
                src="/team/greg.jpg"
                alt="Greg Fuchs headshot"
                fill
                sizes="112px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold">Greg Fuchs</h1>
              <p className="mt-1 text-sm text-gray-600">
                Fuchs Sales &amp; Consulting — Partnering with leading manufacturers across Canada.
              </p>
            </div>
          </header>

          <figure className="mt-10">
            <blockquote className="relative rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-800">
              <Quote className="absolute -top-3 -left-3 h-6 w-6 opacity-30" />
              <p className="italic text-[15px] leading-7">
                “Partnering with manufacturers that provide expert technical support, reliable
                products and innovative solutions is our biggest asset. We’ve partnered with some
                of the most responsible and innovative companies in our chosen markets. These
                partnerships, along with our proven responsiveness and professionalism, have
                created a reliable network and sales pipeline. Over the past 15 years we’ve built a
                diverse product offering that lets us bring multiple solutions to our design,
                owner and contractor partners.”
              </p>
            </blockquote>
            <figcaption className="mt-2 text-sm text-gray-500 text-center sm:text-left">
              — Greg Fuchs
            </figcaption>
          </figure>

          <div className="mt-8 grid gap-4">
            <div className="bg-white p-4">
              <h2 className="text-sm font-semibold text-gray-900">Company overview</h2>
              <div className="mt-2 text-[15px] leading-7 text-gray-800">
                <p>
                  Fuchs Sales &amp; Consulting represents manufacturers across Canada. Designers,
                  owners, and contractors rely on our expert knowledge to make the right product
                  recommendations. Over the last 15 years, we’ve partnered with leading
                  manufacturers that provide some of the most reliable materials in the
                  construction industry.
                </p>
              </div>
            </div>

            <div className="bg-white p-4">
              <h2 className="text-sm font-semibold text-gray-900">Greg Fuchs — President</h2>
              <div className="mt-2 text-[15px] leading-7 text-gray-800 space-y-4">
                <p>
                  Greg Fuchs, the President of Fuchs Sales &amp; Consulting, is a passionate sales
                  leader. In January 2010, Greg partnered with the company’s first manufacturing
                  partner, Fabrikem Manufacturing, and founded the business.
                </p>
                <p>
                  Greg combines day-to-day leadership of the business with a continued focus on
                  sales and service across the complete product line in Canada. He holds a degree
                  in Economics and Business from the University of Alberta and has been a resident
                  of British Columbia for the past 15 years. In his spare time he’s with family and
                  friends, playing hockey and staying active.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-gray-200 pt-6">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <a
                href={`tel:${PHONE_TEL}`}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm font-semibold hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm font-semibold hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 pb-0.5" />
    </main>
  );
}