import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { CTABand } from "@/components/sections/CTABand";
import { InsightsIndex, collectTags } from "@/components/sections/InsightsIndex";
import { getArticles } from "@/lib/content";

export const metadata: Metadata = {
  title: "Insights",
  description: "Practical, plain-language ideas on automation, AI and running a business that works better.",
  alternates: { canonical: "/insights" },
};

export default async function InsightsPage() {
  const articles = await getArticles();
  return (
    <>
      <PageHero
        eyebrow="Insights"
        title={
          <>
            Practical ideas for <em>smarter operations</em>
          </>
        }
        intro="Plain-language articles on automation, AI and the systems behind businesses that run well."
      />
      <InsightsIndex articles={articles} allTags={collectTags(articles)} />
      <CTABand />
    </>
  );
}
