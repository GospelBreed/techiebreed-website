import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Package } from "@/content-data/services";

/** One way to work with TechieBreed. No prices: every engagement is scoped first. */
export function PackageCard({ pkg, className }: { pkg: Package; className?: string }) {
  const featured = !!pkg.recommended;
  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-[28px] p-6 md:p-7",
        featured ? "on-dark bg-forest text-white" : "border border-line bg-white",
        className,
      )}
    >
      {featured && (
        <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-lime px-3 py-1 font-pill text-[12.5px] font-bold text-forest">
          <span className="size-1.5 rotate-45 rounded-[1px] bg-forest" aria-hidden />
          Recommended starting point
        </p>
      )}
      <h3 className={cn("text-[21px] leading-[1.3] font-bold", featured ? "text-white" : "text-forest")}>{pkg.name}</h3>
      <p className={cn("mt-1 font-display text-[17px] italic", featured ? "text-lime" : "text-leaf")}>{pkg.tagline}</p>
      <p className={cn("mt-4 text-[15px] leading-[1.6]", featured ? "text-white/85" : "text-ink-soft")}>
        {pkg.description}
      </p>
      <ul className="mt-5 flex-1 space-y-2.5">
        {pkg.includes.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[15px]">
            <Check
              aria-hidden
              className={cn("mt-0.5 size-[18px] shrink-0", featured ? "text-lime" : "text-sprout")}
              strokeWidth={2.5}
            />
            <span className={featured ? "text-white" : "text-ink"}>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-7">
        <Button
          href={`/contact?interest=${encodeURIComponent(pkg.interest)}#enquiry`}
          variant={featured ? "primary" : "dark"}
          size="sm"
          arrow
          aria-label={`Talk to us about ${pkg.name}`}
        >
          {featured ? "Book your audit" : "Talk to us"}
        </Button>
      </div>
    </article>
  );
}
