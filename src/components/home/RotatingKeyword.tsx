"use client";

import { useEffect, useRef } from "react";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function splitInto(el: HTMLElement, text: string) {
  el.textContent = "";
  for (const ch of text) {
    const s = document.createElement("span");
    s.className = "kw-ch";
    s.textContent = ch === " " ? " " : ch;
    el.appendChild(s);
  }
  return Array.from(el.children) as HTMLElement[];
}

/**
 * A word that changes every few seconds, letter by letter, while its box
 * eases to the new width. Screen readers get the first word only (see Hero).
 */
export function RotatingKeyword({
  words,
  colors,
  interval = 2800,
  paused = false,
}: {
  words: string[];
  colors: string[];
  interval?: number;
  paused?: boolean;
}) {
  const boxRef = useRef<HTMLSpanElement>(null);
  const state = useRef({ i: 0 });

  // Size the box to the first word once fonts are ready.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const cur = box.querySelector<HTMLElement>(".kw-w");
    if (!cur) return;
    const size = () => (box.style.width = `${cur.getBoundingClientRect().width}px`);
    document.fonts?.ready.then(size);
    size();
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tick = () => {
      const old = box.querySelector<HTMLElement>(".kw-w:last-child");
      if (!old) return;
      state.current.i = (state.current.i + 1) % words.length;
      const i = state.current.i;

      const nw = document.createElement("span");
      nw.className = "kw-w";
      box.appendChild(nw);
      const chars = splitInto(nw, words[i]);
      box.style.width = `${nw.getBoundingClientRect().width}px`;
      box.style.color = colors[i % colors.length];

      Array.from(old.children).forEach((ch, k) => {
        (ch as HTMLElement).animate(
          [
            { opacity: 1, transform: "translateY(0)", filter: "blur(0)" },
            { opacity: 0, transform: "translateY(-0.32em)", filter: "blur(5px)" },
          ],
          { duration: 420, delay: k * 18, easing: "cubic-bezier(0.55, 0, 1, 0.45)", fill: "forwards" },
        );
      });
      chars.forEach((ch, k) => {
        ch.animate(
          [
            { opacity: 0, transform: "translateY(0.5em) rotate(6deg)", filter: "blur(6px)" },
            { opacity: 1, transform: "translateY(0) rotate(0)", filter: "blur(0)" },
          ],
          { duration: 760, delay: 140 + k * 32, easing: EASE, fill: "backwards" },
        );
      });
      window.setTimeout(() => old.remove(), 420 + old.children.length * 18 + 40);
    };

    const id = window.setInterval(tick, interval);
    return () => window.clearInterval(id);
  }, [words, colors, interval, paused]);

  return (
    <span
      ref={boxRef}
      aria-hidden
      className="kw relative inline-grid align-baseline font-semibold whitespace-nowrap italic transition-[width,color] duration-700 ease-out-soft"
      style={{ color: colors[0] }}
    >
      <span className="kw-w">
        {Array.from(words[0]).map((ch, k) => (
          <span key={k} className="kw-ch">
            {ch === " " ? " " : ch}
          </span>
        ))}
      </span>
    </span>
  );
}
