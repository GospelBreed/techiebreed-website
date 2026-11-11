import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Section title in the display serif.
 * Wrap a word in <em> to give it the italic accent treatment.
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  align = "center",
  tone = "light",
  as: Tag = "h2",
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "center" | "left";
  tone?: "light" | "dark";
  as?: "h1" | "h2";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={cn("max-w-[720px]", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      {eyebrow && (
        <p
          className={cn(
            "mb-3 font-pill text-[13.5px] font-semibold tracking-[0.06em] uppercase",
            dark ? "text-lime" : "text-leaf",
          )}
        >
          {eyebrow}
        </p>
      )}
      <Tag
        id={id}
        className={cn(
          "font-display text-[30px] leading-[1.2] font-semibold tracking-[-0.01em] md:text-[40px] md:leading-[1.15]",
          "[&_em]:font-semibold [&_em]:italic",
          dark ? "text-white [&_em]:text-lime" : "text-forest [&_em]:text-leaf",
        )}
      >
        {title}
      </Tag>
      {intro && (
        <p className={cn("mt-4 text-[17px] leading-[1.6]", dark ? "text-white/85" : "text-ink-soft")}>{intro}</p>
      )}
    </div>
  );
}
