import type { Metadata } from "next";
import { pageMeta } from "@/lib/metadata";
import { Check, Mail, Phone } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { BookingEmbed } from "@/components/sections/BookingEmbed";
import { DiscoveryForm } from "@/components/forms/DiscoveryForm";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Contact",
  description:
    "Tell us what's taking up your team's time, or book an AI Operations Audit to find out what's worth automating first.",
  path: "/contact",
});

const nextSteps = [
  { title: "We read your message", text: "A real person reviews every enquiry — no automated sales sequence." },
  { title: "We reply with next steps", text: "This may include a short call to understand how your business runs today." },
  { title: "You decide", text: "If we can help, we'll suggest where to start. No pressure, no jargon." },
];

const auditIncludes = [
  "A review of how work moves through your business",
  "The bottlenecks and repetitive tasks costing you the most time",
  "Clear recommendations in priority order, in plain language",
  "What each recommendation would take to build",
];

function ContactLine({ icon: Icon, value, href }: { icon: typeof Mail; value: string; href: string }) {
  return (
    <li className="flex items-start gap-3 text-[15.5px] text-ink">
      <Icon aria-hidden className="mt-0.5 size-[18px] shrink-0 text-leaf" />
      <a href={href} className="font-medium hover:text-leaf">
        {value}
      </a>
    </li>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let&rsquo;s talk about <em>your operations</em>
          </>
        }
        intro="Tell us what's slowing your team down. We'll tell you honestly what can be automated, connected or simplified — and what to do first."
      />

      <Section id="enquiry" className="scroll-mt-24" aria-labelledby="enquiry-title">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)] lg:gap-14">
          <div className="rounded-[28px] border border-line bg-white p-6 shadow-[0_24px_60px_-40px_rgb(0_0_0/0.35)] md:p-10">
            <h2 id="enquiry-title" className="font-display text-[28px] leading-[1.2] font-semibold text-forest md:text-[34px]">
              Tell us about <em className="text-leaf italic">your business</em>
            </h2>
            <p className="mt-2 mb-7 text-[16px] text-ink-soft">The more you tell us, the more useful our reply will be.</p>
            <DiscoveryForm />
          </div>

          <aside className="flex flex-col gap-6" aria-label="What happens next">
            <Reveal className="rounded-[24px] bg-sage p-6 md:p-8">
              <h2 className="font-pill text-[13px] font-bold tracking-[0.06em] text-pine/70 uppercase">What happens next</h2>
              <ol className="mt-5 space-y-5">
                {nextSteps.map((s, i) => (
                  <li key={s.title} className="flex gap-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-forest font-display text-[16px] font-semibold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold text-forest">{s.title}</p>
                      <p className="mt-0.5 text-[15px] leading-[1.55] text-pine/85">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>

            <div className="rounded-[24px] border border-line bg-white p-6 md:p-8">
              <h2 className="font-pill text-[13px] font-bold tracking-[0.06em] text-pine/70 uppercase">Other ways to reach us</h2>
              <ul className="mt-4 space-y-3">
                <ContactLine icon={Mail} value={site.contact.email} href={`mailto:${site.contact.email}`} />
                <ContactLine icon={Phone} value={site.contact.phone} href={`tel:${site.contact.phoneE164}`} />
              </ul>
              <a
                href="#audit"
                className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-leaf underline decoration-leaf/40 underline-offset-4 hover:text-forest"
              >
                Prefer to talk? Book an audit call
              </a>
            </div>
          </aside>
        </div>
      </Section>

      <Section id="audit" tone="mint" className="scroll-mt-20" aria-labelledby="audit-title">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full bg-lime px-3 py-1 font-pill text-[12.5px] font-bold text-forest">
              <span className="size-1.5 rotate-45 rounded-[1px] bg-forest" aria-hidden />
              Recommended starting point
            </p>
            <h2
              id="audit-title"
              className="mt-4 font-display text-[30px] leading-[1.2] font-semibold tracking-[-0.01em] text-forest md:text-[42px]"
            >
              The AI Operations <em className="text-leaf italic">Audit</em>
            </h2>
            <p className="mt-4 text-[17px] leading-[1.65] text-ink-soft">
              Before we build anything, we find out how your business really runs. The audit shows you exactly where
              automation will help most — so you invest in the right things first.
            </p>
            <h3 className="mt-8 font-pill text-[13px] font-bold tracking-[0.06em] text-pine/70 uppercase">What&rsquo;s included</h3>
            <ul className="mt-3 space-y-3">
              {auditIncludes.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[16px] leading-[1.5] text-ink">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-sprout text-on-sprout">
                    <Check aria-hidden className="size-3.5" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[16px] leading-[1.6] text-ink-soft">
              <strong className="font-semibold text-forest">Your team stays in control.</strong> You get recommendations,
              not a hard sell — and you decide what happens next.
            </p>
          </Reveal>
          <div>
            <h3 className="sr-only">Pick a time</h3>
            <BookingEmbed />
          </div>
        </div>
      </Section>
    </>
  );
}
