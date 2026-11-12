import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/sections/PageHero";
import { CTABand } from "@/components/sections/CTABand";
import { InsightsIndex, collectTags } from "@/components/sections/InsightsIndex";
import { getArticles, tagSlug } from "@/lib/content";

// Render unknown slugs fully before responding, so they return a real 404.
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  return collectTags(await getArticles()).map((t) => ({ tag: tagSlug(t) }));
}

async function resolve(tag: string) {
  const articles = await getArticles();
  const tags = collectTags(articles);
  const name = tags.find((t) => tagSlug(t) === tag);
  return { articles, tags, name };
}

export async function generateMetadata({ params }: PageProps<"/insights/topic/[tag]">): Promise<Metadata> {
  const { name } = await resolve((await params).tag);
  if (!name) return {};
  return {
    title: `${name} — Insights`,
    description: `Articles about ${name.toLowerCase()} from TechieBreed.`,
    alternates: { canonical: `/insights/topic/${tagSlug(name)}` },
  };
}

export default async function TopicPage({ params }: PageProps<"/insights/topic/[tag]">) {
  const { tag } = await params;
  const { articles, tags, name } = await resolve(tag);
  if (!name) notFound();
  const filtered = articles.filter((a) => a.tags.some((t) => tagSlug(t) === tag));

  return (
    <>
      <PageHero
        eyebrow="Insights"
        title={
          <>
            Articles on <em>{name.toLowerCase()}</em>
          </>
        }
      />
      <InsightsIndex articles={filtered} allTags={tags} activeTag={tag} />
      <CTABand />
    </>
  );
}
