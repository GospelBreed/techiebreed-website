import Link from "next/link";
import { cacheLife } from "next/cache";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { InstagramIcon, LinkedInIcon, XIcon } from "@/components/brand/SocialIcons";
import { auditCta, isPlaceholder, mainNav, site } from "@/lib/site";
import { services } from "@/content-data/services";

const linkClass = "text-[15px] font-medium text-[#e9f3ec] transition-colors duration-300 hover:text-sprout";

function FooterHeading({ children }: { children: string }) {
  return <h2 className="mb-4 font-pill text-[13px] font-semibold tracking-[0.08em] text-white/60 uppercase">{children}</h2>;
}

const socials = [
  { label: "LinkedIn", href: site.social.linkedin, Icon: LinkedInIcon },
  { label: "X", href: site.social.x, Icon: XIcon },
  { label: "Instagram", href: site.social.instagram, Icon: InstagramIcon },
];

/** Faint line drawing behind the footer: a sprout growing out of a circuit. */
function FooterArt() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 210"
      className="pointer-events-none absolute top-0 left-1/2 h-[210px] w-[200px] -translate-x-1/2 text-[#0e2a1b]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M100 205V120" />
      <path d="M100 150c-30 0-52-18-56-50 30 0 52 16 56 50z" />
      <path d="M100 128c26 0 46-16 50-44-26 0-46 14-50 44z" />
      <path d="M100 120c0-26 14-46 40-58M100 120c0-30-10-52-34-66" />
      <path d="M40 205v-30h30l15-15M160 205v-30h-30l-15-15" />
      <circle cx="40" cy="172" r="4" />
      <circle cx="160" cy="172" r="4" />
      <circle cx="140" cy="60" r="4" />
      <circle cx="66" cy="52" r="4" />
    </svg>
  );
}

/** Year for the copyright line, fixed when the page is built. */
async function buildYear() {
  "use cache";
  cacheLife("max");
  return new Date().getFullYear();
}

export async function Footer() {
  const year = await buildYear();
  return (
    <footer className="on-dark relative overflow-hidden bg-night text-white/80">
      <FooterArt />
      <div className="container-x relative pt-20 pb-28 md:pt-24 md:pb-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr]">
          <div className="max-w-sm">
            <Link href="/" aria-label="TechieBreed home" className="inline-block rounded-md">
              <Logo tone="light" />
            </Link>
            <p className="mt-6 font-display text-[24px] leading-[1.25] font-semibold text-white">
              Less operational pressure. <em className="text-lime">More intelligent growth.</em>
            </p>
            <Link
              href={auditCta.href}
              className="mt-6 inline-flex h-12 items-center rounded-[9px] bg-sprout px-5 font-medium text-white transition-[filter] duration-200 ease-in hover:brightness-90"
            >
              {auditCta.label}
            </Link>
          </div>

          <nav aria-label="Company">
            <FooterHeading>Company</FooterHeading>
            <ul className="space-y-3">
              {mainNav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Services">
            <FooterHeading>Services</FooterHeading>
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s.id}>
                  <Link href={`/what-we-do#${s.id}`} className={linkClass}>
                    {s.short}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <FooterHeading>Academy</FooterHeading>
            <ul className="space-y-3">
              <li>
                <Link href="/academy" className={linkClass}>
                  Programmes
                </Link>
              </li>
              <li>
                <a href={site.academyHubUrl} className={`${linkClass} inline-flex items-center gap-1`}>
                  Student hub <ArrowUpRight aria-hidden className="size-4" />
                </a>
              </li>
            </ul>

            <div className="mt-8">
              <FooterHeading>Contact</FooterHeading>
            </div>
            <ul className="space-y-3 text-[15px] text-[#e9f3ec]">
              <li className="flex items-start gap-3">
                <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-sprout" />
                {isPlaceholder(site.contact.email) ? (
                  <span>{site.contact.email}</span>
                ) : (
                  <a href={`mailto:${site.contact.email}`} className={linkClass}>
                    {site.contact.email}
                  </a>
                )}
              </li>
              <li className="flex items-start gap-3">
                <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-sprout" />
                {isPlaceholder(site.contact.phone) ? (
                  <span>{site.contact.phone}</span>
                ) : (
                  <a href={`tel:${site.contact.phone.replace(/\s+/g, "")}`} className={linkClass}>
                    {site.contact.phone}
                  </a>
                )}
              </li>
              <li className="flex items-start gap-3">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-sprout" />
                <span>{site.contact.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center">
          <p className="text-[14px] font-medium text-white/80">
            © {year} TechieBreed. All rights reserved.
          </p>
          <ul className="flex items-center gap-3" aria-label="Social media">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                {isPlaceholder(href) ? (
                  <span
                    title={`${label}: ${href}`}
                    className="grid size-10 place-items-center rounded-full border border-white/20 text-white/50"
                  >
                    <Icon className="size-4" />
                    <span className="sr-only">{`${label} (link coming soon)`}</span>
                  </span>
                ) : (
                  <a
                    href={href}
                    aria-label={`TechieBreed on ${label}`}
                    className="grid size-10 place-items-center rounded-full border border-white/30 text-white transition-colors duration-300 hover:border-sprout hover:bg-sprout"
                  >
                    <Icon className="size-4" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
