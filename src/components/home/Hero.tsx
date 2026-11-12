"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { bubbleScenes } from "@/components/illustrations/BubbleScenes";
import { auditCta } from "@/lib/site";
import { cn } from "@/lib/cn";
import { RotatingKeyword } from "./RotatingKeyword";

const WORDS = ["repetitive work", "manual data entry", "chasing follow-ups", "copy and paste", "building reports"];
const COLORS = ["#9eeb00", "#7c96d2", "#fcce1a", "#f56f66"];

/** Bubble slots: size class, desktop position and float timing. */
const SLOTS = [
  { cls: "size-[150px] xl:size-[212px] lg:left-[1%] lg:top-[14%] left-[30%] top-[14%]", dur: "9s", delay: "0s" },
  { cls: "size-[96px] xl:size-[132px] lg:left-[11%] lg:top-[66%] left-[4%] top-[48%]", dur: "7.5s", delay: "-2s" },
  { cls: "size-[64px] xl:size-[88px] lg:left-[14%] lg:top-[4%] left-[8%] top-[6%]", dur: "6.5s", delay: "-4s" },
  { cls: "size-[150px] xl:size-[224px] lg:right-[1%] lg:left-auto lg:top-[34%] left-[2%] top-[34%] max-lg:hidden", dur: "10s", delay: "-3s" },
  { cls: "size-[100px] xl:size-[140px] lg:right-[13%] lg:left-auto lg:top-[4%] right-[4%] top-[2%]", dur: "8s", delay: "-1s" },
  { cls: "size-[64px] xl:size-[92px] lg:right-[16%] lg:top-[76%] right-[10%] top-[66%]", dur: "7s", delay: "-5s" },
];

type Slot = { cur: number; prev: number | null; gen: number };

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const [entered, setEntered] = useState(false);
  const [paused, setPaused] = useState(false);
  const [slots, setSlots] = useState<Slot[]>(() => SLOTS.map((_, i) => ({ cur: i, prev: null, gen: 0 })));
  const turn = useRef(0);

  // Entrance: copy rises in, bubbles grow in, staggered.
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Every few seconds one bubble changes to another scene.
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setSlots((prev) => {
        const visible = prev
          .map((s, i) => ({ s, i }))
          .filter(({ i }) => {
            const el = rootRef.current?.querySelector<HTMLElement>(`[data-slot="${i}"]`);
            return el && el.offsetParent !== null;
          });
        if (!visible.length) return prev;
        const shown = new Set(prev.map((s) => s.cur));
        const spare = bubbleScenes.map((_, k) => k).filter((k) => !shown.has(k));
        if (!spare.length) return prev;
        const target = visible[turn.current % visible.length].i;
        turn.current += 1;
        const next = spare[Math.floor(Math.random() * spare.length)];
        return prev.map((s, i) => (i === target ? { cur: next, prev: s.cur, gen: s.gen + 1 } : s));
      });
    }, 3200);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <section
      ref={rootRef}
      aria-labelledby="hero-title"
      className={cn(
        "hero on-dark relative overflow-hidden bg-[radial-gradient(70%_90%_at_50%_45%,var(--color-forest-glow)_0%,var(--color-forest)_62%)] text-white",
        entered && "is-in",
        paused && "is-paused",
      )}
    >
      <div className="relative mx-auto flex max-w-[1340px] flex-col items-center px-5 pt-16 pb-10 lg:min-h-[620px] lg:flex-row lg:justify-center lg:px-5 lg:pt-24 lg:pb-26">
        {/* Copy */}
        <div className="hero-copy relative z-10 flex max-w-[640px] flex-col items-center text-center">
          <h1
            id="hero-title"
            className="font-display text-[clamp(32px,7.4vw,58px)] leading-[1.12] font-semibold tracking-[-0.012em] text-white"
          >
            Your business has better things to do than <span className="sr-only">repetitive work.</span>
            <span aria-hidden className="block">
              <RotatingKeyword words={WORDS} colors={COLORS} paused={paused} />.
            </span>
          </h1>
          <p className="mt-[22px] max-w-[540px] text-[17px] leading-[1.6] text-white/[0.86]">
            We build smart systems that <strong className="font-semibold text-white">automate everyday operations</strong>,{" "}
            <strong className="font-semibold text-white">connect your business tools</strong> and give your team more time to
            focus on what matters.
          </p>
          <div className="mt-[30px] flex flex-col items-center gap-3 sm:flex-row">
            <Button href="/what-we-do" arrow>
              Explore our solutions
            </Button>
            <Button href={auditCta.href} variant="ghost">
              {auditCta.label}
            </Button>
          </div>
        </div>

        {/* Floating scenes */}
        <div
          aria-hidden
          className="relative mt-12 h-[300px] w-full max-w-[420px] lg:pointer-events-none lg:absolute lg:inset-0 lg:mt-0 lg:h-auto lg:max-w-none"
        >
          {SLOTS.map((slot, i) => {
            const s = slots[i];
            const Cur = bubbleScenes[s.cur];
            const Prev = s.prev !== null ? bubbleScenes[s.prev] : null;
            return (
              <div
                key={i}
                data-slot={i}
                className={cn("hero-b float absolute overflow-hidden rounded-full bg-forest-glow shadow-bubble", slot.cls)}
                style={{ "--float-dur": slot.dur, "--float-delay": slot.delay, "--i": i } as React.CSSProperties}
              >
                {Prev && (
                  <div key={`p${s.gen}`} className="bubble-out absolute inset-0">
                    <Prev />
                  </div>
                )}
                <div key={`c${s.gen}`} className={cn("absolute inset-0", s.gen > 0 && "bubble-in")}>
                  <Cur />
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          className="absolute right-4 bottom-4 z-20 grid size-9 place-items-center rounded-full border border-white/25 text-white/80 transition-colors hover:border-white hover:text-white"
        >
          {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
          <span className="sr-only">{paused ? "Play animation" : "Pause animation"}</span>
        </button>
      </div>
    </section>
  );
}
