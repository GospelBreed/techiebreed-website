import type { ServiceId } from "@/content-data/services";
import { Avatar, c, Card, Pill, Text, Tick, Wire } from "./kit";

/** Wide (16:10) UI illustrations, one per service. */

function Frame({ children, bg = "transparent" }: { children: React.ReactNode; bg?: string }) {
  return (
    <svg viewBox="0 0 320 200" aria-hidden className="size-full" preserveAspectRatio="xMidYMid meet">
      <rect width="320" height="200" fill={bg} />
      {children}
    </svg>
  );
}

/** Trigger → steps → done, as a little flow of cards. */
function Automation() {
  return (
    <Frame>
      <Card x={22} y={36} w={84} h={52} />
      <circle cx={40} cy={54} r={8} fill={c.sun} />
      <Text x={54} y={50} w={40} fill={c.ink} />
      <Text x={54} y={60} w={28} />
      <Text x={32} y={72} w={64} />
      <Wire d="M106 62 H134" />
      <Card x={134} y={36} w={84} h={52} />
      <Avatar cx={152} cy={54} r={8} fill={c.peri} />
      <Text x={166} y={50} w={40} fill={c.ink} />
      <Text x={166} y={60} w={24} />
      <Pill x={144} y={70} w={40} h={11} fill={c.forest} />
      <Wire d="M218 62 H246" />
      <Card x={246} y={36} w={56} h={52} />
      <Tick cx={274} cy={56} r={11} />
      <Text x={258} y={74} w={32} />
      <Card x={70} y={112} w={180} h={56} />
      <Text x={84} y={126} w={70} fill={c.ink} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={84 + i * 52} y={140} width={44} height={14} rx={7} fill={[c.sage, c.butter, c.sky][i]} />
          <circle cx={92 + i * 52} cy={147} r={3} fill={[c.sprout, c.sun, c.peri][i]} />
        </g>
      ))}
    </Frame>
  );
}

/** Phone with an assistant conversation. */
function Agents() {
  return (
    <Frame>
      <rect x={112} y={14} width={96} height={176} rx={18} fill={c.forest} />
      <rect x={118} y={22} width={84} height={160} rx={13} fill="#f4f7f5" />
      <rect x={118} y={22} width={84} height={22} rx={13} fill={c.sprout} />
      <rect x={118} y={34} width={84} height={10} fill={c.sprout} />
      <circle cx={130} cy={33} r={5} fill="#fff" />
      <Text x={139} y={30} w={30} h={4} fill="#fff" />
      <Card x={124} y={52} w={56} h={20} r={8} />
      <Text x={130} y={59} w={40} h={4} />
      <Card x={142} y={78} w={54} h={28} r={8} fill="#d6f5c9" />
      <Text x={148} y={85} w={40} h={4} fill="#8fd27d" />
      <Text x={148} y={94} w={30} h={4} fill="#8fd27d" />
      <Card x={124} y={112} w={48} h={20} r={8} />
      <Text x={130} y={119} w={34} h={4} />
      <Card x={142} y={138} w={54} h={20} r={8} fill="#d6f5c9" />
      <Text x={148} y={145} w={38} h={4} fill="#8fd27d" />
      {/* side badges */}
      <Card x={30} y={60} w={68} h={36} />
      <circle cx={46} cy={78} r={8} fill={c.peri} />
      <path d="M42 78h8M46 74v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <Text x={58} y={72} w={30} h={4} fill={c.ink} />
      <Text x={58} y={81} w={22} h={4} />
      <Card x={222} y={104} w={72} h={36} />
      <Tick cx={238} cy={122} r={8} />
      <Text x={250} y={116} w={34} h={4} fill={c.ink} />
      <Text x={250} y={125} w={24} h={4} />
    </Frame>
  );
}

/** Prospect list with scores and a pipeline bar. */
function Sales() {
  const rows = [
    [c.peri, 0.86],
    [c.coral, 0.72],
    [c.sun, 0.64],
    [c.sprout, 0.5],
  ] as const;
  return (
    <Frame>
      <Card x={26} y={22} w={268} h={156} r={14} />
      <Text x={42} y={38} w={80} h={6} fill={c.ink} />
      <Pill x={222} y={33} w={56} h={14} fill={c.forest} />
      {rows.map(([col, score], i) => (
        <g key={i}>
          <Avatar cx={52} cy={70 + i * 26} r={9} fill={col} />
          <Text x={68} y={64 + i * 26} w={60} h={5} fill={c.ink} />
          <Text x={68} y={74 + i * 26} w={40} h={4} />
          <rect x={160} y={66 + i * 26} width={80} height={7} rx={3.5} fill={c.soft} />
          <rect x={160} y={66 + i * 26} width={80 * score} height={7} rx={3.5} fill={c.sprout} />
          <Text x={252} y={67 + i * 26} w={24} h={5} fill={c.line} />
        </g>
      ))}
    </Frame>
  );
}

