import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { ScrollSpyNav } from "@/components/ui/ScrollSpyNav";
import { washBg } from "@/components/cards/washes";
import { PageHero } from "@/components/sections/PageHero";
import { CTABand } from "@/components/sections/CTABand";
import { industries } from "@/content-data/industries";
import { auditCta } from "@/lib/site";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "From growing SMEs to enterprise teams: the operational problems we solve in each industry, and the systems we build to fix them.",
  alternates: { canonical: "/industries" },
};

const shortNames: Record<string, string> = {
  smes: "SMEs",
  "professional-services": "Professional services",
  property: "Property",
  education: "Education",
  sales: "Sales teams",
  enterprise: "Enterprise",
};

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title={
          <>
            Different industries. <em>The same busywork.</em>
          </>
        }
        intro="Every industry has its own version of repetitive work. Here's what we see most often — and what we build to fix it."
      />

      <ScrollSpyNav items={industries.map((i) => ({ id: i.id, label: shortNames[i.id] ?? i.name }))} label="Industries on this page" />

      <Section>
        <div className="flex flex-col gap-6">
          {industries.map((ind) => {
            const Icon = ind.icon;
            return (
              <Reveal
                key={ind.id}
                as="article"
                id={ind.id}
                aria-labelledby={`${ind.id}-title`}
                className={cn("scroll-mt-[150px] rounded-[28px] p-6 md:p-10", washBg[ind.wash])}
              >
                <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-10">
                  <div>
                    <span className="grid size-14 place-items-center rounded-[16px] bg-white text-forest shadow-[0_6px_16px_-10px_rgb(0_76_40/0.5)]">
                      <Icon aria-hidden className="size-7" strokeWidth={1.75} />
                    </span>
                    <h2
                      id={`${ind.id}-title`}
                      className="mt-5 font-display text-[26px] leading-[1.2] font-semibold text-forest md:text-[32px]"
                    >
                      {ind.name}
                    </h2>
                    <p className="mt-4 font-pill text-[12.5px] font-bold tracking-[0.06em] text-pine/70 uppercase">
                      The problem
                    </p>
                    <p className="mt-1.5 text-[17px] leading-[1.6] text-ink">{ind.problem}</p>
                  </div>

                  <span
                    aria-hidden
                    className="grid size-12 place-items-center rounded-full bg-forest text-lime max-lg:rotate-90 max-lg:justify-self-start"
                  >
                    <ArrowRight className="size-5" />
                  </span>

                  <div className="rounded-[20px] bg-white p-6 md:p-7">
                    <p className="font-pill text-[12.5px] font-bold tracking-[0.06em] text-leaf uppercase">
                      What we build
                    </p>
                    <p className="mt-1.5 text-[21px] leading-[1.3] font-bold text-forest">{ind.solution}</p>
                    <ul className="mt-4 space-y-2.5">
                      {ind.examples.map((e) => (
                        <li key={e} className="flex items-start gap-3 text-[15.5px] leading-[1.5] text-ink">
                          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-sprout text-on-sprout">
                            <Check aria-hidden className="size-3.5" strokeWidth={3} />
                          </span>
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mx-auto mt-14 flex max-w-[640px] flex-col items-center text-center">
          <h2 className="font-display text-[26px] leading-[1.25] font-semibold text-forest md:text-[32px]">
            Don&rsquo;t see your industry?
          </h2>
          <p className="mt-3 text-[17px] leading-[1.6] text-ink-soft">
            If your team repeats the same tasks every week, we can almost certainly help. Tell us how you work today.
          </p>
          <div className="mt-7">
            <Button href={auditCta.href} arrow>
              {auditCta.label}
            </Button>
          </div>
        </Reveal>
      </Section>

      <CTABand />
    </>
  );
}
