"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type RevealProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** Portion of the element that must be visible before it animates in. */
  threshold?: number;
} & Record<string, unknown>;

/**
 * Fades and lifts its direct children into view, one after another,
 * the first time the group scrolls into the viewport.
 */
export function Reveal({ as: Tag = "div", className, children, threshold = 0.15, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <Tag ref={ref} className={cn("reveal", className)} {...rest}>
      {children}
    </Tag>
  );
}