/** Tools wired to a central system. */
function Integrations() {
  const tools: [number, number, string][] = [
    [50, 46, c.peri],
    [50, 154, c.coral],
    [270, 46, c.sun],
    [270, 154, c.sprout],
    [160, 22, c.forest],
  ];
  return (
    <Frame>
      {tools.map(([x, y], i) => (
        <Wire key={i} d={`M160 106 L${x} ${y}`} />
      ))}
      {tools.map(([x, y, col], i) => (
        <g key={`t${i}`}>
          <Card x={x - 22} y={y - 16} w={44} h={32} r={9} />
          <rect x={x - 8} y={y - 8} width={16} height={16} rx={4} fill={col} />
        </g>
      ))}
      <Card x={112} y={82} w={96} h={56} r={14} fill={c.forest} />
      <Text x={126} y={96} w={46} h={5} fill={c.lime} />
      <Text x={126} y={107} w={66} h={4} fill="#ffffff" />
      <Text x={126} y={116} w={52} h={4} fill="#ffffff" />
      <circle cx={194} cy={96} r={4} fill={c.lime} />
    </Frame>
  );
}

/** KPI tiles and a trend chart. */
function Data() {
  return (
    <Frame>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Card x={24 + i * 94} y={22} w={84} h={48} />
          <Text x={36 + i * 94} y={34} w={36} h={4} />
          <Text x={36 + i * 94} y={46} w={44} h={9} fill={c.ink} />
          <rect x={36 + i * 94} y={60} width={20} height={4} rx={2} fill={[c.sprout, c.peri, c.sun][i]} />
        </g>
      ))}
      <Card x={24} y={82} w={272} h={96} />
      <Text x={38} y={95} w={70} h={5} fill={c.ink} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={38} x2={282} y1={114 + i * 15} y2={114 + i * 15} stroke={c.soft} strokeWidth="1" />
      ))}
      <path d="M40 160 C70 150 84 132 112 138 S160 120 184 124 S236 100 280 104" fill="none" stroke={c.sprout} strokeWidth="3" strokeLinecap="round" />
      <path d="M40 166 C72 162 92 150 120 152 S170 142 196 146 S244 132 280 134" fill="none" stroke={c.peri} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 5" />
    </Frame>
  );
}

/** App window with sidebar, header and content. */
function Software() {
  return (
    <Frame>
      <Card x={24} y={18} w={272} h={164} r={14} />
      <rect x={24} y={18} width={272} height={22} rx={14} fill={c.soft} />
      <rect x={24} y={30} width={272} height={10} fill={c.soft} />
      {[c.coral, c.sun, c.sprout].map((f, i) => (
        <circle key={i} cx={38 + i * 11} cy={29} r={3.5} fill={f} />
      ))}
      <rect x={24} y={40} width={64} height={142} fill={c.forest} />
      <rect x={24} y={168} width={64} height={14} rx={0} fill={c.forest} />
      {[0, 1, 2, 3].map((i) => (
        <Text key={i} x={36} y={56 + i * 18} w={i === 0 ? 40 : 32} h={5} fill={i === 0 ? c.lime : "#5d8a72"} />
      ))}
      <Text x={102} y={54} w={80} h={6} fill={c.ink} />
      <Card x={102} y={70} w={88} h={50} fill={c.sky} />
      <Card x={198} y={70} w={86} h={50} fill={c.butter} />
      <Text x={112} y={82} w={40} h={5} fill={c.peri} />
      <Text x={208} y={82} w={40} h={5} fill={c.sun} />
      <Text x={112} y={96} w={60} h={10} fill="#ffffff" />
      <Text x={208} y={96} w={60} h={10} fill="#ffffff" />
      <Text x={102} y={134} w={182} h={6} />
      <Text x={102} y={148} w={150} h={6} />
      <Text x={102} y={162} w={120} h={6} />
    </Frame>
  );
}

const art: Record<ServiceId, () => React.JSX.Element> = {
  automation: Automation,
  agents: Agents,
  sales: Sales,
  integrations: Integrations,
  data: Data,
  software: Software,
};

export function ServiceArt({ id }: { id: ServiceId }) {
  const Art = art[id];
  return <Art />;
}
