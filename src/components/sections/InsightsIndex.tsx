import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { tagSlug, type Article } from "@/lib/content";
import { cn } from "@/lib/cn";

/** Topic pills and the article grid, shared by /insights and /insights/topic/[tag]. */
export function InsightsIndex({
  articles,
  allTags,
  activeTag,
}: {
  articles: Article[];
  allTags: string[];
  activeTag?: string;
}) {
  const pill =
    "inline-flex h-9 items-center rounded-full px-4 font-pill text-[13.5px] font-semibold whitespace-nowrap transition-colors duration-300";
  return (
    <Section aria-label="Articles">
      <nav aria-label="Topics">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href="/insights"
              aria-current={!activeTag ? "page" : undefined}
              className={cn(pill, !activeTag ? "bg-forest-deep text-white" : "bg-mint text-forest hover:bg-sage")}
            >
              All topics
            </Link>
          </li>
          {allTags.map((t) => {
            const active = activeTag === tagSlug(t);
            return (
              <li key={t}>
                <Link
                  href={`/insights/topic/${tagSlug(t)}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(pill, active ? "bg-forest-deep text-white" : "bg-mint text-forest hover:bg-sage")}
                >
                  {t}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {articles.length === 0 ? (
        <p className="mt-12 text-[17px] text-ink-soft">No articles on this topic yet.</p>
      ) : (
        <Reveal className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </Reveal>
      )}
    </Section>
  );
}

