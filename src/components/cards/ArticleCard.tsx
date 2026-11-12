import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDate, tagSlug, type Article } from "@/lib/content";
import { cn } from "@/lib/cn";
import { washBg, washCycle } from "./washes";

/** Pastel cover with the article's first tag, since articles don't carry photos. */
export function ArticleCover({ article, className }: { article: Article; className?: string }) {
  const wash = washCycle[[...article.slug].reduce((n, ch) => n + ch.charCodeAt(0), 0) % washCycle.length];
  return (
    <div className={cn("relative flex items-end overflow-hidden p-6", washBg[wash], className)} aria-hidden>
      <svg viewBox="0 0 200 200" className="absolute -top-10 -right-10 w-[220px] text-forest" fill="none" stroke="currentColor">
        {[40, 62, 84].map((r, i) => (
          <circle key={r} cx="100" cy="100" r={r} strokeOpacity={0.16 - i * 0.04} strokeWidth="1.5" />
        ))}
        <circle cx="100" cy="100" r="18" fill="currentColor" fillOpacity="0.12" stroke="none" />
      </svg>
      <span className="relative font-display text-[28px] leading-none font-semibold text-forest italic">
        {article.tags[0] ?? "Insights"}
      </span>
    </div>
  );
}

/** News-style card: cover, title, date and reading time. */
export function ArticleCard({ article, headingLevel: H = "h2" }: { article: Article; headingLevel?: "h2" | "h3" }) {
  return (
    <article className="group relative flex h-full flex-col">
      <ArticleCover
        article={article}
        className="aspect-[16/10] rounded-[20px] transition-transform duration-700 ease-out-soft group-hover:scale-[1.01]"
      />
      <div className="flex flex-1 flex-col px-1 pt-5">
        <ul className="flex flex-wrap gap-2" aria-label="Topics">
          {article.tags.map((t) => (
            <li key={t}>
              <Link
                href={`/insights/topic/${tagSlug(t)}`}
                className="relative z-10 rounded-full bg-white px-3 py-1 font-pill text-[12.5px] font-semibold text-forest ring-1 ring-forest/15 transition-colors hover:bg-mint"
              >
                {t}
              </Link>
            </li>
          ))}
        </ul>
        <H className="mt-3 text-[20px] leading-[1.35] font-bold text-ink">
          <Link href={`/insights/${article.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {article.title}
          </Link>
        </H>
        <p className="mt-2 flex-1 text-[15px] leading-[1.55] text-ink-soft">{article.summary}</p>
        <p className="mt-4 text-[13px] font-medium text-muted">
          <time dateTime={article.date}>{formatDate(article.date)}</time> · {article.readingMinutes} min read
        </p>
        <span className="mt-2 inline-flex items-center gap-2 text-[15px] font-medium text-leaf" aria-hidden>
          Read more <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-[24px] ring-forest group-has-[h2_a:focus-visible]:ring-2 group-has-[h3_a:focus-visible]:ring-2"
      />
    </article>
  );
}
