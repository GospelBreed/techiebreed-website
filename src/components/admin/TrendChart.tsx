"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Point = { date: string; value: number };

const fmtDay = (d: string, long = false) =>
  new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", long ? { weekday: "short", day: "numeric", month: "short", year: "numeric" } : { day: "numeric", month: "short" });

/** Rounds the top of the scale up to a tidy number (1, 2, 2.5, 5 × 10ⁿ). */
function niceMax(v: number): number {
  if (v <= 4) return 4;
  const p = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

/**
 * One measure over time: a 2px line with a soft fill, a crosshair that snaps to
 * the nearest day (mouse, touch or arrow keys), and a table view for every value.
 */
export function TrendChart({ points, label, format = (n) => n.toLocaleString("en-GB") }: { points: Point[]; label: string; format?: (n: number) => string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = 220;
  const pad = { l: 40, r: 12, t: 12, b: 28 };
  const max = niceMax(Math.max(0, ...points.map((p) => p.value)));
  const n = points.length;
  const x = (i: number) => pad.l + (n <= 1 ? 0 : (i / (n - 1)) * (width - pad.l - pad.r));
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);

  const { line, area } = useMemo(() => {
    const pts = points.map((p, i) => `${x(i).toFixed(1)},${y(p.value).toFixed(1)}`);
    return { line: `M${pts.join("L")}`, area: `M${x(0)},${y(0)}L${pts.join("L")}L${x(n - 1)},${y(0)}Z` };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, width, max]);

  const ticks = [0, max / 2, max];
  const labelEvery = Math.ceil(n / Math.max(2, Math.floor((width - pad.l) / 90)));
  const total = points.reduce((s, p) => s + p.value, 0);

  function pick(clientX: number) {
    const r = wrap.current?.getBoundingClientRect();
    if (!r || n === 0) return;
    const i = Math.round(((clientX - r.left - pad.l) / (width - pad.l - pad.r)) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  }

  const h = hover !== null ? points[hover] : null;

  return (
    <div className="min-w-0">
      <div
        ref={wrap}
        className="relative w-full overflow-hidden touch-pan-y outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-sprout"
        tabIndex={0}
        role="img"
        aria-label={`${label} per day, ${fmtDay(points[0]?.date ?? "")} to ${fmtDay(points[n - 1]?.date ?? "")}. Total ${format(total)}. Use the arrow keys to read each day.`}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onBlur={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            setHover((cur) => Math.min(n - 1, Math.max(0, (cur ?? (e.key === "ArrowRight" ? -1 : n)) + (e.key === "ArrowRight" ? 1 : -1))));
          }
        }}
      >
        <svg width={width} height={H} className="block text-leaf" aria-hidden>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} className="stroke-line" strokeWidth={1} />
              <text x={pad.l - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted text-[11.5px] tabular-nums">
                {t >= 1000 ? `${+(t / 1000).toFixed(1)}k` : +t.toFixed(1)}
              </text>
            </g>
          ))}
          {points.map((p, i) =>
            i % labelEvery === 0 ? (
              <text key={p.date} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : "middle"} className="fill-muted text-[11.5px]">
                {fmtDay(p.date)}
              </text>
            ) : null,
          )}
          <path d={area} className="fill-current opacity-[0.10]" />
          <path d={line} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {h && hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={y(0)} className="stroke-ink/40" strokeWidth={1} />
              <circle cx={x(hover)} cy={y(h.value)} r={5} fill="currentColor" className="stroke-white" strokeWidth={2} />
            </g>
          )}
        </svg>
        {h && hover !== null && (
          <div
            className="pointer-events-none absolute top-1 rounded-[10px] border border-line bg-white px-3 py-2 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.35)]"
            style={x(hover) > width / 2 ? { right: width - x(hover) + 10 } : { left: x(hover) + 10 }}
          >
            <p className="text-[16px] leading-tight font-bold text-ink tabular-nums">{format(h.value)}</p>
            <p className="text-[12.5px] whitespace-nowrap text-muted">
              {label} · {fmtDay(h.date, true)}
            </p>
          </div>
        )}
        <p className="sr-only" aria-live="polite">
          {h ? `${fmtDay(h.date, true)}: ${format(h.value)} ${label.toLowerCase()}` : ""}
        </p>
      </div>
      <details className="mt-2 text-[13.5px]">
        <summary className="cursor-pointer font-semibold text-leaf hover:text-forest">Show as a table</summary>
        <div className="mt-2 max-h-64 overflow-auto rounded-[10px] border border-line">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-mint text-[12.5px] text-muted">
              <tr>
                <th className="px-3 py-1.5 font-semibold">Day</th>
                <th className="px-3 py-1.5 text-right font-semibold">{label}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[...points].reverse().map((p) => (
                <tr key={p.date}>
                  <td className="px-3 py-1.5 text-ink-soft">{fmtDay(p.date, true)}</td>
                  <td className="px-3 py-1.5 text-right text-ink tabular-nums">{format(p.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
