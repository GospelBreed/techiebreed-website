import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { CaseStudyCard } from "@/components/cards/CaseStudyCard";
import { PageHero } from "@/components/sections/PageHero";
import { CTABand } from "@/components/sections/CTABand";
import { CaseArt } from "@/components/illustrations/CaseArt";
import { getCaseStudies } from "@/lib/content";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "Systems we've built for real businesses: sponsorship acquisition, property operations and automated student enrolment.",
  alternates: { canonical: "/our-work" },
};

export default async function OurWorkPage() {
  const studies = await getCaseStudies();
  return (
    <>
      <PageHero
        eyebrow="Our work"
        title={
          <>
            Working systems, <em>built for real businesses</em>
          </>
        }
        intro="A look at what we've built, the manual work it replaced and how each system runs day to day."
      />

      <Section aria-label="Case studies">
        {studies.length === 0 ? (
          <p className="text-center text-[17px] text-ink-soft">Case studies are on their way.</p>
        ) : (
          <Reveal className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {studies.map((cs) => (
              <CaseStudyCard
                key={cs.slug}
                href={`/our-work/${cs.slug}`}
                client={cs.client}
                title={cs.title}
                summary={cs.summary}
                art={<CaseArt kind={cs.art} />}
                headingLevel="h2"
              />
            ))}
          </Reveal>
        )}
      </Section>

      <CTABand
        title={
          <>
            Want a system like these <em>for your business?</em>
          </>
        }
      />
    </>
  );
}
