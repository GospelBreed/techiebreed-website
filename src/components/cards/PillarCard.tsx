import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** White bordered card with an icon, used for pillars and values. */
export function PillarCard({
  icon: Icon,
  title,
  children,
  extra,
  className,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  extra?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-[20px] border border-line bg-white p-6 transition-[translate,box-shadow] duration-500 ease-out-soft hover:-translate-y-1 hover:shadow-float md:p-7",
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-full bg-mint text-forest">
        <Icon aria-hidden className="size-6" strokeWidth={1.75} />
      </span>
      <h3 className="mt-5 text-[20px] leading-[1.35] font-bold text-ink">{title}</h3>
      <div className="mt-2 text-[15px] leading-[1.6] text-ink-soft">{children}</div>
      {extra && <div className="mt-6">{extra}</div>}
    </article>
  );
}
