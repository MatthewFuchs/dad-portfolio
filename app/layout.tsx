import "./globals.css";
import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import JsonLd from "../components/JsonLd";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Breadcrumbs from "../components/Breadcrumbs";

export const metadata: Metadata = {
  metadataBase: new URL("https://fuchs-sales.ca"),
  title: {
    default: "Fuchs Sales and Consulting",
    template: "%s | Fuchs Sales & Consulting",
  },
  description:
    "Technical sales & manufacturer representation for tilt-up and precast construction in Canada.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://fuchs-sales.ca",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Script
        id="ld-org"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Fuchs Sales and Consulting Limited",
            url: "https://fuchs-sales.ca",
            logo: "https://fuchs-sales.ca/public/fuchs.png",
            sameAs: [
              "https://www.linkedin.com/in/gregory-fuchs-5338b121/?originalSubdomain=ca",
            ],
          }),
        }}
      />
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <Breadcrumbs
          hideOn={["/"]}
          className="sticky top-[84px] z-20"
          labelMap={{
            products: "Products",
            resources: "Learning Resources",
            projects: "Projects",
            contact: "Contact",
            privacy: "Privacy Policy",
            terms: "Terms of Use",
            team: "Team",
          }}
        />
        <main className="flex-1">{children}</main>
        <Footer />

        {/* JSON-LD blocks */}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Fuchs Sales and Consulting Limited",
            url: "https://fuchs-sales.ca",
            logo: "https://fuchs-sales.ca/public/fuchs.png",
            contactPoint: [
              {
                "@type": "ContactPoint",
                telephone: "+1-778-241-6316",
                email: "fuchsgreg@icloud.com",
                contactType: "sales",
                areaServed: "CA",
                availableLanguage: ["en"],
              },
            ],
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Fuchs Sales and Consulting Limited",
            url: "https://fuchs-sales.ca",
          }}
        />

        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
