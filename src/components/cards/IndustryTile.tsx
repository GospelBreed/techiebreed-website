import type { LucideIcon } from "lucide-react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { washBg, type Wash } from "./washes";

/** Industry tile. Compact (icon + name) or detailed (problem → what we build). */
export function IndustryTile({
  icon: Icon,
  name,
  problem,
  solution,
  wash = "sage",
  className,
}: {
  icon: LucideIcon;
  name: string;
  problem?: string;
  solution?: string;
  wash?: Wash;
  className?: string;
}) {
  const detailed = problem && solution;
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-[24px] p-6 transition-[translate] duration-500 ease-out-soft hover:-translate-y-1",
        washBg[wash],
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-[14px] bg-white text-forest shadow-[0_6px_16px_-10px_rgb(0_76_40/0.5)]">
        <Icon aria-hidden className="size-6" strokeWidth={1.75} />
      </span>
      <h3 className="mt-5 text-[19px] leading-[1.35] font-bold text-forest">{name}</h3>
      {detailed && (
        <dl className="mt-4 flex flex-1 flex-col gap-3 text-[15px] leading-[1.55]">
          <div>
            <dt className="font-pill text-[12.5px] font-bold tracking-[0.06em] text-pine/70 uppercase">The problem</dt>
            <dd className="mt-1 text-ink-soft">{problem}</dd>
          </div>
          <ArrowDown aria-hidden className="size-4 text-leaf" />
          <div>
            <dt className="font-pill text-[12.5px] font-bold tracking-[0.06em] text-pine/70 uppercase">What we build</dt>
            <dd className="mt-1 font-semibold text-pine">{solution}</dd>
          </div>
        </dl>
      )}
    </article>
  );
}
