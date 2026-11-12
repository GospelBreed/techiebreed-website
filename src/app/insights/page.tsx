import type { Metadata } from "next";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CTABand } from "@/components/sections/CTABand";
import { InsightsIndex } from "@/components/sections/InsightsIndex";
import { collectTags, getArticles } from "@/lib/content";

export const metadata: Metadata = pageMeta({
  title: "Insights",
  description:
    "Practical, plain-language ideas on automation, AI and running a business that works better.",
  path: "/insights",
});

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
