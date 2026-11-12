import type { CaseArt as CaseArtKind } from "@/lib/content";
import { Avatar, c, Card, Pill, Text, Tick, Wire } from "./kit";

/** Cover illustrations for case studies (16:10). */

function Frame({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 320 200" aria-hidden className="size-full" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="200" fill={bg} />
      {children}
    </svg>
  );
}

/** Sponsorship pipeline: researched prospects flow to approved outreach. */
function Pipeline() {
  const cols = [c.peri, c.sun, c.coral, c.sprout];
  return (
    <Frame bg={c.sky}>
      {cols.map((col, ci) => (
        <g key={ci}>
          <rect x={22 + ci * 72} y={30} width={60} height={7} rx={3.5} fill={col} />
          {Array.from({ length: [3, 2, 2, 1][ci] }).map((_, i) => (
            <g key={i}>
              <Card x={22 + ci * 72} y={46 + i * 44} w={60} h={36} r={8} />
              <Avatar cx={34 + ci * 72} cy={58 + i * 44} r={6} fill={col} />
              <Text x={44 + ci * 72} y={55 + i * 44} w={30} h={4} fill={c.ink} />
              <Text x={30 + ci * 72} y={70 + i * 44} w={40} h={4} />
            </g>
          ))}
        </g>
      ))}
      <Tick cx={286} cy={132} r={12} />
    </Frame>
  );
}

/** Property operations dashboard: requests, assignments, status. */
function Operations() {
  return (
    <Frame bg={c.butter}>
      <Card x={24} y={22} w={272} h={156} r={14} />
      <Text x={40} y={38} w={90} h={6} fill={c.ink} />
      <Pill x={222} y={32} w={58} h={16} fill={c.forest} />
      {[c.coral, c.sun, c.sprout].map((col, i) => (
        <g key={i}>
          <rect x={40} y={60 + i * 36} width={240} height={28} rx={8} fill={c.soft} />
          <circle cx={56} cy={74 + i * 36} r={6} fill={col} />
          <Text x={70} y={68 + i * 36} w={90} h={5} fill={c.ink} />
          <Text x={70} y={78 + i * 36} w={60} h={4} />
          <Avatar cx={232} cy={74 + i * 36} r={8} fill={[c.peri, c.coral, c.sprout][i]} />
          <rect x={246} y={70 + i * 36} width={24} height={8} rx={4} fill={col} opacity="0.5" />
        </g>
      ))}
    </Frame>
  );
}

/** Pay → enrol → learn. */
function Enrolment() {
  return (
    <Frame bg={c.sage}>
      <Card x={24} y={56} w={76} h={88} r={12} />
      <rect x={38} y={72} width={48} height={30} rx={6} fill={c.forest} />
      <rect x={38} y={90} width={48} height={5} fill={c.lime} />
      <Text x={38} y={112} w={48} h={5} fill={c.ink} />
      <Pill x={38} y={124} w={48} h={12} />
      <Wire d="M100 100 H122" />
      <Card x={122} y={56} w={76} h={88} r={12} />
      <Tick cx={160} cy={86} r={14} />
      <Text x={136} y={110} w={48} h={5} fill={c.ink} />
      <Text x={142} y={122} w={36} h={4} />
      <Wire d="M198 100 H220" />
      <Card x={220} y={56} w={76} h={88} r={12} />
      <rect x={232} y={68} width={52} height={32} rx={6} fill={c.sky} />
      <path d="M254 78 l10 6 -10 6z" fill={c.peri} />
      <Text x={232} y={110} w={48} h={5} fill={c.ink} />
      <rect x={232} y={124} width={52} height={5} rx={2.5} fill={c.soft} />
      <rect x={232} y={124} width={34} height={5} rx={2.5} fill={c.sprout} />
    </Frame>
  );
}

const art: Record<CaseArtKind, () => React.JSX.Element> = {
  pipeline: Pipeline,
  operations: Operations,
  enrolment: Enrolment,
};

export function CaseArt({ kind }: { kind: CaseArtKind }) {
  const Art = art[kind] ?? Operations;
  return <Art />;
}
