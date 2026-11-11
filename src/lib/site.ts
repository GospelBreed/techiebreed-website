/**
 * Site-wide settings and copy that appear in more than one place.
 * Anything in [SQUARE BRACKETS] is a placeholder still to be supplied.
 */

export const site = {
  name: "TechieBreed",
  descriptor: "Intelligent Business Systems Company",
  tagline: "Less operational pressure. More intelligent growth.",
  description:
    "TechieBreed builds done-for-you systems that automate repetitive work, connect your business tools and help your business grow. Nigeria first, then the UK and US.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://techiebreed.com",
  academyHubUrl: "https://techiebreed-hub.netlify.app",
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? "",
  contact: {
    email: "[EMAIL]",
    phone: "[PHONE]",
    address: "[OFFICE ADDRESS]",
  },
  social: {
    linkedin: "[LINKEDIN URL]",
    x: "[X URL]",
    instagram: "[INSTAGRAM URL]",
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

/** True when a placeholder value (e.g. "[EMAIL]") has not been replaced yet. */
export function isPlaceholder(value: string): boolean {
  return value.trim() === "" || /^\[.*\]$/.test(value.trim());
}
