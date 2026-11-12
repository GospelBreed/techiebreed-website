import type { Metadata } from "next";
import { pageMeta } from "@/lib/metadata";
import { ArrowUpRight, Layers, RefreshCw, ShieldCheck, Wrench } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { PainPoints } from "@/components/home/PainPoints";
import { ArrowLink, Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { PillarCard } from "@/components/cards/PillarCard";
import { CaseStudyCard } from "@/components/cards/CaseStudyCard";
import { PackageCard } from "@/components/cards/PackageCard";
import { IndustryTile } from "@/components/cards/IndustryTile";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { ApprovalFlow } from "@/components/sections/ApprovalFlow";
import { CTABand } from "@/components/sections/CTABand";
import { ServiceArt } from "@/components/illustrations/ServiceArt";
import { CaseArt } from "@/components/illustrations/CaseArt";
import { packages, services } from "@/content-data/services";
import { industries } from "@/content-data/industries";
import { processSteps } from "@/content-data/process";
import { programmes } from "@/content-data/academy";
import { getCaseStudies } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: `${site.name} — Less operational pressure. More intelligent growth.`,
  description:
    "We build smart systems that automate everyday operations, connect your business tools and give your team more time to focus on what matters.",
  path: "/",
  absoluteTitle: true,
});

