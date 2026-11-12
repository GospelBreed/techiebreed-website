/** Small SVG building blocks for the UI-style illustrations. */

export const c = {
  forest: "#004c28",
  glow: "#0a5a33",
  sprout: "#2dbd32",
  lime: "#9eeb00",
  mint: "#e7efe9",
  sage: "#e0e8e5",
  sky: "#e3ebff",
  butter: "#fef2c8",
  blush: "#fdeae9",
  cream: "#fff5d7",
  peri: "#7c96d2",
  sun: "#fcce1a",
  coral: "#f56f66",
  ink: "#1c1c24",
  line: "#d9e1db",
  soft: "#eef3ef",
  white: "#ffffff",
} as const;

type Box = { x: number; y: number; w: number; h: number };

/** White card with a soft shadow. */
export function Card({ x, y, w, h, r = 10, fill = c.white }: Box & { r?: number; fill?: string }) {
  return (
    <g>
      <rect x={x} y={y + 3} width={w} height={h} rx={r} fill="#000" opacity="0.06" />
      <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} />
    </g>
  );
}

/** A grey placeholder line of "text". */
export function Text({ x, y, w, h = 5, fill = c.line }: { x: number; y: number; w: number; h?: number; fill?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />;
}

/** Round avatar with initials-free head-and-shoulders shape. */
export function Avatar({ cx, cy, r = 9, fill = c.peri }: { cx: number; cy: number; r?: number; fill?: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <circle cx={cx} cy={cy - r * 0.18} r={r * 0.36} fill={c.white} opacity="0.9" />
      <path
        d={`M${cx - r * 0.62} ${cy + r * 0.62}a${r * 0.62} ${r * 0.5} 0 0 1 ${r * 1.24} 0`}
        fill={c.white}
        opacity="0.9"
      />
    </g>
  );
}

/** Green circle with a tick. */
export function Tick({ cx, cy, r = 8, fill = c.sprout }: { cx: number; cy: number; r?: number; fill?: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <path
        d={`M${cx - r * 0.42} ${cy}l${r * 0.3} ${r * 0.32} ${r * 0.56} -${r * 0.62}`}
        fill="none"
        stroke={c.white}
        strokeWidth={r * 0.24}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** Pill-shaped button. */
export function Pill({ x, y, w, h = 14, fill = c.sprout, label = c.white }: Box & { fill?: string; label?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />
      <rect x={x + w * 0.22} y={y + h / 2 - 2} width={w * 0.56} height={4} rx={2} fill={label} opacity="0.9" />
    </g>
  );
}

/** Dashed connector between two points. */
export function Wire({ d, stroke = c.forest }: { d: string; stroke?: string }) {
  return <path d={d} fill="none" stroke={stroke} strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" opacity="0.5" />;
}
