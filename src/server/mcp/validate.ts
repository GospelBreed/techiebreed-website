import "server-only";
import { compile } from "@mdx-js/mdx";
import { z } from "zod";
import { services } from "@/content-data/services";

/** Problems the connector reports back to Claude instead of saving. */
export class ToolError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugSchema = z
  .string()
  .trim()
  .min(3, "Slug must be at least 3 characters.")
  .max(80, "Slug must be 80 characters or fewer.")
  .regex(SLUG_RE, "Slug must be lower-case words joined by hyphens, e.g. how-we-automate-invoicing.");

/** Turns a title into a slug: "Five Signs You're Ready!" → "five-signs-youre-ready". */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
    .replace(/-$/, "");
}

const MAX_BODY = 60_000;

/**
 * Checks Markdown/MDX before it is committed, so a bad edit can't break the build.
 * Articles may not use components; case studies may only use <FlowDiagram /> and <Results />.
 */
export async function checkBody(body: string, allowed: string[]): Promise<void> {
  if (!body.trim()) throw new ToolError("invalid_body", "The body is empty.");
  if (body.length > MAX_BODY) throw new ToolError("invalid_body", `The body is too long (max ${MAX_BODY} characters).`);
  if (/^\s*(import|export)\s/m.test(body)) {
    throw new ToolError("invalid_body", "Import/export statements aren't allowed. Use plain Markdown.");
  }
  if (body.trimStart().startsWith("---")) {
    throw new ToolError("invalid_body", "Don't include front matter (---) in the body; pass fields separately.");
  }
  const used = [...body.matchAll(/<([A-Z][A-Za-z0-9]*)/g)].map((m) => m[1]);
  const bad = [...new Set(used.filter((c) => !allowed.includes(c)))];
  if (bad.length) {
    throw new ToolError(
      "invalid_body",
      allowed.length
        ? `Only these components can be used: ${allowed.map((a) => `<${a} />`).join(", ")}. Found: ${bad.join(", ")}.`
        : `Components aren't allowed in articles. Found: ${bad.join(", ")}. Use plain Markdown.`,
    );
  }
  if (/<script\b|<iframe\b|<style\b|\bon[a-z]+\s*=/i.test(body)) {
    throw new ToolError("invalid_body", "Scripts, iframes, styles and inline event handlers aren't allowed.");
  }
  try {
    await compile(body, { format: "mdx" });
  } catch (e) {
    const msg = e instanceof Error ? e.message.split("\n")[0] : String(e);
    throw new ToolError(
      "invalid_body",
      `The Markdown can't be published: ${msg}. Tip: write < as "less than" or escape { } with a backslash.`,
    );
  }
}

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date format YYYY-MM-DD.")
  .refine((d) => !Number.isNaN(Date.parse(d)), "That isn't a real date.");

const tag = z.string().trim().min(2).max(40);

export const articleFields = {
  title: z.string().trim().min(5).max(120),
  summary: z.string().trim().min(20).max(300),
  date: isoDate,
  author: z.string().trim().min(2).max(80),
  tags: z.array(tag).min(1).max(6),
};

const serviceIds = services.map((s) => s.id) as [string, ...string[]];

export const caseFields = {
  title: z.string().trim().min(5).max(140),
  client: z.string().trim().min(2).max(80),
  summary: z.string().trim().min(20).max(400),
  industry: z.string().trim().min(2).max(80),
  order: z.number().int().min(1).max(99),
  services: z.array(z.enum(serviceIds)).min(1).max(6),
  art: z.enum(["pipeline", "operations", "enrolment"]),
  flow: z.array(z.string().trim().min(3).max(80)).min(2).max(8),
  results: z
    .array(z.object({ label: z.string().trim().min(3).max(100), value: z.string().trim().min(1).max(20) }))
    .max(6),
};

const httpsUrl = z.string().trim().url().refine((u) => u.startsWith("https://"), "Links must start with https://");

export const settingsSchema = z.object({
  contact: z.object({
    email: z.email("Enter a valid email address."),
    phone: z.string().trim().min(7).max(30),
    phoneE164: z.string().regex(/^\+\d{8,15}$/, "phoneE164 must look like +2348165887386."),
  }),
  social: z.object({
    linkedin: z.union([httpsUrl, z.literal("")]),
    x: z.union([httpsUrl, z.literal("")]),
    instagram: z.union([httpsUrl, z.literal("")]),
  }),
  bookingUrl: httpsUrl,
  replyTime: z.string().trim().min(2).max(40),
  /** Google AdSense on public pages. Only the Super Admin changes this, in the admin. */
  ads: z.object({ enabled: z.boolean() }).default({ enabled: true }),
});

export type Settings = z.infer<typeof settingsSchema>;

/** Parses tool arguments, turning schema errors into one readable message. */
export function parseArgs<T extends z.ZodType>(schema: T, args: unknown): z.infer<T> {
  const r = schema.safeParse(args);
  if (r.success) return r.data;
  const msg = r.error.issues.map((i) => `${i.path.join(".") || "input"}: ${i.message}`).join("; ");
  throw new ToolError("invalid_arguments", msg);
}
