import type { Metadata } from "next";
import { pageMeta } from "@/lib/metadata";
import { Check, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollSpyNav } from "@/components/ui/ScrollSpyNav";
import { PackageCard } from "@/components/cards/PackageCard";
import { washBg } from "@/components/cards/washes";
import { PageHero } from "@/components/sections/PageHero";
import { CTABand } from "@/components/sections/CTABand";
import { ServiceArt } from "@/components/illustrations/ServiceArt";
import { packages, services } from "@/content-data/services";
import { auditCta } from "@/lib/site";
import { cn } from "@/lib/cn";

export const metadata: Metadata = pageMeta({
  title: "What We Do",
  description:
    "Workflow automation, AI assistants, sales systems, integrations, reporting and custom software — done-for-you systems that take repetitive work off your team.",
  path: "/what-we-do",
});

const spyItems = [
  ...services.map((s) => ({ id: s.id, label: s.short })),
  { id: "packages", label: "Ways to work with us" },
];

export default function WhatWeDoPage() {
  return (
    <>
      <PageHero
        eyebrow="What we do"
        title={
          <>
            Systems that take repetitive work <em>off your team&rsquo;s plate</em>
          </>
        }
        intro="We automate everyday operations, connect the tools you already use and build what's missing — so your team can focus on customers and growth. Your team stays in control."
        actions={
          <>
            <Button href={auditCta.href} arrow>
              {auditCta.label}
            </Button>
            <Button href="#packages" variant="ghost">
              Ways to work with us
            </Button>
          </>
        }
      />

      <ScrollSpyNav items={spyItems} label="Services on this page" />

      {services.map((s, i) => {
        const flip = i % 2 === 1;
        return (
          <section
            key={s.id}
            id={s.id}
            aria-labelledby={`${s.id}-title`}
            className={cn("scroll-mt-[140px] py-16 md:py-24", i % 2 === 1 && "bg-mint")}
          >
            <div className="container-x grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <Reveal className={cn(flip && "lg:order-2")}>
                <p className="font-display text-[20px] font-semibold text-leaf italic">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2
                  id={`${s.id}-title`}
                  className="mt-2 font-display text-[30px] leading-[1.2] font-semibold tracking-[-0.01em] text-forest md:text-[40px] md:leading-[1.15]"
                >
                  {s.title}
                </h2>
                <p className="mt-4 text-[17px] leading-[1.6] text-ink-soft">{s.description}</p>
                <div className="mt-7">
                  <h3 className="font-pill text-[13px] font-bold tracking-[0.06em] text-pine/70 uppercase">
                    Example use cases
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {s.useCases.map((u) => (
                      <li key={u} className="flex items-start gap-3 text-[16px] leading-[1.5] text-ink">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-sprout text-on-sprout">
                          <Check aria-hidden className="size-3.5" strokeWidth={3} />
                        </span>
                        {u}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href={`/contact?service=${s.id}#enquiry`} variant="dark" arrow>
                    Talk to us about this
                  </Button>
                </div>
              </Reveal>
              <Reveal className={cn(flip && "lg:order-1")}>
                <div className={cn("rounded-[28px] p-4 md:p-6", washBg[s.wash === "mint" ? "sage" : s.wash])}>
                  <div className="aspect-[16/10] overflow-hidden rounded-[20px] bg-white/70">
                    <ServiceArt id={s.id} />
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        );
      })}

      <Section id="packages" aria-labelledby="packages-title" className="scroll-mt-[140px]">
        <SectionHeading
          id="packages-title"
          eyebrow="Ways to work with us"
          title={
            <>
              Four ways to <em>get started</em>
            </>
          }
          intro="Every engagement is scoped to your business before any work begins, so there are no surprises."
        />
        <Reveal className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {packages.map((p) => (
            <PackageCard key={p.id} pkg={p} />
          ))}
        </Reveal>
        <Reveal className="mx-auto mt-12 max-w-[760px]">
          <div className="flex flex-col items-start gap-4 rounded-[20px] bg-sage p-6 sm:flex-row sm:items-center md:p-7">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-forest text-lime">
              <Compass aria-hidden className="size-6" strokeWidth={1.75} />
            </span>
            <p className="text-[16px] leading-[1.6] text-pine">
              <strong className="font-bold text-forest">Not sure where to start?</strong> The AI Operations Audit shows
              you exactly which problems are worth solving first — and what it will take.
            </p>
          </div>
        </Reveal>
      </Section>

      <CTABand />
    </>
  );
}
