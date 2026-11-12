import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { CTABand } from "@/components/sections/CTABand";
import { Prose } from "@/components/mdx/Prose";
import { formatDate, getArticles, tagSlug } from "@/lib/content";

// Render unknown slugs fully before responding, so they return a real 404.
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  return (await getArticles()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/insights/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = (await getArticles()).find((a) => a.slug === slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: `/insights/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      publishedTime: article.date,
      tags: article.tags,
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/insights/[slug]">) {
  const { slug } = await params;
  const articles = await getArticles();
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  // Related: share a tag first, then most recent.
  const related = articles
    .filter((a) => a.slug !== slug)
    .sort((a, b) => {
      const share = (x: typeof a) => (x.tags.some((t) => article.tags.includes(t)) ? 1 : 0);
      return share(b) - share(a) || b.date.localeCompare(a.date);
    })
    .slice(0, 3);

  return (
    <>
      <section className="on-dark relative overflow-hidden bg-[radial-gradient(70%_90%_at_50%_45%,var(--color-forest-glow)_0%,var(--color-forest)_62%)] text-white">
        <Reveal className="container-x flex max-w-[860px] flex-col items-start py-14 md:py-20">
          <Link
            href="/insights"
            className="group inline-flex items-center gap-2 text-[15px] font-medium text-white/80 hover:text-white"
          >
            <ArrowLeft aria-hidden className="size-4 transition-transform group-hover:-translate-x-1" />
            All insights
          </Link>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Topics">
            {article.tags.map((t) => (
              <li key={t}>
                <Link
                  href={`/insights/topic/${tagSlug(t)}`}
                  className="rounded-full border border-white/25 px-3 py-1 font-pill text-[12.5px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  {t}
                </Link>
              </li>
            ))}
          </ul>
          <h1 className="mt-4 font-display text-[clamp(32px,5.4vw,52px)] leading-[1.12] font-semibold tracking-[-0.012em] text-white">
            {article.title}
          </h1>
          <p className="mt-5 text-[18px] leading-[1.6] text-white/[0.86]">{article.summary}</p>
          <p className="mt-6 text-[14px] font-medium text-white/75">
            {article.author} · <time dateTime={article.date}>{formatDate(article.date)}</time> ·{" "}
            {article.readingMinutes} min read
          </p>
        </Reveal>
      </section>

      <article className="container-x max-w-[860px] py-14 md:py-20" aria-label={article.title}>
        <Prose source={article.body} />
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="bg-mint py-16 md:py-20">
          <div className="container-x">
            <h2 id="related-title" className="font-display text-[26px] font-semibold text-forest md:text-[32px]">
              Keep reading
            </h2>
            <div className="mt-8 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.slug} article={a} headingLevel="h3" />
              ))}
            </div>
          </div>
        </section>
      )}

      <CTABand />
    </>
  );
}
