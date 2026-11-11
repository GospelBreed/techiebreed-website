import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { auditCta } from "@/lib/site";

/** Rounded forest panel with a radial glow — the closing call to action on most pages. */
export function CTABand({
  title = (
    <>
      Less operational pressure. <em>More intelligent growth.</em>
    </>
  ),
  text = "Tell us what is slowing your team down. We'll show you what can be automated, connected or simplified — and what to do first.",
  primary = auditCta,
  secondary = { label: "Explore our solutions", href: "/what-we-do" },
}: {
  title?: ReactNode;
  text?: ReactNode;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string } | null;
}) {
  return (
    <section className="py-16 md:py-24" aria-label="Get started">
      <div className="container-x">
        <div className="on-dark relative overflow-hidden rounded-[28px] bg-[radial-gradient(70%_90%_at_50%_45%,var(--color-forest-glow)_0%,var(--color-forest)_62%)] px-6 py-14 text-center shadow-[0_30px_60px_-30px_rgb(0_0_0/0.45)] md:px-12 md:py-20">
          <DotRings />
          <Reveal className="relative mx-auto flex max-w-[720px] flex-col items-center">
            <h2 className="font-display text-[32px] leading-[1.15] font-semibold tracking-[-0.012em] text-white md:text-[50px] [&_em]:text-lime [&_em]:italic">
              {title}
            </h2>
            <p className="mt-5 max-w-[560px] text-[17px] leading-[1.6] text-white/85">{text}</p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Button href={primary.href} variant="primary" arrow>
                {primary.label}
              </Button>
              {secondary && (
                <Button href={secondary.href} variant="ghost">
                  {secondary.label}
                </Button>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Soft concentric rings behind the band copy. */
function DotRings() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 800 800"
      className="pointer-events-none absolute top-1/2 left-1/2 w-[1100px] max-w-none -translate-x-1/2 -translate-y-1/2 text-white"
      fill="none"
      stroke="currentColor"
    >
      {[120, 200, 280, 360].map((r, i) => (
        <circle key={r} cx="400" cy="400" r={r} strokeOpacity={0.08 - i * 0.015} strokeWidth="1.5" />
      ))}
    </svg>
  );
}
