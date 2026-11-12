"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";

export type FeatureSlide = {
  id: string;
  label: string;
  /** Colour of the small diamond in the tab. */
  dot: string;
  /** Background for the slide panel (any CSS background). */
  background: string;
  content: ReactNode;
};

const DURATION = 8000;

/**
 * Pill tabs over a rounded stage. Advances every 8 seconds while on screen;
 * pauses on hover, focus or when reduced motion is preferred. Arrow keys and swipes work.
 */
export function FeatureTabs({ slides, label }: { slides: FeatureSlide[]; label: string }) {
  const uid = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [entered, setEntered] = useState(-1); // slide whose copy has animated in
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();
  const [cycle, setCycle] = useState(0); // restarts the progress bar
  const remaining = useRef(DURATION);
  const startedAt = useRef(0);
  const resetting = useRef(false); // true right after a slide change, so the old timer doesn't overwrite the fresh countdown

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Animate the active slide's copy in once it is on screen.
  useEffect(() => {
    if (!visible) return;
    const id = requestAnimationFrame(() => setEntered(index));
    return () => cancelAnimationFrame(id);
  }, [index, visible]);

  // Keep the active tab visible when the tab row scrolls sideways (small screens).
  useEffect(() => {
    const tab = tabRefs.current[index];
    const list = tab?.parentElement;
    if (!tab || !list || list.scrollWidth <= list.clientWidth) return;
    const left = tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2;
    list.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
  }, [index, reduced]);

  const go = useCallback(
    (n: number) => {
      const next = (n + slides.length) % slides.length;
      setIndex(next);
      setEntered(-1);
      resetting.current = true;
      remaining.current = DURATION;
      setCycle((c) => c + 1);
    },
    [slides.length],
  );

  const paused = hovering || !visible || reduced;

  useEffect(() => {
    if (paused) return;
    resetting.current = false;
    startedAt.current = Date.now();
    const t = window.setTimeout(() => go(index + 1), remaining.current);
    return () => {
      window.clearTimeout(t);
      if (!resetting.current) {
        remaining.current = Math.max(400, remaining.current - (Date.now() - startedAt.current));
      }
    };
  }, [paused, index, go, cycle]);

  const touch = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      ref={rootRef}
      className={cn("feature-tabs", !reduced && "is-playing", paused && "is-paused")}
      style={{ "--dur": `${DURATION}ms` } as React.CSSProperties}
      onFocus={() => setHovering(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovering(false);
      }}
    >
      <div
        role="tablist"
        aria-label={label}
        className="relative mx-auto mb-[18px] flex w-max max-w-full gap-1.5 overflow-x-auto rounded-full border border-[#e4e7e2] bg-white p-[5px] shadow-[0_1px_2px_rgb(16_24_16/0.05)] [scrollbar-width:none]"
      >
        {slides.map((s, k) => (
          <button
            key={s.id}
            ref={(el) => {
              tabRefs.current[k] = el;
            }}
            id={`${uid}-tab-${k}`}
            role="tab"
            type="button"
            aria-selected={k === index}
            aria-controls={`${uid}-panel-${k}`}
            tabIndex={k === index ? 0 : -1}
            onClick={() => go(k)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              e.preventDefault();
              const n = (k + (e.key === "ArrowRight" ? 1 : -1) + slides.length) % slides.length;
              go(n);
              tabRefs.current[n]?.focus();
            }}
            className="feature-pill relative inline-flex h-10 shrink-0 items-center gap-[9px] overflow-hidden rounded-full px-3 font-pill text-[12.5px] font-semibold whitespace-nowrap text-[#3d4a40] transition-colors duration-300 hover:text-forest-deep aria-selected:bg-forest-deep aria-selected:text-white sm:px-[18px] sm:text-[13.5px]"
          >
            <span aria-hidden className="relative z-10 size-2 shrink-0 rotate-45 rounded-[2px]" style={{ background: s.dot }} />
            <span className="relative z-10">{s.label}</span>
            {k === index && (
              <span key={cycle} aria-hidden className="feature-pill-fill absolute bottom-0 left-0 h-0.5 w-full origin-left [transform:scaleX(0)] bg-white/55" />
            )}
          </button>
        ))}
      </div>

      <div
        className="relative grid overflow-hidden rounded-[20px] shadow-[0_30px_70px_-28px_rgb(20_13_53/0.45)] isolate md:rounded-[24px]"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={(e) => {
          if (!touch.current) return;
          const dx = e.changedTouches[0].clientX - touch.current.x;
          const dy = e.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > Math.max(44, Math.abs(dy) * 1.3)) go(index + (dx < 0 ? 1 : -1));
          touch.current = null;
        }}
      >
        {slides.map((s, k) => (
          <div
            key={s.id}
            id={`${uid}-panel-${k}`}
            role="tabpanel"
            aria-labelledby={`${uid}-tab-${k}`}
            aria-hidden={k !== index}
            inert={k !== index}
            className={cn("feature-slide", k === index && "is-on", entered === k && "is-in")}
            style={{ background: s.background }}
          >
            {s.content}
          </div>
        ))}
      </div>
    </div>
  );
}

/** A headline line that slides up from behind a mask when its slide enters. */
export function RevealLine({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("feature-rv block overflow-hidden pb-[0.16em] -mb-[0.16em]", className)}>
      <span className="block">{children}</span>
    </span>
  );
}
