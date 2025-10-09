import type { Metadata } from "next";
import ProjectsIndexClient from "./ProjectsIndexClient";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Browse selected work by sector or manufacturer. Tilt-up & precast projects represented by Fuchs Sales & Consulting across Canada.",
  alternates: { canonical: "/projects" },
  openGraph: {
    type: "website",
    url: "https://www.fuchs-sales.ca/projects",
    title: "Projects | Fuchs Sales & Consulting",
    description:
      "Browse selected work by sector or manufacturer. Tilt-up & precast projects represented by Fuchs Sales & Consulting across Canada.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Fuchs Sales & Consulting",
    description:
      "Browse selected work by sector or manufacturer. Tilt-up & precast projects represented by Fuchs Sales & Consulting across Canada.",
  },
};

export default function ProjectsPage() {
  return <ProjectsIndexClient />;
}
