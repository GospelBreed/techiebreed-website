import "server-only";
import matter from "gray-matter";
import { z } from "zod";
import { site } from "@/lib/site";
import { services } from "@/content-data/services";
import {
  githubConfig,
  listFolder,
  readFile,
  recentCommits,
  writeFile,
  type RepoFile,
} from "./github";
import {
  articleFields,
  caseFields,
  checkBody,
  parseArgs,
  settingsSchema,
  slugify,
  slugSchema,
  ToolError,
} from "./validate";

/* ------------------------------------------------------------------ */
/* Tool catalogue (what Claude sees)                                   */
/* ------------------------------------------------------------------ */

type JsonSchema = Record<string, unknown>;
type Tool = {
  name: string;
  title: string;
  description: string;
  inputSchema: JsonSchema;
  annotations: { readOnlyHint?: boolean; destructiveHint?: boolean; idempotentHint?: boolean; openWorldHint?: boolean };
};

const obj = (properties: Record<string, JsonSchema>, required: string[] = []): JsonSchema => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
});
const str = (description: string, extra: JsonSchema = {}): JsonSchema => ({ type: "string", description, ...extra });
const strList = (description: string): JsonSchema => ({ type: "array", items: { type: "string" }, description });
const slugProp = str("The page's slug (its address), e.g. what-happens-in-an-ai-operations-audit.");
const READ = { readOnlyHint: true, openWorldHint: false };
const WRITE = { readOnlyHint: false, destructiveHint: false, openWorldHint: false };

const serviceIds = services.map((s) => s.id);

const PUBLISH_NOTE =
  "Changes are saved to GitHub and go live in about 2 minutes. Call get_publish_status to confirm before telling the user it's live.";

