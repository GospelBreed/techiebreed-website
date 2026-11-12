import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { mainNav } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/** Custom 404, in the hero style. */
export default function NotFound() {
  return (
    <section className="on-dark relative flex min-h-[70vh] items-center overflow-hidden bg-[radial-gradient(70%_90%_at_50%_45%,var(--color-forest-glow)_0%,var(--color-forest)_62%)] text-white">
      <svg
        aria-hidden
        viewBox="0 0 600 600"
        className="pointer-events-none absolute top-1/2 left-1/2 w-[900px] -translate-x-1/2 -translate-y-1/2 text-white"
        fill="none"
        stroke="currentColor"
      >
        {[110, 170, 230, 290].map((r, i) => (
          <circle key={r} cx="300" cy="300" r={r} strokeOpacity={0.09 - i * 0.018} strokeWidth="1.5" />
        ))}
      </svg>
      <div className="container-x relative flex flex-col items-center py-20 text-center">
        <p className="font-display text-[96px] leading-none font-semibold text-lime italic md:text-[140px]">404</p>
        <h1 className="mt-4 font-display text-[clamp(30px,5vw,48px)] leading-[1.15] font-semibold text-white">
          This page has wandered off.
        </h1>
        <p className="mt-4 max-w-[520px] text-[17px] leading-[1.6] text-white/[0.86]">
          The link may be old or mistyped. Here are some good places to pick things up again.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button href="/" arrow>
            Back to the homepage
          </Button>
          <Button href="/contact" variant="ghost">
            Contact us
          </Button>
        </div>
        <nav aria-label="Popular pages" className="mt-12">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3">
            {mainNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="group inline-flex items-center gap-1.5 text-[15px] font-medium text-white/85 hover:text-lime">
                  {l.label}
                  <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
