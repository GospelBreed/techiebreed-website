import type { ComponentType } from "react";
import { Button } from "@/components/ui/Button";
import { FeatureTabs, RevealLine, type FeatureSlide } from "@/components/ui/FeatureTabs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { scenes } from "@/components/illustrations/BubbleScenes";

const { Chat, Reminder, Connect, Report } = scenes;

type Pain = {
  id: string;
  label: string;
  dot: string;
  background: string;
  accent: string;
  lines: string[];
  text: string;
  fix: string;
  cta: { label: string; href: string };
  Scene: ComponentType;
};

const pains: Pain[] = [
  {
    id: "enquiries",
    label: "Missed enquiries",
    dot: "#f56f66",
    background: "linear-gradient(135deg,#2b0b07 0%,#150301 70%)",
    accent: "#f56f66",
    lines: ["Enquiries arrive at 10pm.", "Nobody replies", "until morning."],
    text: "By then, many have already asked someone else.",
    fix: "We build assistants that reply straight away, capture the details and pass serious enquiries to your team.",
    cta: { label: "See AI assistants", href: "/what-we-do#agents" },
    Scene: Chat,
  },
  {
    id: "follow-ups",
    label: "Dropped follow-ups",
    dot: "#fcce1a",
    background: "linear-gradient(135deg,#1d1f4d 0%,#0e0f2e 70%)",
    accent: "#fcce1a",
    lines: ["The follow-up", "you meant to send", "last Tuesday."],
    text: "Busy teams forget. Leads go cold and renewals slip.",
    fix: "We set up reminders and follow-ups that go out on time, every time — and tell your team when a person is needed.",
    cta: { label: "See workflow automation", href: "/what-we-do#automation" },
    Scene: Reminder,
  },
  {
    id: "data-entry",
    label: "Manual reports",
    dot: "#9eeb00",
    background: "linear-gradient(135deg,#00492a 0%,#00210f 70%)",
    accent: "#9eeb00",
    lines: ["Hours every week", "copying numbers", "into spreadsheets."],
    text: "Time your team could spend on customers goes on admin.",
    fix: "We automate data entry and build reports and dashboards that update themselves.",
    cta: { label: "See reporting", href: "/what-we-do#data" },
    Scene: Report,
  },
  {
    id: "tools",
    label: "Disconnected tools",
    dot: "#7c96d2",
    background: "linear-gradient(135deg,#2a2a34 0%,#121217 70%)",
    accent: "#7c96d2",
    lines: ["Five tools.", "None of them", "talk to each other."],
    text: "So someone copies and pastes between them — and mistakes creep in.",
    fix: "We connect your business tools so information moves on its own, and everyone sees the same picture.",
    cta: { label: "See integrations", href: "/what-we-do#integrations" },
    Scene: Connect,
  },
];

function Art({ Scene, accent }: { Scene: ComponentType; accent: string }) {
  return (
    <div className="relative mx-auto aspect-square w-[min(78vw,340px)] md:w-[min(36vw,400px)]">
      <svg viewBox="0 0 400 400" aria-hidden className="absolute inset-0 size-full" fill="none">
        {[196, 168, 140].map((r, k) => (
          <circle
            key={r}
            className="feature-ring"
            cx="200"
            cy="200"
            r={r}
            stroke={accent}
            strokeWidth="1.5"
            style={{ "--k": 2 - k, "--o": 0.18 + k * 0.1 } as React.CSSProperties}
          />
        ))}
      </svg>
      <div className="feature-fade absolute inset-[15%] overflow-hidden rounded-full shadow-bubble">
        <Scene />
      </div>
    </div>
  );
}

function Slide({ pain }: { pain: Pain }) {
  return (
    <div className="on-dark grid items-center gap-2 md:min-h-[500px] md:grid-cols-[1.1fr_1fr]">
      <div className="order-2 flex flex-col items-start px-6 pt-2 pb-8 md:order-1 md:py-14 md:pr-0 md:pl-16">
        <h3 className="font-display text-[clamp(26px,5.8vw,44px)] leading-[1.12] font-semibold tracking-[-0.01em] text-white">
          {pain.lines.map((l, i) => (
            <RevealLine key={i} className={i === pain.lines.length - 1 ? "italic" : undefined}>
              {i === pain.lines.length - 1 ? <span style={{ color: pain.accent }}>{l}</span> : l}
            </RevealLine>
          ))}
        </h3>
        <p className="feature-fade mt-5 text-[16px] leading-[1.55] text-white/80">{pain.text}</p>
        <p className="feature-fade mt-3 text-[16px] leading-[1.55] font-medium text-white">{pain.fix}</p>
        <div className="feature-fade mt-7 w-full sm:w-auto">
          <Button href={pain.cta.href} variant="ghost" arrow className="w-full sm:w-auto">
            {pain.cta.label}
          </Button>
        </div>
      </div>
      <div className="order-1 pt-8 md:order-2 md:py-10 md:pr-10">
        <Art Scene={pain.Scene} accent={pain.accent} />
      </div>
    </div>
  );
}

export function PainPoints() {
  const slides: FeatureSlide[] = pains.map((p) => ({
    id: p.id,
    label: p.label,
    dot: p.dot,
    background: p.background,
    content: <Slide pain={p} />,
  }));

  return (
    <section aria-labelledby="pain-title" className="py-16 md:py-24">
      <div className="container-x">
        <SectionHeading
          id="pain-title"
          title={
            <>
              Sound <em>familiar?</em>
            </>
          }
          intro="Most growing businesses lose hours every week to the same few problems."
        />
        <div className="mt-10 md:mt-12">
          <FeatureTabs slides={slides} label="Common operational problems" />
        </div>
      </div>
    </section>
  );
}

