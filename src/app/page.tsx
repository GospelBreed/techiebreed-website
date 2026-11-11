// Phase 1 review page: shows the shared components. Replaced by the real homepage in Phase 2.
import { Building2, GraduationCap, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SelectInput, TextArea, TextInput } from "@/components/ui/FormField";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { PillarCard } from "@/components/cards/PillarCard";
import { CaseStudyCard } from "@/components/cards/CaseStudyCard";
import { PackageCard } from "@/components/cards/PackageCard";
import { IndustryTile } from "@/components/cards/IndustryTile";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { CTABand } from "@/components/sections/CTABand";
import { packages, services } from "@/content-data/services";

export default function Phase1Preview() {
  return (
    <>
      <section className="on-dark bg-[radial-gradient(70%_90%_at_50%_45%,var(--color-forest-glow)_0%,var(--color-forest)_62%)] py-24 text-center">
        <Reveal className="container-x flex flex-col items-center">
          <h1 className="font-display text-[40px] leading-[1.12] font-semibold tracking-[-0.012em] text-white md:text-[66px]">
            Design <em className="text-lime italic">system</em> preview
          </h1>
          <p className="mt-5 max-w-[520px] text-[17px] text-white/85">
            Phase 1 review page — buttons, cards, timeline and form controls. The real homepage replaces this in Phase 2.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/what-we-do">Primary</Button>
            <Button href="/contact#audit" variant="ghost" arrow>
              Ghost
            </Button>
            <Button href="/academy" variant="sun">
              Sun
            </Button>
          </div>
        </Reveal>
      </section>

      <Section>
        <SectionHeading eyebrow="Cards" title={<>Featured <em>services</em></>} intro="ServiceCard in the pastel washes." />
        <Reveal className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.id} title={s.title} summary={s.summary} href={`/what-we-do#${s.id}`} wash={s.wash} />
          ))}
        </Reveal>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="/what-we-do" variant="dark">
            Dark
          </Button>
          <Button href="/what-we-do" variant="secondary" arrow>
            Secondary
          </Button>
        </div>
      </Section>

      <Section tone="mint">
        <SectionHeading title="Pillars, case studies, industries" />
        <Reveal className="mt-12 grid gap-5 md:grid-cols-3">
          <PillarCard icon={Sparkles} title="Built around your business">
            We start from how your team works today.
          </PillarCard>
          <PillarCard icon={Workflow} title="Done for you, start to finish">
            We design, build, launch and look after it.
          </PillarCard>
          <PillarCard icon={ShieldCheck} title="Safe by design">
            AI prepares, your team approves, the system sends.
          </PillarCard>
        </Reveal>
        <Reveal className="mt-5 grid gap-5 md:grid-cols-3">
          <CaseStudyCard href="/our-work" client="SportConn" title="Automated prospect research" summary="Placeholder summary." />
          <IndustryTile icon={Building2} name="Real estate & property" problem="Resident communication." solution="Property operations platforms" wash="butter" />
          <IndustryTile icon={GraduationCap} name="Education & EdTech" wash="sky" />
        </Reveal>
      </Section>

      <Section>
        <SectionHeading title="Process timeline" />
        <div className="mt-12">
          <ProcessTimeline
            steps={["Discover", "Diagnose", "Design", "Build", "Test", "Deploy", "Optimise"].map((t) => ({
              title: t,
              text: "Short description of this step.",
            }))}
          />
        </div>
      </Section>

      <Section tone="mint">
        <SectionHeading title="Packages" />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {packages.map((p) => (
            <PackageCard key={p.id} pkg={p} />
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading title="Form fields" />
        <form className="mx-auto mt-10 grid max-w-xl gap-5">
          <TextInput label="Full name" name="name" required autoComplete="name" />
          <TextInput label="Email" name="email" type="email" required error="Enter a valid email address." />
          <SelectInput label="Company size" name="size" options={["1–10", "11–50", "51–200", "200+"]} />
          <TextArea label="What's taking up your team's time?" name="pain" hint="A sentence or two is plenty." />
        </form>
      </Section>

      <CTABand />
    </>
  );
}
