import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "white" | "mint" | "forest" | "night" | "ember";

const tones: Record<Tone, string> = {
  white: "bg-white",
  mint: "bg-mint",
  forest: "on-dark bg-forest text-white/85",
  night: "on-dark bg-night text-white/85",
  ember: "on-dark bg-ember text-white/85",
};

/** A full-width page band with consistent vertical rhythm. */
export function Section({
  id,
  tone = "white",
  className,
  innerClassName,
  children,
  "aria-labelledby": labelledBy,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
  "aria-labelledby"?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn(tones[tone], "py-16 md:py-24", className)}>
      <div className={cn("container-x", innerClassName)}>{children}</div>
    </section>
  );
}
