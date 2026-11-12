import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { cacheLife } from "next/cache";
import type { ServiceId } from "@/content-data/services";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type CaseArt = "pipeline" | "operations" | "enrolment";

export type CaseStudyMeta = {
  slug: string;
  title: string;
  client: string;
  summary: string;
  order: number;
  industry: string;
  services: ServiceId[];
  art: CaseArt;
  flow: string[];
  /** Verified results only. Empty means "Results being measured". */
  results: { label: string; value: string }[];
};

export type CaseStudy = CaseStudyMeta & { body: string };

async function readCollection(dir: string) {
  const full = path.join(CONTENT_DIR, dir);
  const files = (await fs.readdir(full)).filter((f) => f.endsWith(".mdx"));
  return Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(full, file), "utf8");
      const { data, content } = matter(raw);
      return { slug: file.replace(/\.mdx$/, ""), data, body: content };
    }),
  );
}

function toCaseStudy({ slug, data, body }: { slug: string; data: Record<string, unknown>; body: string }): CaseStudy {
  const req = (key: string) => {
    const v = data[key];
    if (typeof v !== "string" || !v.trim()) throw new Error(`content/our-work/${slug}.mdx is missing "${key}"`);
    return v;
  };
  return {
    slug,
    title: req("title"),
    client: req("client"),
    summary: req("summary"),
    industry: req("industry"),
    order: typeof data.order === "number" ? data.order : 99,
    services: Array.isArray(data.services) ? (data.services as ServiceId[]) : [],
    art: (data.art as CaseArt) ?? "operations",
    flow: Array.isArray(data.flow) ? data.flow.map(String) : [],
    results: Array.isArray(data.results) ? (data.results as CaseStudy["results"]) : [],
    body,
  };
}

/** All case studies, ordered. Read once at build time. */
export async function getCaseStudies(): Promise<CaseStudy[]> {
  "use cache";
  cacheLife("max");
  const items = (await readCollection("our-work")).map(toCaseStudy);
  return items.sort((a, b) => a.order - b.order);
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | undefined> {
  return (await getCaseStudies()).find((c) => c.slug === slug);
}
