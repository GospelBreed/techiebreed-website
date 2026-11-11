import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

export type ProcessStep = { title: string; text: string };

/**
 * Numbered steps joined by a line: across the page on wide screens,
 * down the page on small ones.
 */
export function ProcessTimeline({ steps, tone = "light" }: { steps: ProcessStep[]; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <Reveal as="ol" className="relative grid gap-8 lg:grid-cols-7 lg:gap-4">
      {steps.map((step, i) => (
        <li key={step.title} className="relative flex gap-5 lg:flex-col lg:gap-0">
          {/* connector */}
          {i < steps.length - 1 && (
            <span
              aria-hidden
              className={cn(
                "absolute top-12 bottom-[-2rem] left-6 w-px lg:top-6 lg:right-[-1rem] lg:bottom-auto lg:left-12 lg:h-px lg:w-auto",
                dark ? "bg-white/20" : "bg-forest/20",
              )}
            />
          )}
          <span
            className={cn(
              "relative z-10 grid size-12 shrink-0 place-items-center rounded-full font-display text-[20px] font-semibold",
              dark ? "bg-lime text-forest" : "bg-forest text-white",
            )}
          >
            {i + 1}
          </span>
          <div className="lg:mt-5">
            <h3 className={cn("text-[18px] leading-[1.35] font-bold", dark ? "text-white" : "text-forest")}>
              {step.title}
            </h3>
            <p className={cn("mt-1.5 text-[15px] leading-[1.55]", dark ? "text-white/80" : "text-ink-soft")}>
              {step.text}
            </p>
          </div>
        </li>
      ))}
    </Reveal>
  );
}
