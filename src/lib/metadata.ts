import type { Metadata } from "next";
import { site } from "./site";

/**
 * Per-page metadata with matching Open Graph and Twitter tags and a canonical URL.
 * The page's opengraph-image.tsx supplies the share image.
 */
export function pageMeta({
  title,
  description,
  path,
  absoluteTitle,
  type = "website",
  publishedTime,
  tags,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  tags?: string[];
}): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${site.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: site.name,
      locale: "en_NG",
      url: path,
      title: fullTitle,
      description,
      ...(type === "article" ? { publishedTime, tags } : {}),
    },
    twitter: { card: "summary_large_image", title: fullTitle, description },
  };
}
