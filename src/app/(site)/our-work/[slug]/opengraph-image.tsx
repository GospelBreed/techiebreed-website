import { getCaseStudies, getCaseStudy } from "@/lib/content";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "TechieBreed case study";
export const size = ogSize;
export const contentType = ogContentType;

export async function generateStaticParams() {
  return (await getCaseStudies()).map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const cs = await getCaseStudy((await params).slug);
  return renderOg({ eyebrow: cs ? `Case study · ${cs.client}` : "Case study", title: cs?.title ?? "Our work" });
}
