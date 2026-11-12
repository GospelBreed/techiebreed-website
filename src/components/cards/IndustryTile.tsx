import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { washBg, type Wash } from "./washes";

/**
 * Industry tile.
 * Compact: icon, name and what we build (optionally a link).
 * Detailed: adds the problem → what we build pairing.
 */
export function IndustryTile({
  icon: Icon,
  name,
  problem,
  solution,
  href,
  wash = "sage",
  className,
}: {
  icon: LucideIcon;
  name: string;
  problem?: string;
  solution?: string;
  href?: string;
  wash?: Wash;
  className?: string;
}) {
  const detailed = problem && solution;
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-[24px] p-6 transition-[translate,box-shadow] duration-500 ease-out-soft hover:-translate-y-1",
        href && "hover:shadow-float has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-forest has-[a:focus-visible]:ring-offset-2",
        washBg[wash],
        className,
      )}
    >
      <span
        className={cn(
          "grid size-12 place-items-center rounded-[14px] text-forest",
          wash === "white" ? "bg-mint" : "bg-white shadow-[0_6px_16px_-10px_rgb(0_76_40/0.5)]",
        )}
      >
        <Icon aria-hidden className="size-6" strokeWidth={1.75} />
      </span>
      <h3 className="mt-5 text-[19px] leading-[1.35] font-bold text-forest">
        {href ? (
          <Link href={href} className="after:absolute after:inset-0 after:rounded-[24px] focus-visible:outline-none">
            {name}
          </Link>
        ) : (
          name
        )}
      </h3>
      {detailed ? (
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
      ) : (
        solution && <p className="mt-1.5 flex-1 text-[15px] text-ink-soft">{solution}</p>
      )}
      {href && (
        <ArrowRight
          aria-hidden
          className="mt-4 size-5 text-leaf transition-transform duration-300 group-hover:translate-x-1"
        />
      )}
    </article>
  );
}
