export type TeamMember = {
  slug: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
  photo: string;
  location?: string;
  startYear?: number;
  specialties?: string[];
  quote?: string;
  bio: string[];
  links?: { label: string; href: string }[];
};

export const TEAM: TeamMember[] = [
{
  slug: "greg-fuchs",
  name: "Greg Fuchs",
  title: "President",
  email: "gfuchs@fuchs-sales.ca",
  phone: "+1-778-241-6316",
  photo: "/team/greg.jpg",
  location: "British Columbia, Canada",
  startYear: 2010,
  specialties: [
    "Tilt-Up",
    "Precast",
    "Specifications",
    "Manufacturer Representation",
  ],
  quote:
    "Partnering with manufacturers that provide expert technical support, reliable products, and innovative solutions is our biggest asset. We have partnered with some of the most responsible and innovative companies in our chosen markets. These partnerships, along with our proven responsiveness and professionalism, have created a reliable network and sales pipeline. Over the past 15 years, we have built a diverse product offering that allows us to bring multiple solutions to our design, owner, and contractor partners.",
  bio: [
    "Greg Fuchs, the President of Fuchs Sales & Consulting, is a passionate sales leader. In January 2010, Greg partnered with the company’s first manufacturing partner, Fabrikem Manufacturing, and the company was started.",
    "Greg combines the day-to-day running of the business with a continued focus on sales and service of the complete product line across Canada. He holds a degree in Economics and Business from the University of Alberta and, as a long-time B.C. resident, spends his leisure time with family and friends, playing hockey and staying active.",
  ],
  links: [
    { label: "Email", href: "mailto:gfuchs@fuchs-sales.ca?subject=Website%20Inquiry" },
    { label: "Call", href: "tel:+17782416316" },
  ],
},

  // Add more team members here

];