import type { Metadata } from "next";
import { ArrowUpRight, CalendarDays, Laptop, Presentation, Wrench } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { washBg, washCycle } from "@/components/cards/washes";
import { PageHero } from "@/components/sections/PageHero";
import { AcademyInterestForm } from "@/components/forms/AcademyInterestForm";
import { academyFormat, programmes } from "@/content-data/academy";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Academy",
  description:
    "Practical four-week programmes that teach business owners and teams to put AI and automation to work — weekend live sessions, weekday practice and full learning hub access.",
  alternates: { canonical: "/academy" },
};

const formatIcons = [CalendarDays, Presentation, Wrench, Laptop];

function HubLink({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <a
      href={site.academyHubUrl}
      className={
        className ??
        "group inline-flex h-[50px] items-center gap-2 rounded-full border border-white/40 px-7 font-semibold text-white transition-[translate,background-color,border-color] duration-[350ms] ease-out-soft hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
      }
    >
      {children}
      <ArrowUpRight aria-hidden className="size-[18px]" />
    </a>
  );
}

export default function AcademyPage() {
  return (
    <>
      <PageHero
        eyebrow="TechieBreed Academy"
        title={
          <>
            Learn to put AI <em>to work</em> in your business.
          </>
        }
        intro="Practical programmes for business owners and teams. Less theory, more doing — you'll leave with tools and workflows you can use straight away."
        actions={
          <>
            <Button href="#interest" arrow>
              Register your interest
            </Button>
            <HubLink>Enrol on the student hub</HubLink>
          </>
        }
      />

      <Section aria-labelledby="programmes-title">
        <SectionHeading
          id="programmes-title"
          eyebrow="Programmes"
          title={
            <>
              Six ways to <em>get practical</em> with AI
            </>
          }
        />
        <Reveal as="ul" className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {programmes.map((p, i) => (
            <li key={p.id} className={`flex flex-col rounded-[28px] p-6 md:p-7 ${washBg[washCycle[i % washCycle.length]]}`}>
              <span className="font-display text-[18px] font-semibold text-leaf italic">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 text-[21px] leading-[1.3] font-bold text-forest">{p.title}</h3>
              <p className="mt-2 flex-1 text-[15.5px] leading-[1.55] text-pine/80">{p.summary}</p>
              <p className="mt-5 font-pill text-[13px] font-semibold text-pine/70">4 weeks · Live + practical</p>
            </li>
          ))}
        </Reveal>
      </Section>

      <Section tone="mint" aria-labelledby="format-title">
        <SectionHeading
          id="format-title"
          eyebrow="How it works"
          title={
            <>
              Built around <em>your working week</em>
            </>
          }
        />
        <Reveal as="ol" className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {academyFormat.map((f, i) => {
            const Icon = formatIcons[i] ?? CalendarDays;
            return (
              <li key={f.title} className="relative flex flex-col rounded-[24px] bg-white p-6">
                <span aria-hidden className="absolute top-6 right-6 font-display text-[28px] leading-none font-semibold text-mint">
                  {i + 1}
                </span>
                <span className="grid size-12 place-items-center rounded-full bg-forest text-lime">
                  <Icon aria-hidden className="size-6" strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 text-[19px] font-bold text-forest">{f.title}</h3>
                <p className="mt-1.5 text-[15px] leading-[1.55] text-ink-soft">{f.text}</p>
              </li>
            );
          })}
        </Reveal>
      </Section>

      <section aria-labelledby="hub-title" className="on-dark bg-ember py-16 text-center md:py-20">
        <Reveal className="container-x flex flex-col items-center">
          <h2 id="hub-title" className="max-w-[720px] font-display text-[30px] leading-[1.2] font-semibold text-white md:text-[42px]">
            Ready to start, or <em className="text-sun italic">already enrolled?</em>
          </h2>
          <p className="mt-4 max-w-[560px] text-[17px] leading-[1.6] text-[#e8dccf]">
            Enrolment, payment, lessons and your progress all live on the TechieBreed student hub.
          </p>
          <div className="mt-8">
            <HubLink className="group inline-flex h-[50px] items-center gap-2 rounded-full bg-sprout px-7 font-semibold text-on-sprout transition-[translate,background-color,box-shadow] duration-[350ms] ease-out-soft hover:-translate-y-0.5 hover:bg-sprout-bright hover:shadow-sprout">
              Go to the student hub
            </HubLink>
          </div>
        </Reveal>
      </section>

      <Section id="interest" className="scroll-mt-24" aria-labelledby="interest-title">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
          <Reveal>
            <p className="font-pill text-[13.5px] font-semibold tracking-[0.06em] text-leaf uppercase">Register your interest</p>
            <h2
              id="interest-title"
              className="mt-3 font-display text-[30px] leading-[1.2] font-semibold tracking-[-0.01em] text-forest md:text-[40px]"
            >
              Hear first when the <em className="text-leaf italic">next cohort</em> opens
            </h2>
            <p className="mt-4 text-[17px] leading-[1.65] text-ink-soft">
              Tell us which programme interests you and whether it&rsquo;s for you or your team. We&rsquo;ll be in touch
              with dates and details.
            </p>
          </Reveal>
          <div className="rounded-[28px] border border-line bg-white p-6 shadow-[0_24px_60px_-40px_rgb(0_0_0/0.35)] md:p-10">
            <AcademyInterestForm />
          </div>
        </div>
      </Section>
    </>
  );
}