function ChipList({ items, arrows }: { items: string[]; arrows?: boolean }) {
  return (
    <ul className="flex flex-wrap items-center gap-2">
      {items.map((item, i) => (
        <li key={item} className="flex items-center gap-2">
          <span className="rounded-full bg-mint px-3.5 py-1.5 font-pill text-[13px] font-semibold text-forest">{item}</span>
          {arrows && i < items.length - 1 && (
            <span aria-hidden className="text-leaf">
              →
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function HomePage() {
  const caseStudies = (await getCaseStudies()).slice(0, 3);

  return (
    <>
      <Hero />

      <PainPoints />

      {/* What we do */}
      <Section aria-labelledby="services-title" className="pt-4 md:pt-8">
        <SectionHeading
          id="services-title"
          eyebrow="What we do"
          title={
            <>
              Six ways we take work <em>off your plate</em>
            </>
          }
          intro="Done-for-you systems that automate repetitive work, connect your tools and keep your team in control."
        />
        <Reveal className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard
              key={s.id}
              title={s.title}
              summary={s.summary}
              href={`/what-we-do#${s.id}`}
              wash={s.wash}
              art={<ServiceArt id={s.id} />}
            />
          ))}
        </Reveal>
        <div className="mt-12 flex justify-center">
          <Button href="/what-we-do">View all services</Button>
        </div>
      </Section>

      {/* Why TechieBreed */}
      <Section tone="mint" aria-labelledby="why-title">
        <Reveal className="mx-auto max-w-[860px] text-center">
          <p className="font-pill text-[13.5px] font-semibold tracking-[0.06em] text-leaf uppercase">Why TechieBreed</p>
          <h2
            id="why-title"
            className="mt-4 font-display text-[28px] leading-[1.25] font-semibold tracking-[-0.01em] text-forest md:text-[40px] md:leading-[1.2]"
          >
            We don&rsquo;t just introduce technology to your business.{" "}
            <em className="text-leaf italic">We build the working systems that make your business run better.</em>
          </h2>
        </Reveal>
        <Reveal className="mt-12 grid gap-5 md:grid-cols-3">
          <PillarCard
            icon={Layers}
            title="Built around your business"
            extra={<ChipList items={["Your process", "Your tools", "Your team", "Your goals"]} />}
          >
            We start with how your team works today, then design the system around it — not the other way round.
          </PillarCard>
          <PillarCard
            icon={Wrench}
            title="Done for you, start to finish"
            extra={<ChipList items={["Plan", "Build", "Launch", "Look after"]} arrows />}
          >
            We plan it, build it, launch it and look after it. You don&rsquo;t need a technical team to get results.
          </PillarCard>
          <PillarCard icon={ShieldCheck} title="Safe by design" extra={<ApprovalFlow />}>
            AI does the preparation. Your team stays in control of anything that matters, and every action is recorded.
          </PillarCard>
        </Reveal>
      </Section>

      {/* Process */}
      <Section aria-labelledby="process-title">
        <SectionHeading
          id="process-title"
          eyebrow="How we work"
          title={
            <>
              Seven steps from first call to <em>a system that keeps improving</em>
            </>
          }
        />
        <div className="mt-14">
          <ProcessTimeline steps={processSteps} />
        </div>
        <Reveal className="mx-auto mt-14 max-w-[760px]">
          <div className="flex flex-col items-start gap-4 rounded-[20px] bg-sage p-6 sm:flex-row sm:items-center md:p-7">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-forest text-lime">
              <RefreshCw aria-hidden className="size-6" strokeWidth={1.75} />
            </span>
            <p className="text-[16px] leading-[1.6] text-pine">
              <strong className="font-bold text-forest">Launch isn&rsquo;t the finish line.</strong> Once your system is
              live, we keep measuring and improving it so it keeps up with your business.
            </p>
          </div>
        </Reveal>
      </Section>

      {/* Our work */}
      <Section tone="mint" aria-labelledby="work-title">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            id="work-title"
            align="left"
            eyebrow="Our work"
            title={
              <>
                Systems we&rsquo;ve <em>built</em>
              </>
            }
          />
          <ArrowLink href="/our-work" className="shrink-0 font-semibold text-forest">
            View all work
          </ArrowLink>
        </div>
        <Reveal className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {caseStudies.map((cs) => (
            <CaseStudyCard
              key={cs.slug}
              href={`/our-work/${cs.slug}`}
              client={cs.client}
              title={cs.title}
              summary={cs.summary}
              art={<CaseArt kind={cs.art} />}
            />
          ))}
        </Reveal>
      </Section>

      {/* Packages */}
      <Section aria-labelledby="packages-title">
        <SectionHeading
          id="packages-title"
          eyebrow="Ways to work with us"
          title={
            <>
              Start small, or <em>go all in</em>
            </>
          }
          intro="Most clients start with an AI Operations Audit. Every engagement is scoped to your business before any work begins."
        />
        <Reveal className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {packages.map((p) => (
            <PackageCard key={p.id} pkg={p} />
          ))}
        </Reveal>
      </Section>

      {/* Industries */}
      <Section tone="mint" aria-labelledby="industries-title">
        <SectionHeading
          id="industries-title"
          eyebrow="Industries"
          title={
            <>
              Built for businesses <em>like yours</em>
            </>
          }
        />
        <Reveal className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind) => (
            <IndustryTile
              key={ind.id}
              icon={ind.icon}
              name={ind.name}
              solution={ind.solution}
              href={`/industries#${ind.id}`}
              wash="white"
            />
          ))}
        </Reveal>
      </Section>

      {/* Academy */}
      <section aria-labelledby="academy-title" className="on-dark bg-ember py-20 text-center md:py-28">
        <Reveal className="container-x flex flex-col items-center">
          <p className="font-pill text-[13.5px] font-semibold tracking-[0.06em] text-sun uppercase">TechieBreed Academy</p>
          <h2
            id="academy-title"
            className="mt-4 max-w-[760px] font-display text-[32px] leading-[1.15] font-semibold tracking-[-0.01em] text-white md:text-[50px]"
          >
            Learn to put AI <em className="text-sun italic">to work</em> in your business.
          </h2>
          <p className="mt-5 max-w-[640px] text-[17px] leading-[1.6] text-[#e8dccf]">
            Four-week, practical programmes for business owners and teams — weekend live sessions, weekday practice and
            full access to our learning hub.
          </p>
          <ul className="mt-8 flex max-w-[860px] flex-wrap justify-center gap-2.5" aria-label="Programmes">
            {programmes.map((p) => (
              <li
                key={p.id}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 font-pill text-[13.5px] font-semibold text-white/90"
              >
                {p.title}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Button href="/academy">Explore the Academy</Button>
            <a
              href={site.academyHubUrl}
              className="group inline-flex h-[50px] items-center gap-2 rounded-full border border-white/40 px-7 font-semibold text-white transition-[translate,background-color,border-color] duration-[350ms] ease-out-soft hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
            >
              Go to the student hub
              <ArrowUpRight aria-hidden className="size-[18px]" />
            </a>
          </div>
        </Reveal>
      </section>

      <CTABand />
    </>
  );
}
