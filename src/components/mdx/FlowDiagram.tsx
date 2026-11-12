import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

/** "How the system works": numbered steps joined by arrows (down the page on small screens). */
export function FlowDiagram({ steps }: { steps: string[] }) {
  if (!steps.length) return null;
  return (
    <figure className="my-8">
      <Reveal as="ol" className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-0" aria-label="How the system works">
        {steps.map((step, i) => {
          const last = i === steps.length - 1;
          return (
            <li key={step} className="flex flex-col items-stretch lg:flex-1 lg:flex-row lg:items-center">
              <div
                className={cn(
                  "flex h-full flex-1 items-center gap-3 rounded-[16px] p-4 lg:flex-col lg:items-start lg:gap-3",
                  last ? "on-dark bg-forest text-white" : "bg-mint text-pine",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full font-display text-[16px] font-semibold",
                    last ? "bg-lime text-forest" : "bg-white text-forest",
                  )}
                >
                  {i + 1}
                </span>
                <span className="text-[15px] leading-[1.4] font-semibold">{step}</span>
              </div>
              {!last && (
                <ArrowRight
                  aria-hidden
                  className="mx-auto my-1 size-5 shrink-0 rotate-90 text-leaf lg:mx-1.5 lg:my-0 lg:rotate-0"
                />
              )}
            </li>
          );
        })}
      </Reveal>
    </figure>
  );
}
