import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Quick-link style card: image well on top, the whole card is one link. */
export function CaseStudyCard({
  href,
  client,
  title,
  summary,
  art,
  headingLevel: H = "h3",
  className,
}: {
  href: string;
  client: string;
  title: string;
  summary: string;
  art?: ReactNode;
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-line bg-white transition-[translate,box-shadow] duration-500 ease-out-soft hover:-translate-y-1 hover:shadow-float",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-mint" aria-hidden>
        <div className="size-full transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]">{art}</div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="font-pill text-[13px] font-semibold tracking-[0.06em] text-leaf uppercase">{client}</p>
        <H className="mt-2 text-[18px] leading-[1.35] font-semibold text-pine">
          <Link href={href} className="after:absolute after:inset-0 after:rounded-[20px] focus-visible:outline-none">
            {title}
          </Link>
        </H>
        <p className="mt-2 flex-1 text-[15px] leading-[1.55] text-ink-soft">{summary}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-[15px] font-medium text-leaf" aria-hidden>
          Read case study
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
      {/* Focus ring for the stretched link */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[20px] ring-forest ring-offset-2 group-has-[a:focus-visible]:ring-2"
      />
    </article>
  );
}
