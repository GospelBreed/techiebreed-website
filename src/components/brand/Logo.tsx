import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * TechieBreed mark: the circuit-board "T" inside a ring, redrawn as SVG.
 * [LOGO] Swap for the final company logo file when it is ready.
 */
export function LogoMark({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  const gid = useId();
  const light = tone === "light";
  const trace = light ? "#9eeb00" : "#0b9a4b";
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("shrink-0", className)}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light ? "#35d03b" : "#079b37"} />
          <stop offset="1" stopColor={light ? "#9eeb00" : "#005f2e"} />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28.5" fill="none" stroke={`url(#${gid})`} strokeWidth="4.5" />
      <g fill="none" stroke={trace} strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round">
        {/* outer T trace */}
        <path d="M18 17.5v8h11.5v24h7" />
        <path d="M24 16.5h12.5l3 3h4" />
        <path d="M46.5 16.5h1.5v9h-8.5" />
        {/* inner traces */}
        <path d="M24 20.5h12l3.2 3.2h7.2" />
        <path d="M21.5 23.5h11.5v5l3.5 3.5v15h-6" />
        <path d="M39 26.5v22h-8.5" />
        <path d="M33.5 32v12.5" />
      </g>
      <g fill={trace}>
        <circle cx="18" cy="16.3" r="2" />
        <circle cx="41.4" cy="16.3" r="1.9" />
        <circle cx="44.2" cy="20.1" r="1.9" />
        <circle cx="47.2" cy="23.6" r="1.9" />
        <circle cx="20.3" cy="23.5" r="1.9" />
        <circle cx="39" cy="26.4" r="1.8" />
        <circle cx="33.5" cy="31" r="1.8" />
      </g>
    </svg>
  );
}

export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark tone={tone} className="size-10" />
      <span
        className={cn(
          "text-[22px] leading-none font-bold tracking-[-0.01em]",
          tone === "light" ? "text-white" : "text-forest",
        )}
      >
        Techie<span className={tone === "light" ? "text-lime" : "text-leaf"}>Breed</span>
      </span>
    </span>
  );
}
