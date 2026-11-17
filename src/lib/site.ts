import settings from "../../content/settings.json";

/**
 * Site-wide settings and copy that appear in more than one place.
 * Contact details, social links, booking link and reply time live in
 * content/settings.json (editable through the website connector).
 * Leave a social link as "" to hide its icon.
 */

export const site = {
  name: "TechieBreed",
  descriptor: "Intelligent Business Systems Company",
  tagline: "Less operational pressure. More intelligent growth.",
  description:
    "TechieBreed builds done-for-you systems that automate repetitive work, connect your business tools and help your business grow. Nigeria first, then the UK and US.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.techiebreed.org",
  academyHubUrl: "https://academy.techiebreed.org",
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL || settings.bookingUrl,
  /** "phone" is shown on the site; "phoneE164" is used for tap-to-call links. */
  contact: settings.contact,
  social: settings.social,
  /** Shown after an enquiry: "We'll reply by email within …". */
  replyTime: settings.replyTime,
};

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
