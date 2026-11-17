import { getArticle, getArticles } from "@/lib/content";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "TechieBreed Insights article";
export const size = ogSize;
export const contentType = ogContentType;

export async function generateStaticParams() {
  return (await getArticles()).map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const article = await getArticle((await params).slug);
  return renderOg({
    eyebrow: article ? `Insights · ${article.tags[0] ?? "Article"}` : "Insights",
    title: article?.title ?? "Practical ideas for smarter operations",
  });
}
