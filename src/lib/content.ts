import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { cacheLife } from "next/cache";
import type { ServiceId } from "@/content-data/services";

/**
 * Reads the MDX content in /content at build time.
 *   content/our-work/<slug>.mdx  → case studies
 *   content/insights/<slug>.mdx  → articles
 */

const CONTENT_DIR = path.join(process.cwd(), "content");

type Raw = { slug: string; data: Record<string, unknown>; body: string };

async function readCollection(dir: string): Promise<Raw[]> {
  const full = path.join(CONTENT_DIR, dir);
  const files = (await fs.readdir(full)).filter((f) => f.endsWith(".mdx") && !f.startsWith("_"));
  return Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(full, file), "utf8");
      const { data, content } = matter(raw);
      return { slug: file.replace(/\.mdx$/, ""), data, body: content };
    }),
  );
}

function requireString(dir: string, raw: Raw, key: string): string {
  const v = raw.data[key];
  if (typeof v !== "string" || !v.trim()) throw new Error(`content/${dir}/${raw.slug}.mdx is missing "${key}"`);
  return v.trim();
}

function stringList(v: unknown): string[] {
  return Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean) : [];
}

/* ---------------- Case studies ---------------- */

export type CaseArt = "pipeline" | "operations" | "enrolment";

export type CaseStudy = {
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
  body: string;
};

function toCaseStudy(raw: Raw): CaseStudy {
  const req = (k: string) => requireString("our-work", raw, k);
  const results = Array.isArray(raw.data.results)
    ? (raw.data.results as unknown[])
        .filter((r): r is { label: unknown; value: unknown } => typeof r === "object" && r !== null)
        .map((r) => ({ label: String(r.label ?? "").trim(), value: String(r.value ?? "").trim() }))
        .filter((r) => r.label && r.value)
    : [];
  return {
    slug: raw.slug,
    title: req("title"),
    client: req("client"),
    summary: req("summary"),
    industry: req("industry"),
    order: typeof raw.data.order === "number" ? raw.data.order : 99,
    services: stringList(raw.data.services) as ServiceId[],
    art: (raw.data.art as CaseArt) ?? "operations",
    flow: stringList(raw.data.flow),
    results,
    body: raw.body,
  };
}

/** All case studies, ordered. */
export async function getCaseStudies(): Promise<CaseStudy[]> {
  "use cache";
  cacheLife("max");
  const items = (await readCollection("our-work")).map(toCaseStudy);
  return items.sort((a, b) => a.order - b.order);
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | undefined> {
  return (await getCaseStudies()).find((c) => c.slug === slug);
}

/* ---------------- Insights ---------------- */

export type Article = {
  slug: string;
  title: string;
  summary: string;
  /** ISO date, e.g. 2026-11-12 */
  date: string;
  author: string;
  tags: string[];
  readingMinutes: number;
  body: string;
};

/** Roughly 200 words a minute, never less than one minute. */
export function readingMinutes(text: string): number {
  const words = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function toArticle(raw: Raw): Article {
  const req = (k: string) => requireString("insights", raw, k);
  const date = raw.data.date instanceof Date ? raw.data.date.toISOString().slice(0, 10) : req("date");
  if (Number.isNaN(Date.parse(date))) throw new Error(`content/insights/${raw.slug}.mdx has an invalid "date"`);
  return {
    slug: raw.slug,
    title: req("title"),
    summary: req("summary"),
    date,
    author: typeof raw.data.author === "string" && raw.data.author.trim() ? raw.data.author.trim() : "TechieBreed",
    tags: stringList(raw.data.tags),
    readingMinutes: readingMinutes(raw.body),
    body: raw.body,
  };
}

/** All articles, newest first. */
export async function getArticles(): Promise<Article[]> {
  "use cache";
  cacheLife("max");
  const items = (await readCollection("insights")).map(toArticle);
  return items.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  return (await getArticles()).find((a) => a.slug === slug);
}

/** Lower-case, hyphenated tag for URLs: "Small Business" → "small-business". */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
