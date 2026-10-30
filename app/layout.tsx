// The frame around every page of the public site: fonts, default search-engine
// details, the navigation bar, breadcrumbs and footer. Each page's own content
// is dropped in where {children} appears.
import "./globals.css";
import type { Metadata, Viewport } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import JsonLd from "../components/JsonLd";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Breadcrumbs from "../components/Breadcrumbs";
import SiteChrome from "../components/SiteChrome";
import localFont from "next/font/local";
import { readCollection } from "../lib/content";

// The site's typeface, served from app/fonts rather than from Google.
const switzer = localFont({
  src: [
    { path: "./fonts/Switzer-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Switzer-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-switzer",
  display: "swap",
});

// Colours the browser's address bar on phones to match the site.
export const viewport: Viewport = {
  themeColor: "#9caf88",
};

// Defaults for search results and link previews. A page can replace any of
// these, and its title fills the %s in the template below.
export const metadata: Metadata = {
  metadataBase: new URL("https://www.fuchs-sales.ca"),
  title: {
    default: "Fuchs Sales and Consulting",
    template: "%s | Fuchs Sales & Consulting",
  },
  description:
    "Technical sales & manufacturer representation for tilt-up and precast construction in Canada.",
  openGraph: {
    type: "website",
    url: "https://www.fuchs-sales.ca",
    title: "Fuchs Sales and Consulting Limited",
    description:
      "Technical sales & manufacturer representation for tilt-up and precast.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Fuchs Sales" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fuchs Sales and Consulting Limited",
    description:
      "Technical sales & manufacturer representation for tilt-up and precast.",
    images: ["/og.jpg"],
  },
  icons: { icon: "icon.png" },
  // Proves ownership to Google Search Console and Bing Webmaster Tools. Set the
  // codes they give you in Vercel; nothing is added while these are empty.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Project addresses mapped to real names, so the breadcrumb shows "The Linx"
  // rather than the wording of the web address.
  const projectNames = Object.fromEntries(
    readCollection("projects").map(({ slug, entry }) => [slug, entry.name])
  );
  const manufacturerNames = Object.fromEntries(
    readCollection("manufacturers").map(({ slug, entry }) => [slug, entry.name])
  );

  return (
    <html lang="en-CA" className={switzer.variable}>
      <body className="min-h-svh flex flex-col">
        {/* The nav and footer are passed in so SiteChrome can hide them on /admin. */}
        <SiteChrome
          header={
            <>
              <Navbar />
              <Breadcrumbs
                hideOn={["/"]}
                offsetPx={82}
                className="z-12"
                labelMap={{
                  products: "Manufacturers",
                  resources: "Resources",
                  projects: "Projects",
                  contact: "Contact",
                  privacy: "Privacy Policy",
                  terms: "Terms of Use",
                  team: "Team",
                  ...projectNames,
                  ...manufacturerNames,
                }}
              />
            </>
          }
          footer={<Footer />}
        >
          {children}
        </SiteChrome>

        {/* Structured data: an invisible description of the business that helps search */}
        {/* engines show it correctly. Visitors never see it. */}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "ProfessionalService",
                "@id": "https://www.fuchs-sales.ca/#org",
                name: "Fuchs Sales and Consulting Limited",
                alternateName: "Fuchs Sales & Consulting",
                description:
                  "Technical sales and manufacturer representation for commercial and industrial construction in Canada: tilt-up, precast, building envelope and stormwater products.",
                url: "https://www.fuchs-sales.ca",
                logo: "https://www.fuchs-sales.ca/fuchs.png",
                image: "https://www.fuchs-sales.ca/og.jpg",
                foundingDate: "2010",
                founder: { "@type": "Person", name: "Greg Fuchs" },
                telephone: "+1-778-241-6316",
                email: "gfuchs@fuchs-sales.ca",
                address: {
                  "@type": "PostalAddress",
                  addressRegion: "BC",
                  addressCountry: "CA",
                },
                areaServed: { "@type": "Country", name: "Canada" },
                knowsAbout: [
                  "Tilt-up construction",
                  "Precast concrete",
                  "Thermal breaks",
                  "Sandwich panel connectors",
                  "Blue-green roofs",
                  "Stormwater management",
                ],
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+1-778-241-6316",
                  email: "gfuchs@fuchs-sales.ca",
                  contactType: "sales",
                  areaServed: "CA",
                  availableLanguage: ["en"],
                },
                sameAs: [
                  "https://www.linkedin.com/in/gregory-fuchs-5338b121/",
                ],
              },
              {
                "@type": "WebSite",
                "@id": "https://www.fuchs-sales.ca/#website",
                name: "Fuchs Sales & Consulting",
                url: "https://www.fuchs-sales.ca",
                inLanguage: "en-CA",
                publisher: { "@id": "https://www.fuchs-sales.ca/#org" },
              },
            ],
          }}
        />

        {/* Vercel's visitor and page-speed statistics. */}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
