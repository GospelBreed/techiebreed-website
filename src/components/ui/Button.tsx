import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "dark" | "ghost" | "sun";
export type ButtonSize = "md" | "sm";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap " +
  "transition-[translate,background-color,box-shadow,border-color,color] duration-[350ms] ease-out-soft " +
  "hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  // Sprout-green pill: the main call to action
  primary: "bg-sprout text-on-sprout hover:bg-sprout-bright hover:shadow-sprout",
  // Outlined pill on light backgrounds
  secondary: "border border-forest/25 bg-white text-forest hover:border-forest hover:bg-mint",
  // Forest-green pill used inside pastel cards
  dark: "bg-forest text-white hover:bg-forest-glow hover:shadow-[0_14px_30px_-14px_rgb(0_76_40/0.8)]",
  // Outlined pill on dark backgrounds
  ghost: "border border-white/40 text-white hover:border-white hover:bg-white/10",
  // Warm highlight pill for bands
  sun: "bg-sun text-ink hover:bg-[#ffd75a]",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-[50px] px-7 text-base",
  sm: "h-10 px-5 text-[15px]",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type Style = { variant?: ButtonVariant; size?: ButtonSize; arrow?: boolean; className?: string; children: ReactNode };

function Label({ children, arrow }: { children: ReactNode; arrow?: boolean }) {
  return (
    <>
      <span>{children}</span>
      {arrow && (
        <ArrowRight aria-hidden className="size-[18px] transition-transform duration-300 group-hover:translate-x-0.5" />
      )}
    </>
  );
}

/** A pill-shaped link styled as a button. */
export function Button({
  variant,
  size,
  arrow,
  className,
  children,
  ...link
}: Style & Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "children">) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...link}>
      <Label arrow={arrow}>{children}</Label>
    </Link>
  );
}

/** A pill-shaped native button (forms, toggles). */
export function ActionButton({
  variant,
  size,
  arrow,
  className,
  children,
  type = "button",
  ...button
}: Style & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...button}>
      <Label arrow={arrow}>{children}</Label>
    </button>
  );
}

/** Small text link with a nudging arrow ("Learn more →"). */
export function ArrowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2 text-[15px] font-medium text-leaf hover:text-forest", className)}
    >
      {children}
      <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}
