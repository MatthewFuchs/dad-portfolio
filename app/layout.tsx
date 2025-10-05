import "./globals.css";
import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import JsonLd from "../components/JsonLd";

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
  icons: { icon: "/icon.png" },
  
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <JsonLd
  data={{
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Fuchs Sales and Consulting Limited",
    url: "https://fuchs-sales.ca",
    logo: "https://fuchs-sales.ca/Fuchs1.png",
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
      </body>
    </html>
  );
}