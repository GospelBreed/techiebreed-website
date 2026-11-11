import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { washBg, type Wash } from "./washes";

/** Pastel programme-style card: illustration well, title, summary and a forest pill. */
export function ServiceCard({
  title,
  summary,
  href,
  wash = "sage",
  art,
  cta = "Learn more",
  headingLevel: H = "h3",
  className,
}: {
  title: string;
  summary: string;
  href: string;
  wash?: Wash;
  art?: ReactNode;
  cta?: string;
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  return (
    <article className={cn("flex h-full flex-col rounded-[28px] p-5 md:p-6", washBg[wash], className)}>
      {art && (
        <div className="mb-6 aspect-[16/10] overflow-hidden rounded-[20px] bg-white/70" aria-hidden>
          {art}
        </div>
      )}
      <H className="text-[21px] leading-[1.35] font-bold text-forest md:text-[22px]">{title}</H>
      <p className="mt-3 flex-1 text-[15px] leading-[1.55] text-pine/80">{summary}</p>
      <div className="mt-6">
        <Button href={href} variant="dark" size="sm" aria-label={`${cta}: ${title}`}>
          {cta}
        </Button>
      </div>
    </article>
  );
}