export const TOOLS: Tool[] = [
  {
    name: "get_site_overview",
    title: "Site overview",
    description:
      "Start here. Summarises the TechieBreed website (www.techiebreed.org): pages, articles and case studies with their status, current contact settings, recent changes and whether the latest change is live.",
    inputSchema: obj({}),
    annotations: READ,
  },
  {
    name: "list_articles",
    title: "List articles",
    description: "Lists every Insights article (published and hidden) with title, date, tags, summary and address.",
    inputSchema: obj({}),
    annotations: READ,
  },
  {
    name: "get_article",
    title: "Read an article",
    description: "Returns one Insights article: all its fields and the full Markdown body. Read before editing.",
    inputSchema: obj({ slug: slugProp }, ["slug"]),
    annotations: READ,
  },
  {
    name: "create_article",
    title: "Publish a new article",
    description: `Creates and publishes a new Insights article at /insights/<slug>. Body is plain Markdown (## headings, lists, **bold**, [links](/contact#audit), > quotes) — no components, scripts or front matter. Write in TechieBreed's voice: plain, benefit-led, no hype, and never invent statistics, client names or results. Set draft: true to save it hidden. ${PUBLISH_NOTE}`,
    inputSchema: obj(
      {
        title: str("Headline, 5–120 characters."),
        summary: str("One or two sentences (20–300 characters) shown on cards, in search results and social shares."),
        body: str("The article in Markdown."),
        tags: strList("1–6 topics, e.g. [\"Automation\", \"Small business\"]. Reuse existing tags where they fit."),
        date: str("Publication date YYYY-MM-DD. Defaults to today."),
        author: str("Byline. Defaults to \"TechieBreed team\"."),
        slug: str("Optional address. Defaults to one made from the title."),
        draft: { type: "boolean", description: "true saves it hidden from the site. Default false." },
      },
      ["title", "summary", "body", "tags"],
    ),
    annotations: WRITE,
  },
  {
    name: "update_article",
    title: "Edit an article",
    description: `Updates an existing article. Pass only the fields to change; body replaces the whole Markdown body (read it first with get_article and keep what shouldn't change). ${PUBLISH_NOTE}`,
    inputSchema: obj(
      {
        slug: slugProp,
        title: str("New headline."),
        summary: str("New summary."),
        body: str("New full Markdown body."),
        tags: strList("New list of topics."),
        date: str("New date YYYY-MM-DD."),
        author: str("New byline."),
      },
      ["slug"],
    ),
    annotations: { ...WRITE, idempotentHint: true },
  },
  {
    name: "set_article_visibility",
    title: "Hide or show an article",
    description: `Hides an article from the website (published: false) or shows it again (published: true). Nothing is deleted. ${PUBLISH_NOTE}`,
    inputSchema: obj({ slug: slugProp, published: { type: "boolean" } }, ["slug", "published"]),
    annotations: { ...WRITE, idempotentHint: true },
  },
  {
    name: "list_case_studies",
    title: "List case studies",
    description: "Lists every Our Work case study with client, title, order, services, whether it has a video, and status.",
    inputSchema: obj({}),
    annotations: READ,
  },
  {
    name: "get_case_study",
    title: "Read a case study",
    description: "Returns one case study: all its fields (including video, flow steps and results) and the full Markdown body.",
    inputSchema: obj({ slug: slugProp }, ["slug"]),
    annotations: READ,
  },
  {
    name: "create_case_study",
    title: "Add a case study",
    description: `Adds a case study at /our-work/<slug> (without a video; videos are added by a developer). The body should use these sections in order: "## The problem before TechieBreed", "## What the business was doing manually", "## What we built", "## How the system works" followed by <FlowDiagram />, "## What changed", "## Results" followed by <Results />. Only <FlowDiagram /> and <Results /> may be used. Results must be verified figures only — leave results empty to show "Results being measured". ${PUBLISH_NOTE}`,
    inputSchema: obj(
      {
        title: str("Headline."),
        client: str("Client name."),
        summary: str("Card and search summary, 20–400 characters."),
        industry: str("e.g. Real estate & property."),
        services: { type: "array", items: { type: "string", enum: serviceIds }, description: "Which TechieBreed services it shows." },
        flow: strList("2–8 short steps for the 'How the system works' diagram."),
        body: str("Full Markdown body with the sections above."),
        results: {
          type: "array",
          items: obj({ label: str("What was measured."), value: str("The verified figure, e.g. 12 hrs.") }, ["label", "value"]),
          description: "Verified results only. Omit or [] for 'Results being measured'.",
        },
        order: { type: "integer", description: "Position on Our Work (1 = first). Defaults to last." },
        art: str("Card illustration when there's no video.", { enum: ["pipeline", "operations", "enrolment"] }),
        slug: str("Optional address. Defaults to one made from the client name."),
        draft: { type: "boolean", description: "true saves it hidden. Default false." },
      },
      ["title", "client", "summary", "industry", "services", "flow", "body"],
    ),
    annotations: WRITE,
  },
  {
    name: "update_case_study",
    title: "Edit a case study",
    description: `Updates an existing case study. Pass only the fields to change. The video is kept as it is. Results must be verified figures only. ${PUBLISH_NOTE}`,
    inputSchema: obj(
      {
        slug: slugProp,
        title: str("New headline."),
        client: str("New client name."),
        summary: str("New summary."),
        industry: str("New industry."),
        services: { type: "array", items: { type: "string", enum: serviceIds } },
        flow: strList("New flow steps."),
        results: {
          type: "array",
          items: obj({ label: { type: "string" }, value: { type: "string" } }, ["label", "value"]),
          description: "Replaces all results. [] shows 'Results being measured'.",
        },
        order: { type: "integer" },
        body: str("New full Markdown body."),
      },
      ["slug"],
    ),
    annotations: { ...WRITE, idempotentHint: true },
  },
  {
    name: "set_case_study_visibility",
    title: "Hide or show a case study",
    description: `Hides a case study from the website (published: false) or shows it again. Nothing is deleted. ${PUBLISH_NOTE}`,
    inputSchema: obj({ slug: slugProp, published: { type: "boolean" } }, ["slug", "published"]),
    annotations: { ...WRITE, idempotentHint: true },
  },
  {
    name: "get_site_settings",
    title: "Read site settings",
    description:
      "Returns the public contact email, phone, social links, Cal.com booking link and the reply time shown after an enquiry.",
    inputSchema: obj({}),
    annotations: READ,
  },
  {
    name: "update_site_settings",
    title: "Change site settings",
    description: `Changes any of: contact.email, contact.phone (as displayed), contact.phoneE164 (e.g. +2348165887386, used for tap-to-call), social.linkedin / social.x / social.instagram ("" hides the icon), bookingUrl (Cal.com link) and replyTime (e.g. "1 hour"). Pass only what changes. ${PUBLISH_NOTE}`,
    inputSchema: obj({
      contact: obj({ email: { type: "string" }, phone: { type: "string" }, phoneE164: { type: "string" } }),
      social: obj({ linkedin: { type: "string" }, x: { type: "string" }, instagram: { type: "string" } }),
      bookingUrl: { type: "string" },
      replyTime: { type: "string" },
    }),
    annotations: { ...WRITE, idempotentHint: true },
  },
  {
    name: "get_publish_status",
    title: "Is it live yet?",
    description:
      "Compares the latest saved change (or a given commit) with the version running on www.techiebreed.org and says whether it's live or still deploying.",
    inputSchema: obj({ commit: str("Optional commit id returned by a write tool.") }),
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  {
    name: "list_recent_changes",
    title: "Recent changes",
    description: "Lists recent changes to the website (newest first) with who made them and when.",
    inputSchema: obj({ limit: { type: "integer", minimum: 1, maximum: 30, description: "Default 10." } }),
    annotations: READ,
  },
  {
    name: "check_page",
    title: "Check a live page",
    description:
      "Fetches a page on www.techiebreed.org and returns its status, title, description, main heading, word count and a text excerpt. Use it to verify a change is live or to read current copy.",
    inputSchema: obj({ path: str("Path on the site, e.g. / or /insights/my-article.") }, ["path"]),
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const ARTICLES = "content/insights";
const CASES = "content/our-work";
const SETTINGS = "content/settings.json";

function cfg() {
  const c = githubConfig();
  if (!c) throw new ToolError("not_configured", "The connector isn't set up: GITHUB_TOKEN and GITHUB_REPO are missing.");
  return c;
}

function today() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
}

function liveUrl(path: string) {
  return new URL(path, site.url).toString();
}

function parseEntry(file: RepoFile) {
  const { data, content } = matter(file.content);
  return { data: data as Record<string, unknown>, body: content.replace(/^\n+/, "") };
}

function serialise(data: Record<string, unknown>, body: string) {
  const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
  return matter.stringify(`\n${body.trim()}\n`, clean);
}

function dateString(v: unknown): string | undefined {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return typeof v === "string" ? v : undefined;
}

async function mustRead(path: string, kind: string, slug: string) {
  const f = await readFile(cfg(), path);
  if (!f) throw new ToolError("not_found", `There's no ${kind} with the slug "${slug}".`);
  return f;
}

function written(r: { commit: string; url: string }, page: string, extra: Record<string, unknown> = {}) {
  return {
    ok: true,
    ...extra,
    page: liveUrl(page),
    commit: r.commit,
    commit_url: r.url,
    note: "Saved. It goes live in about 2 minutes — call get_publish_status with this commit to confirm.",
  };
}

/* ------------------------------------------------------------------ */
/* Handlers                                                            */
/* ------------------------------------------------------------------ */

async function listArticles() {
  const c = cfg();
  const files = (await listFolder(c, ARTICLES)).filter((f) => f.name.endsWith(".mdx"));
  const items = await Promise.all(
    files.map(async (f) => {
      const file = await readFile(c, `${ARTICLES}/${f.name}`);
      if (!file) return null;
      const { data } = parseEntry(file);
      const slug = f.name.replace(/\.mdx$/, "");
      const hidden = data.draft === true || f.name.startsWith("_");
      return {
        slug,
        title: data.title,
        date: dateString(data.date),
        tags: data.tags,
        summary: data.summary,
        status: hidden ? "hidden" : "published",
        url: hidden ? null : liveUrl(`/insights/${slug}`),
      };
    }),
  );
  return items.filter(Boolean).sort((a, b) => String(b!.date).localeCompare(String(a!.date)));
}

async function listCases() {
  const c = cfg();
  const files = (await listFolder(c, CASES)).filter((f) => f.name.endsWith(".mdx"));
  const items = await Promise.all(
    files.map(async (f) => {
      const file = await readFile(c, `${CASES}/${f.name}`);
      if (!file) return null;
      const { data } = parseEntry(file);
      const slug = f.name.replace(/\.mdx$/, "");
      const hidden = data.draft === true || f.name.startsWith("_");
      return {
        slug,
        client: data.client,
        title: data.title,
        order: data.order,
        services: data.services,
        has_video: Boolean(data.video),
        results: Array.isArray(data.results) && data.results.length ? data.results : "Results being measured",
        status: hidden ? "hidden" : "published",
        url: hidden ? null : liveUrl(`/our-work/${slug}`),
      };
    }),
  );
  return items.filter(Boolean).sort((a, b) => Number(a!.order ?? 99) - Number(b!.order ?? 99));
}

async function readSettings() {
  const f = await readFile(cfg(), SETTINGS);
  if (!f) throw new ToolError("not_found", "content/settings.json is missing.");
  return { file: f, settings: settingsSchema.parse(JSON.parse(f.content)) };
}

async function publishStatus(commit?: string) {
  const c = cfg();
  const head = (await recentCommits(c, 1))[0];
  const target = commit?.trim() || head?.sha;
  let live: string | null = null;
  try {
    const res = await fetch(liveUrl("/api/version"), { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    live = ((await res.json()) as { commit: string | null }).commit;
  } catch {
    /* site unreachable */
  }
  if (!live) {
    return { live: false, state: "unknown", message: "Couldn't read the live version from the website.", target };
  }
  if (live === target) return { live: true, state: "live", live_commit: live, message: "The change is live." };
  // Is the live build newer than the target (i.e. it includes it)?
  const recent = await recentCommits(c, 30);
  const liveIdx = recent.findIndex((x) => x.sha === live);
  const targetIdx = recent.findIndex((x) => x.sha === target);
  if (liveIdx !== -1 && targetIdx !== -1 && liveIdx < targetIdx) {
    return { live: true, state: "live", live_commit: live, message: "Live (a newer change has also been published)." };
  }
  return {
    live: false,
    state: "deploying",
    live_commit: live,
    target_commit: target,
    message:
      "Not live yet — Vercel is usually still building (about 2 minutes). If it's still not live after 10 minutes, the build may have failed; check Vercel → Deployments.",
  };
}

async function checkPage(path: string) {
  if (!/^\/[A-Za-z0-9\-._~/%#?=&]*$/.test(path) || path.startsWith("//")) {
    throw new ToolError("invalid_arguments", "path must be a path on the site, starting with /.");
  }
  const url = liveUrl(path);
  const res = await fetch(url, { cache: "no-store", redirect: "follow", signal: AbortSignal.timeout(15_000) });
  const html = await res.text();
  const decode = (s: string) =>
    s
      .replace(/&#x27;|&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  const pick = (re: RegExp) => {
    const m = html.match(re)?.[1];
    return m ? decode(m.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()) : null;
  };
  const text = decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
  return {
    url,
    status: res.status,
    title: pick(/<title>([^<]*)<\/title>/i),
    description: pick(/<meta name="description" content="([^"]*)"/i),
    h1: pick(/<h1[^>]*>([\s\S]*?)<\/h1>/i),
    words: text ? text.split(" ").length : 0,
    excerpt: text.slice(0, 1500),
  };
}

/* ------------------------------------------------------------------ */
/* Dispatcher                                                          */
/* ------------------------------------------------------------------ */

const slugOnly = z.object({ slug: slugSchema });

export async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "get_site_overview": {
      const [articles, cases, settings, changes, status] = await Promise.all([
        listArticles(),
        listCases(),
        readSettings().then((s) => s.settings),
        recentCommits(cfg(), 5),
        publishStatus(),
      ]);
      return {
        site: site.url,
        pages: ["/", "/what-we-do", "/industries", "/our-work", "/academy", "/about", "/insights", "/contact"],
        editable: "Insights articles, Our Work case studies and site settings. Other page copy and design need a developer.",
        articles: { published: articles.filter((a) => a!.status === "published").length, hidden: articles.filter((a) => a!.status === "hidden").length, items: articles },
        case_studies: cases,
        settings,
        recent_changes: changes,
        publish_status: status,
      };
    }

    case "list_articles":
      return { articles: await listArticles() };

    case "get_article": {
      const { slug } = parseArgs(slugOnly, args);
      const f = await mustRead(`${ARTICLES}/${slug}.mdx`, "article", slug);
      const { data, body } = parseEntry(f);
      return {
        slug,
        ...data,
        date: dateString(data.date),
        status: data.draft === true ? "hidden" : "published",
        url: liveUrl(`/insights/${slug}`),
        body,
      };
    }

    case "create_article": {
      const a = parseArgs(
        z.object({
          title: articleFields.title,
          summary: articleFields.summary,
          body: z.string(),
          tags: articleFields.tags,
          date: articleFields.date.optional(),
          author: articleFields.author.optional(),
          slug: slugSchema.optional(),
          draft: z.boolean().optional(),
        }),
        args,
      );
      const slug = a.slug ?? slugify(a.title);
      slugSchema.parse(slug);
      await checkBody(a.body, []);
      const path = `${ARTICLES}/${slug}.mdx`;
      if (await readFile(cfg(), path)) {
        throw new ToolError("already_exists", `An article with the slug "${slug}" already exists. Use update_article or pass a different slug.`);
      }
      const data = {
        title: a.title,
        summary: a.summary,
        date: a.date ?? today(),
        author: a.author ?? "TechieBreed team",
        tags: a.tags,
        ...(a.draft ? { draft: true } : {}),
      };
      const r = await writeFile(cfg(), path, serialise(data, a.body), `Website connector: ${a.draft ? "draft" : "publish"} article "${a.title}"`);
      return written(r, `/insights/${slug}`, { slug, status: a.draft ? "hidden" : "published" });
    }

    case "update_article": {
      const a = parseArgs(
        z.object({
          slug: slugSchema,
          title: articleFields.title.optional(),
          summary: articleFields.summary.optional(),
          body: z.string().optional(),
          tags: articleFields.tags.optional(),
          date: articleFields.date.optional(),
          author: articleFields.author.optional(),
        }),
        args,
      );
      const path = `${ARTICLES}/${a.slug}.mdx`;
      const f = await mustRead(path, "article", a.slug);
      const { data, body } = parseEntry(f);
      if (a.body !== undefined) await checkBody(a.body, []);
      const next = {
        ...data,
        date: dateString(data.date),
        ...(a.title ? { title: a.title } : {}),
        ...(a.summary ? { summary: a.summary } : {}),
        ...(a.tags ? { tags: a.tags } : {}),
        ...(a.date ? { date: a.date } : {}),
        ...(a.author ? { author: a.author } : {}),
      };
      const changed = Object.keys(a).filter((k) => k !== "slug");
      if (!changed.length) throw new ToolError("nothing_to_change", "Pass at least one field to change.");
      const r = await writeFile(cfg(), path, serialise(next, a.body ?? body), `Website connector: edit article "${next.title}" (${changed.join(", ")})`, f.sha);
      return written(r, `/insights/${a.slug}`, { slug: a.slug, changed });
    }

    case "set_article_visibility":
    case "set_case_study_visibility": {
      const isArticle = name === "set_article_visibility";
      const a = parseArgs(z.object({ slug: slugSchema, published: z.boolean() }), args);
      const path = `${isArticle ? ARTICLES : CASES}/${a.slug}.mdx`;
      const f = await mustRead(path, isArticle ? "article" : "case study", a.slug);
      const { data, body } = parseEntry(f);
      const next: Record<string, unknown> = { ...data, date: dateString(data.date) };
      if (a.published) delete next.draft;
      else next.draft = true;
      if ((data.draft === true) === !a.published) {
        return { ok: true, unchanged: true, status: a.published ? "published" : "hidden" };
      }
      const r = await writeFile(cfg(), path, serialise(next, body), `Website connector: ${a.published ? "show" : "hide"} ${isArticle ? "article" : "case study"} "${data.title}"`, f.sha);
      return written(r, a.published ? `/${isArticle ? "insights" : "our-work"}/${a.slug}` : `/${isArticle ? "insights" : "our-work"}`, {
        slug: a.slug,
        status: a.published ? "published" : "hidden",
      });
    }

    case "list_case_studies":
      return { case_studies: await listCases() };

    case "get_case_study": {
      const { slug } = parseArgs(slugOnly, args);
      const f = await mustRead(`${CASES}/${slug}.mdx`, "case study", slug);
      const { data, body } = parseEntry(f);
      return { slug, ...data, status: data.draft === true ? "hidden" : "published", url: liveUrl(`/our-work/${slug}`), body };
    }

    case "create_case_study": {
      const a = parseArgs(
        z.object({
          title: caseFields.title,
          client: caseFields.client,
          summary: caseFields.summary,
          industry: caseFields.industry,
          services: caseFields.services,
          flow: caseFields.flow,
          body: z.string(),
          results: caseFields.results.optional(),
          order: caseFields.order.optional(),
          art: caseFields.art.optional(),
          slug: slugSchema.optional(),
          draft: z.boolean().optional(),
        }),
        args,
      );
      await checkBody(a.body, ["FlowDiagram", "Results"]);
      const slug = a.slug ?? slugify(a.client);
      slugSchema.parse(slug);
      const path = `${CASES}/${slug}.mdx`;
      if (await readFile(cfg(), path)) {
        throw new ToolError("already_exists", `A case study with the slug "${slug}" already exists. Use update_case_study or pass a different slug.`);
      }
      const order = a.order ?? (await listCases()).reduce((m, c) => Math.max(m, Number(c!.order ?? 0)), 0) + 1;
      const data = {
        title: a.title,
        client: a.client,
        summary: a.summary,
        order,
        industry: a.industry,
        services: a.services,
        art: a.art ?? "operations",
        flow: a.flow,
        results: a.results ?? [],
        ...(a.draft ? { draft: true } : {}),
      };
      const r = await writeFile(cfg(), path, serialise(data, a.body), `Website connector: ${a.draft ? "draft" : "add"} case study "${a.client}"`);
      return written(r, `/our-work/${slug}`, { slug, status: a.draft ? "hidden" : "published" });
    }

    case "update_case_study": {
      const a = parseArgs(
        z.object({
          slug: slugSchema,
          title: caseFields.title.optional(),
          client: caseFields.client.optional(),
          summary: caseFields.summary.optional(),
          industry: caseFields.industry.optional(),
          services: caseFields.services.optional(),
          flow: caseFields.flow.optional(),
          results: caseFields.results.optional(),
          order: caseFields.order.optional(),
          body: z.string().optional(),
        }),
        args,
      );
      const path = `${CASES}/${a.slug}.mdx`;
      const f = await mustRead(path, "case study", a.slug);
      const { data, body } = parseEntry(f);
      if (a.body !== undefined) await checkBody(a.body, ["FlowDiagram", "Results"]);
      const fields = Object.fromEntries(
        Object.entries(a).filter(([k, v]) => k !== "slug" && k !== "body" && v !== undefined),
      );
      const changed = Object.keys(a).filter((k) => k !== "slug");
      if (!changed.length) throw new ToolError("nothing_to_change", "Pass at least one field to change.");
      const next = { ...data, ...fields };
      const r = await writeFile(cfg(), path, serialise(next, a.body ?? body), `Website connector: edit case study "${next.client}" (${changed.join(", ")})`, f.sha);
      return written(r, `/our-work/${a.slug}`, { slug: a.slug, changed });
    }

    case "get_site_settings":
      return (await readSettings()).settings;

    case "update_site_settings": {
      const patch = parseArgs(
        z
          .object({
            contact: z.object({ email: z.string(), phone: z.string(), phoneE164: z.string() }).partial().strict().optional(),
            social: z.object({ linkedin: z.string(), x: z.string(), instagram: z.string() }).partial().strict().optional(),
            bookingUrl: z.string().optional(),
            replyTime: z.string().optional(),
          })
          .strict(),
        args,
      );
      const { file, settings } = await readSettings();
      const merged = {
        ...settings,
        ...(patch.bookingUrl !== undefined ? { bookingUrl: patch.bookingUrl } : {}),
        ...(patch.replyTime !== undefined ? { replyTime: patch.replyTime } : {}),
        contact: { ...settings.contact, ...(patch.contact ?? {}) },
        social: { ...settings.social, ...(patch.social ?? {}) },
      };
      const valid = parseArgs(settingsSchema, merged);
      if (JSON.stringify(valid) === JSON.stringify(settings)) return { ok: true, unchanged: true, settings };
      const r = await writeFile(cfg(), SETTINGS, `${JSON.stringify(valid, null, 2)}\n`, "Website connector: update site settings", file.sha);
      return written(r, "/contact", { settings: valid });
    }

    case "get_publish_status": {
      const a = parseArgs(z.object({ commit: z.string().regex(/^[0-9a-f]{7,40}$/).optional() }), args);
      return publishStatus(a.commit);
    }

    case "list_recent_changes": {
      const a = parseArgs(z.object({ limit: z.number().int().min(1).max(30).optional() }), args);
      return { changes: await recentCommits(cfg(), a.limit ?? 10) };
    }

    case "check_page": {
      const a = parseArgs(z.object({ path: z.string().min(1).max(300) }), args);
      return checkPage(a.path);
    }

    default:
      throw new ToolError("unknown_tool", `There's no tool called "${name}".`);
  }
}
