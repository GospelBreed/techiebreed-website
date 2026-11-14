/**
 * Site-wide settings and copy that appear in more than one place.
 * Leave a social link as "" to hide its icon.
 */

export const site = {
  name: "TechieBreed",
  descriptor: "Intelligent Business Systems Company",
  tagline: "Less operational pressure. More intelligent growth.",
  description:
    "TechieBreed builds done-for-you systems that automate repetitive work, connect your business tools and help your business grow. Nigeria first, then the UK and US.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.techiebreed.org",
  academyHubUrl: "https://techiebreed-hub.netlify.app",
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL || "https://cal.com/techiebreed",
  contact: {
    email: "hello@techiebreed.org",
    /** Shown on the site. */
    phone: "+234 816 588 7386",
    /** Used for tap-to-call and WhatsApp links. */
    phoneE164: "+2348165887386",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/techiebreed/",
    x: "https://x.com/techie_breed",
    instagram: "https://www.instagram.com/techie_breed",
  },
} as const;

export type NavLink = { label: string; href: string; description?: string };

export const auditCta: NavLink = {
  label: "Book an AI Operations Audit",
  href: "/contact#audit",
};

export const mainNav: NavLink[] = [
  { label: "What We Do", href: "/what-we-do" },
  { label: "Industries", href: "/industries" },
  { label: "Our Work", href: "/our-work" },
  { label: "Academy", href: "/academy" },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];
