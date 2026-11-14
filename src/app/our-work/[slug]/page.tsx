import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button, ArrowLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { CaseStudyCard } from "@/components/cards/CaseStudyCard";
import { CTABand } from "@/components/sections/CTABand";
import { CaseArt } from "@/components/illustrations/CaseArt";
import { CaseCover } from "@/components/media/CaseCover";
import { CaseVideoPlayer } from "@/components/media/CaseVideoPlayer";
import { cn } from "@/lib/cn";
import { FlowDiagram } from "@/components/mdx/FlowDiagram";
import { Results } from "@/components/mdx/Results";
import { Prose } from "@/components/mdx/Prose";
import { services } from "@/content-data/services";
import { getCaseStudies, getCaseStudy } from "@/lib/content";
import { pageMeta } from "@/lib/metadata";
import { auditCta } from "@/lib/site";

// Render unknown slugs fully before responding, so they return a real 404.
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  return (await getCaseStudies()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/our-work/[slug]">): Promise<Metadata> {
  const cs = await getCaseStudy((await params).slug);
  if (!cs) return {};
  return pageMeta({
    title: `${cs.client}: ${cs.title}`,
    description: cs.summary,
    path: `/our-work/${cs.slug}`,
    type: "article",
  });
}

export default async function CaseStudyPage({ params }: PageProps<"/our-work/[slug]">) {
  const { slug } = await params;
  const all = await getCaseStudies();
  const index = all.findIndex((c) => c.slug === slug);
  if (index === -1) notFound();
  const cs = all[index];
  const next = all.length > 1 ? all[(index + 1) % all.length] : null;
  const usedServices = services.filter((s) => cs.services.includes(s.id));

  return (
    <>
      <section className="on-dark relative overflow-hidden bg-[radial-gradient(70%_90%_at_50%_45%,var(--color-forest-glow)_0%,var(--color-forest)_62%)] text-white">
        <div
          className={cn(
            "container-x grid items-center gap-10 py-14 md:py-20",
            !cs.video && "lg:grid-cols-[1.1fr_1fr]",
          )}
        >
          <Reveal className={cs.video ? "max-w-[820px]" : undefined}>
            <Link
              href="/our-work"
              className="group inline-flex items-center gap-2 text-[15px] font-medium text-white/80 hover:text-white"
            >
              <ArrowLeft aria-hidden className="size-4 transition-transform group-hover:-translate-x-1" />
              All work
            </Link>
            <p className="mt-6 font-pill text-[13.5px] font-semibold tracking-[0.06em] text-lime uppercase">{cs.client}</p>
            <h1 className="mt-3 font-display text-[clamp(32px,5.4vw,52px)] leading-[1.12] font-semibold tracking-[-0.012em] text-white">
              {cs.title}
            </h1>
            <p className="mt-5 max-w-[560px] text-[17px] leading-[1.6] text-white/[0.86]">{cs.summary}</p>
          </Reveal>
          {cs.video ? (
            <div id="walkthrough" className="scroll-mt-24">
              <CaseVideoPlayer video={cs.video} title={cs.title} />
              <p className="mt-3 text-[14px] text-white/75">
                Video walkthrough{cs.video.duration ? ` · ${cs.video.duration}` : ""}
                {cs.video.captions ? " · Captions available in the player menu" : ""}
              </p>
            </div>
          ) : (
            <Reveal>
              <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)]">
                <div className="aspect-[16/10]">
                  <CaseArt kind={cs.art} />
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <div className="container-x grid gap-12 py-16 md:py-20 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
        <article aria-label="Case study">
          <Prose
            source={cs.body}
            components={{
              FlowDiagram: () => <FlowDiagram steps={cs.flow} />,
              Results: () => <Results results={cs.results} />,
            }}
          />
        </article>

        <aside className="lg:sticky lg:top-28 lg:self-start" aria-label="At a glance">
          <div className="rounded-[20px] border border-line bg-white p-6">
            <h2 className="font-pill text-[13px] font-bold tracking-[0.06em] text-pine/70 uppercase">At a glance</h2>
            <dl className="mt-4 space-y-4 text-[15px]">
              <div>
                <dt className="text-muted">Client</dt>
                <dd className="mt-0.5 font-semibold text-ink">{cs.client}</dd>
              </div>
              <div>
                <dt className="text-muted">Industry</dt>
                <dd className="mt-0.5 font-semibold text-ink">{cs.industry}</dd>
              </div>
              {usedServices.length > 0 && (
                <div>
                  <dt className="text-muted">What we built</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {usedServices.map((s) => (
                      <Link
                        key={s.id}
                        href={`/what-we-do#${s.id}`}
                        className="rounded-full bg-mint px-3 py-1.5 font-pill text-[13px] font-semibold text-forest transition-colors hover:bg-sage"
                      >
                        {s.short}
                      </Link>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <div className="on-dark mt-4 rounded-[20px] bg-forest p-6">
            <p className="font-display text-[22px] leading-[1.25] font-semibold text-white">
              Want something <em className="text-lime italic">similar?</em>
            </p>
            <p className="mt-2 text-[15px] leading-[1.55] text-white/80">
              Start with an audit and we&rsquo;ll show you what&rsquo;s worth automating first.
            </p>
            <Button href={auditCta.href} size="sm" className="mt-5 w-full" arrow>
              Book an audit
            </Button>
          </div>
        </aside>
      </div>

      {next && (
        <section aria-labelledby="next-title" className="bg-mint py-16 md:py-20">
          <div className="container-x">
            <div className="flex items-end justify-between gap-4">
              <h2 id="next-title" className="font-display text-[26px] font-semibold text-forest md:text-[32px]">
                Next case study
              </h2>
              <ArrowLink href="/our-work" className="font-semibold text-forest">
                All work
              </ArrowLink>
            </div>
            <div className="mt-8 max-w-[420px]">
              <CaseStudyCard
                href={`/our-work/${next.slug}`}
                client={next.client}
                title={next.title}
                summary={next.summary}
                art={<CaseCover cs={next} />}
              />
            </div>
          </div>
        </section>
      )}

      <CTABand />
    </>
  );
}
