import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

/** Forest-green page header used on inner pages. Wrap a word in <em> for the italic accent. */
export function PageHero({
  eyebrow,
  title,
  intro,
  actions,
  align = "center",
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  actions?: ReactNode;
  align?: "center" | "left";
  children?: ReactNode;
}) {
  const centered = align === "center";
  return (
    <section className="on-dark relative overflow-hidden bg-[radial-gradient(70%_90%_at_50%_45%,var(--color-forest-glow)_0%,var(--color-forest)_62%)] text-white">
      <Rings />
      <div className="container-x relative py-16 md:py-24">
        <Reveal className={cn("flex max-w-[780px] flex-col", centered ? "mx-auto items-center text-center" : "items-start")}>
          <p className="font-pill text-[13.5px] font-semibold tracking-[0.06em] text-lime uppercase">{eyebrow}</p>
          <h1 className="mt-4 font-display text-[clamp(34px,6.4vw,58px)] leading-[1.1] font-semibold tracking-[-0.012em] text-white [&_em]:text-lime [&_em]:italic">
            {title}
          </h1>
          {intro && <p className="mt-5 max-w-[620px] text-[17px] leading-[1.6] text-white/[0.86]">{intro}</p>}
          {actions && <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">{actions}</div>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}

function Rings() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 600 600"
      className="pointer-events-none absolute top-1/2 -right-40 w-[640px] -translate-y-1/2 text-white md:-right-24"
      fill="none"
      stroke="currentColor"
    >
      {[110, 170, 230, 290].map((r, i) => (
        <circle key={r} cx="300" cy="300" r={r} strokeOpacity={0.09 - i * 0.018} strokeWidth="1.5" />
      ))}
    </svg>
  );
}
