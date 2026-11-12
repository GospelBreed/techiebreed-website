import { Avatar, c, Card, Pill, Text, Tick, Wire } from "./kit";

/**
 * Small square scenes shown inside the floating hero circles.
 * Each one shows a piece of work the systems take off a team's plate.
 */

function Frame({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden className="size-full" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="200" fill={bg} />
      {children}
    </svg>
  );
}

/** WhatsApp-style chat: question in, instant answer out. */
function Chat() {
  return (
    <Frame bg={c.sage}>
      <Card x={40} y={52} w={92} h={30} r={12} />
      <Text x={52} y={62} w={60} />
      <Text x={52} y={71} w={40} />
      <Card x={70} y={92} w={92} h={40} r={12} fill="#d6f5c9" />
      <Text x={82} y={102} w={64} fill="#8fd27d" />
      <Text x={82} y={111} w={52} fill="#8fd27d" />
      <Text x={82} y={120} w={30} fill="#8fd27d" />
      <Avatar cx={36} cy={130} r={11} fill={c.forest} />
      <circle cx={150} cy={58} r={9} fill={c.sprout} />
      <text x="150" y="62" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
        1
      </text>
    </Frame>
  );
}

/** Dashboard bar chart trending up. */
function Chart() {
  const bars = [34, 50, 42, 66, 78];
  return (
    <Frame bg={c.sky}>
      <Card x={36} y={46} w={128} h={108} r={14} />
      <Text x={50} y={60} w={46} fill={c.ink} h={6} />
      <Text x={50} y={71} w={28} />
      {bars.map((h, i) => (
        <rect key={i} x={52 + i * 21} y={140 - h * 0.7} width={13} height={h * 0.7} rx={4} fill={i === 4 ? c.sprout : c.peri} opacity={i === 4 ? 1 : 0.55} />
      ))}
      <path d="M58 118 L79 104 L100 110 L121 92 L142 82" fill="none" stroke={c.forest} strokeWidth="2.5" strokeLinecap="round" />
    </Frame>
  );
}

/** Approval card: request in, approved with a tick. */
function Approve() {
  return (
    <Frame bg={c.butter}>
      <Card x={38} y={56} w={124} h={88} r={14} />
      <Avatar cx={58} cy={78} r={10} fill={c.coral} />
      <Text x={74} y={72} w={56} fill={c.ink} h={6} />
      <Text x={74} y={83} w={40} />
      <Text x={52} y={100} w={96} />
      <Pill x={52} y={116} w={50} h={16} fill={c.forest} />
      <Pill x={108} y={116} w={40} h={16} fill={c.soft} label={c.line} />
      <Tick cx={154} cy={58} r={13} />
    </Frame>
  );
}

/** Reminder: a calendar tile and a bell. */
function Reminder() {
  return (
    <Frame bg={c.blush}>
      <Card x={46} y={50} w={84} h={92} r={14} />
      <rect x={46} y={50} width={84} height={24} rx={14} fill={c.coral} />
      <rect x={46} y={62} width={84} height={12} fill={c.coral} />
      <text x="88" y="114" textAnchor="middle" fontSize="34" fontWeight="700" fill={c.ink} fontFamily="Georgia, serif">
        14
      </text>
      <Text x={66} y={124} w={44} />
      <circle cx={142} cy={128} r={20} fill={c.forest} />
      <path d="M134 133h16l-2-3v-6a6 6 0 0 0-12 0v6z" fill={c.lime} />
      <circle cx={142} cy={136} r={2.4} fill={c.lime} />
    </Frame>
  );
}

/** Tools connected to a central hub. */
function Connect() {
  const nodes: [number, number, string][] = [
    [52, 58, c.peri],
    [148, 58, c.sun],
    [52, 142, c.coral],
    [148, 142, c.sprout],
  ];
  return (
    <Frame bg={c.cream}>
      {nodes.map(([x, y], i) => (
        <Wire key={i} d={`M100 100 L${x} ${y}`} />
      ))}
      {nodes.map(([x, y, fill], i) => (
        <g key={`n${i}`}>
          <rect x={x - 17} y={y - 17} width={34} height={34} rx={10} fill="#fff" />
          <rect x={x - 8} y={y - 8} width={16} height={16} rx={4} fill={fill} />
        </g>
      ))}
      <circle cx={100} cy={100} r={22} fill={c.forest} />
      <path d="M92 100h16M100 92v16" stroke={c.lime} strokeWidth="3.5" strokeLinecap="round" />
    </Frame>
  );
}

/** Sales pipeline columns with deal cards. */
function Pipeline() {
  const cols = [
    [c.peri, 3],
    [c.sun, 2],
    [c.sprout, 2],
  ] as const;
  return (
    <Frame bg={c.mint}>
      {cols.map(([color, n], ci) => (
        <g key={ci}>
          <rect x={34 + ci * 46} y={48} width={40} height={6} rx={3} fill={color} />
          {Array.from({ length: n }).map((_, i) => (
            <g key={i}>
              <Card x={34 + ci * 46} y={62 + i * 30} w={40} h={24} r={6} />
              <Text x={40 + ci * 46} y={69 + i * 30} w={26} h={4} fill={c.ink} />
              <Text x={40 + ci * 46} y={78 + i * 30} w={18} h={4} />
            </g>
          ))}
        </g>
      ))}
      <path d="M118 156 l14 -14" stroke={c.forest} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M124 142h8v8" fill="none" stroke={c.forest} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

/** Payment received, student enrolled. */
function Payment() {
  return (
    <Frame bg={c.sky}>
      <Card x={44} y={54} w={112} h={92} r={14} />
      <Tick cx={100} cy={84} r={16} />
      <Text x={70} y={110} w={60} fill={c.ink} h={6} />
      <Text x={80} y={122} w={40} />
      <rect x={60} y={132} width={80} height={4} rx={2} fill={c.soft} />
      <rect x={60} y={132} width={56} height={4} rx={2} fill={c.sprout} />
    </Frame>
  );
}

/** Report document with a line graph. */
function Report() {
  return (
    <Frame bg={c.sage}>
      <Card x={56} y={40} w={88} h={120} r={10} />
      <Text x={68} y={54} w={50} h={6} fill={c.ink} />
      <Text x={68} y={65} w={64} />
      <Text x={68} y={74} w={56} />
      <rect x={68} y={86} width={64} height={40} rx={6} fill={c.soft} />
      <path d="M72 120 L86 108 L98 113 L112 98 L128 92" fill="none" stroke={c.sprout} strokeWidth="2.5" strokeLinecap="round" />
      <Text x={68} y={136} w={64} />
      <Text x={68} y={145} w={40} />
    </Frame>
  );
}

export const scenes = { Chart, Chat, Approve, Reminder, Connect, Pipeline, Payment, Report };

/** Pool the hero bubbles draw from. */
export const bubbleScenes = Object.values(scenes);
