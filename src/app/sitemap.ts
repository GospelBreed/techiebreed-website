import type { MetadataRoute } from "next";
import { collectTags, getArticles, getCaseStudies, tagSlug } from "@/lib/content";
import { site } from "@/lib/site";

/** Every public page, built from the routes and the MDX content. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => new URL(path, site.url).toString();
  const [studies, articles] = await Promise.all([getCaseStudies(), getArticles()]);

  const pages: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "monthly", priority: 1 },
    { url: url("/what-we-do"), changeFrequency: "monthly", priority: 0.9 },
    { url: url("/industries"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/our-work"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/academy"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/about"), changeFrequency: "yearly", priority: 0.6 },
    { url: url("/insights"), changeFrequency: "weekly", priority: 0.7 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.9 },
  ];

  return [
    ...pages,
    ...studies.map((c) => ({ url: url(`/our-work/${c.slug}`), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...articles.map((a) => ({
      url: url(`/insights/${a.slug}`),
      lastModified: a.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...collectTags(articles).map((t) => ({
      url: url(`/insights/topic/${tagSlug(t)}`),
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];
}
