import type { Metadata } from "next";
import { ArrowRight, Feather, HeartHandshake, Lightbulb, ShieldCheck, Sprout, UserRound, Users } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PillarCard } from "@/components/cards/PillarCard";
import { PageHero } from "@/components/sections/PageHero";
import { CTABand } from "@/components/sections/CTABand";

export const metadata: Metadata = {
  title: "About",
  description:
    "TechieBreed is evolving into an AI Operations and Technology company — building the working systems that make businesses run better.",
  alternates: { canonical: "/about" },
};

const values = [
  { icon: Feather, title: "Simplicity", text: "We make technology easy to use and easy to understand." },
  { icon: Lightbulb, title: "Practical innovation", text: "We use new technology only where it solves a real problem." },
  { icon: HeartHandshake, title: "Ownership", text: "We treat your results as our own, from first call to long after launch." },
  { icon: ShieldCheck, title: "Reliability", text: "We build systems you can count on, and we do what we say we will." },
  { icon: Users, title: "Human-centred technology", text: "Technology should support people and their judgement, not replace them." },
  { icon: Sprout, title: "Growth", text: "We help our clients, our team and our community keep growing." },
];

// [TEAM MEMBER] Replace with real names, roles, short bios and photos.
const team = [
  { name: "[TEAM MEMBER NAME]", role: "[ROLE]" },
  { name: "[TEAM MEMBER NAME]", role: "[ROLE]" },
  { name: "[TEAM MEMBER NAME]", role: "[ROLE]" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About TechieBreed"
        title={
          <>
            TechieBreed is <em>evolving.</em>
          </>
        }
        intro="From helping people understand digital technology to building the systems that make businesses run better."
      />

      {/* Story */}
      <Section aria-labelledby="story-title">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <p className="font-pill text-[13.5px] font-semibold tracking-[0.06em] text-leaf uppercase">Our story</p>
            <h2
              id="story-title"
              className="mt-3 font-display text-[30px] leading-[1.2] font-semibold tracking-[-0.01em] text-forest md:text-[40px]"
            >
              Making technology <em className="text-leaf italic">work together</em>
            </h2>
          </Reveal>
          <Reveal className="space-y-5 text-[18px] leading-[1.7] text-ink">
            <p>
              For years, TechieBreed has helped individuals and businesses understand and leverage digital technology.
            </p>
            <p>
              But as businesses grow, the biggest challenge isn&rsquo;t knowing which technology to use — it&rsquo;s
              making technology work together to solve everyday business problems.
            </p>
            <p className="font-semibold text-forest">
              That&rsquo;s why TechieBreed is evolving into an AI Operations and Technology company.
            </p>
          </Reveal>
        </div>

        <Reveal className="mt-14 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-[24px] bg-sage p-6 md:p-8">
            <p className="font-pill text-[12.5px] font-bold tracking-[0.06em] text-pine/70 uppercase">Where we started</p>
            <p className="mt-2 text-[19px] leading-[1.4] font-bold text-forest">
              Helping people understand and use digital technology
            </p>
          </div>
          <span aria-hidden className="grid size-12 place-items-center self-center justify-self-center rounded-full bg-forest text-lime max-md:rotate-90">
            <ArrowRight className="size-5" />
          </span>
          <div className="on-dark rounded-[24px] bg-forest p-6 md:p-8">
            <p className="font-pill text-[12.5px] font-bold tracking-[0.06em] text-lime uppercase">Where we&rsquo;re going</p>
            <p className="mt-2 text-[19px] leading-[1.4] font-bold text-white">
              Building the working systems that make businesses run better
            </p>
          </div>
        </Reveal>
      </Section>

      {/* Vision & mission */}
      <Section tone="mint" aria-label="Vision and mission">
        <Reveal className="grid gap-5 md:grid-cols-2">
          <article className="on-dark rounded-[28px] bg-forest p-8 md:p-10">
            <h2 className="font-display text-[28px] font-semibold text-lime italic">Our vision</h2>
            <p className="mt-4 text-[19px] leading-[1.55] text-white">
              To become a globally recognised technology company helping businesses operate intelligently, efficiently and
              profitably through practical technology.
            </p>
          </article>
          <article className="rounded-[28px] bg-white p-8 md:p-10">
            <h2 className="font-display text-[28px] font-semibold text-leaf italic">Our mission</h2>
            <p className="mt-4 text-[19px] leading-[1.55] text-ink">
              To simplify business operations by designing, building and implementing intelligent systems that eliminate
              repetitive work, improve efficiency and help businesses achieve sustainable growth.
            </p>
          </article>
        </Reveal>
      </Section>

      {/* Brand promise */}
      <section aria-labelledby="promise-title" className="on-dark bg-ember py-20 text-center md:py-28">
        <Reveal className="container-x flex flex-col items-center">
          <p className="font-pill text-[13.5px] font-semibold tracking-[0.06em] text-sun uppercase">Our promise</p>
          <h2
            id="promise-title"
            className="mt-4 max-w-[860px] font-display text-[32px] leading-[1.15] font-semibold tracking-[-0.01em] text-white md:text-[50px]"
          >
            We make business operations easier through <em className="text-sun italic">technology that works.</em>
          </h2>
        </Reveal>
      </section>

      {/* Values */}
      <Section aria-labelledby="values-title">
        <SectionHeading
          id="values-title"
          eyebrow="Our values"
          title={
            <>
              What we <em>stand for</em>
            </>
          }
        />
        <Reveal className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((v) => (
            <PillarCard key={v.title} icon={v.icon} title={v.title}>
              {v.text}
            </PillarCard>
          ))}
        </Reveal>
      </Section>

      {/* Team */}
      <Section tone="mint" aria-labelledby="team-title">
        <SectionHeading
          id="team-title"
          eyebrow="Our team"
          title={
            <>
              The people <em>behind the systems</em>
            </>
          }
        />
        <Reveal as="ul" className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m, i) => (
            <li key={i} className="flex flex-col items-center rounded-[24px] bg-white p-8 text-center">
              <span className="grid size-24 place-items-center rounded-full bg-mint text-forest/60" aria-hidden>
                <UserRound className="size-10" strokeWidth={1.5} />
              </span>
              <p className="mt-5 text-[19px] font-bold text-forest">{m.name}</p>
              <p className="mt-1 text-[15px] text-muted">{m.role}</p>
            </li>
          ))}
        </Reveal>
      </Section>

      <CTABand />
    </>
  );
}
