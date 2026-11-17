import "server-only";
import { z } from "zod";
import { services } from "@/content-data/services";
import { commitDetails, listFolder, readFile, readFileAt, writeFile, type CommitAuthor } from "@/server/mcp/github";
import { ARTICLES, CASES, cfg, dateString, liveUrl, parseEntry, serialise, today } from "@/server/mcp/tools";
import { articleFields, caseFields, checkBody, slugify, slugSchema } from "@/server/mcp/validate";
import { logActivity } from "./activity";
import type { Staff } from "./auth";
import { can } from "./roles";
import { AdminError } from "./staff";
import { serviceClient } from "./supabase";

/**
 * Articles and case studies for the admin.
 *   Live items  → files in GitHub (what the website shows).
 *   Drafts      → rows in site_content_drafts (nothing changes on the site until publish).
 */

export type Kind = "article" | "case_study";
export const KIND_LABEL: Record<Kind, string> = { article: "article", case_study: "case study" };
const folder = (k: Kind) => (k === "article" ? ARTICLES : CASES);
const pagePath = (k: Kind, slug: string) => (k === "article" ? `/insights/${slug}` : `/our-work/${slug}`);

export type LiveItem = {
  kind: Kind;
  slug: string;
  sha: string;
  title: string;
  data: Record<string, unknown>;
  body: string;
  hidden: boolean;
  authorId: string | null;
  url: string;
};

export type Draft = {
  id: string;
  kind: Kind;
  slug: string | null;
  base_sha: string | null;
  title: string;
  data: Record<string, unknown>;
  body: string;
  owner_id: string | null;
  owner_name: string;
  status: "draft" | "in_review" | "changes_requested";
  review_note: string | null;
  submitted_at: string | null;
  updated_at: string;
};

const author = (s: Staff): CommitAuthor => ({ name: s.fullName });

/* ------------------------------- permissions ------------------------------- */

function canEditKind(s: Staff, k: Kind) {
  return k === "article" ? can(s.role, "articles.edit_any") || can(s.role, "articles.edit_own") : can(s.role, "cases.edit");
}

/** May this person open/edit this live item (start a draft from it)? */
export function canEditLive(s: Staff, item: Pick<LiveItem, "kind" | "authorId">) {
  if (item.kind === "case_study") return can(s.role, "cases.edit");
  if (can(s.role, "articles.edit_any")) return true;
  return can(s.role, "articles.edit_own") && item.authorId === s.id;
}

/** May this person publish (or hide) this item directly? */
export function canPublish(s: Staff, kind: Kind, live: Pick<LiveItem, "authorId"> | null, draftOwnerId?: string | null) {
  if (kind === "case_study") return can(s.role, "cases.publish");
  if (can(s.role, "articles.publish_any")) return true;
  if (!can(s.role, "articles.publish_own")) return false;
  const ownsLive = live ? live.authorId === s.id : true;
  const ownsDraft = draftOwnerId === undefined || draftOwnerId === null || draftOwnerId === s.id;
  return ownsLive && ownsDraft;
}

export function canSeeDraft(s: Staff, d: Pick<Draft, "kind" | "owner_id" | "status">) {
  if (d.owner_id === s.id) return true;
  if (can(s.role, "content.review") && d.status !== "draft") return true;
  if (d.kind === "article") return can(s.role, "articles.edit_any") || can(s.role, "content.review");
  return can(s.role, "cases.edit");
}

/* ---------------------------------- live ---------------------------------- */

function toLive(kind: Kind, slug: string, sha: string, content: string): LiveItem {
  const { data, body } = parseEntry({ path: "", sha, content });
  return {
    kind,
    slug,
    sha,
    title: String(data.title ?? slug),
    data: { ...data, date: dateString(data.date) },
    body,
    hidden: data.draft === true,
    authorId: typeof data.authorId === "string" ? data.authorId : null,
    url: liveUrl(pagePath(kind, slug)),
  };
}

export async function listLive(kind: Kind): Promise<LiveItem[]> {
  const c = cfg();
  const files = (await listFolder(c, folder(kind))).filter((f) => f.name.endsWith(".mdx") && !f.name.startsWith("_"));
  const items = await Promise.all(
    files.map(async (f) => {
      const file = await readFile(c, `${folder(kind)}/${f.name}`);
      return file ? toLive(kind, f.name.replace(/\.mdx$/, ""), file.sha, file.content) : null;
    }),
  );
  const list = items.filter((x): x is LiveItem => x !== null);
  return kind === "article"
    ? list.sort((a, b) => String(b.data.date ?? "").localeCompare(String(a.data.date ?? "")))
    : list.sort((a, b) => Number(a.data.order ?? 99) - Number(b.data.order ?? 99));
}

export async function getLive(kind: Kind, slug: string): Promise<LiveItem | null> {
  if (!slugSchema.safeParse(slug).success) return null;
  const file = await readFile(cfg(), `${folder(kind)}/${slug}.mdx`);
  return file ? toLive(kind, slug, file.sha, file.content) : null;
}

/* --------------------------------- drafts --------------------------------- */

const DRAFT_COLS = "id,kind,slug,base_sha,title,data,body,owner_id,owner_name,status,review_note,submitted_at,updated_at";

export async function listDrafts(s: Staff, kind: Kind): Promise<Draft[]> {
  const { data, error } = await serviceClient()
    .from("site_content_drafts")
    .select(DRAFT_COLS)
    .eq("kind", kind)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Draft[]).filter((d) => canSeeDraft(s, d));
}

export async function getDraft(s: Staff, id: string): Promise<Draft> {
  if (!z.uuid().safeParse(id).success) throw new AdminError("That draft wasn't found.");
  const { data } = await serviceClient().from("site_content_drafts").select(DRAFT_COLS).eq("id", id).maybeSingle();
  if (!data) throw new AdminError("That draft wasn't found. It may have been published or discarded.");
  const d = data as Draft;
  if (!canSeeDraft(s, d)) throw new AdminError("You don't have access to that draft.");
  return d;
}

/** The current person's open draft for a live item, if they have one. */
export async function myDraftFor(s: Staff, kind: Kind, slug: string): Promise<Draft | null> {
  const { data } = await serviceClient()
    .from("site_content_drafts")
    .select(DRAFT_COLS)
    .eq("kind", kind)
    .eq("slug", slug)
    .eq("owner_id", s.id)
    .maybeSingle();
  return (data as Draft) ?? null;
}

export type DraftInput = {
  id?: string;
  kind: Kind;
  slug?: string | null;
  baseSha?: string | null;
  title: string;
  data: Record<string, unknown>;
  body: string;
};

export async function saveDraft(s: Staff, input: DraftInput): Promise<Draft> {
  if (!canEditKind(s, input.kind)) throw new AdminError("Your role can't edit this.");
  if (input.title.trim().length < 3) throw new AdminError("Give it a title first.");
  if (input.body.length > 60_000) throw new AdminError("The text is too long (max 60,000 characters).");
  const sb = serviceClient();

  if (input.slug) {
    const live = await getLive(input.kind, input.slug);
    if (live && !canEditLive(s, live)) throw new AdminError("You can only edit your own posts.");
  }

  const row = {
    kind: input.kind,
    slug: input.slug || null,
    base_sha: input.baseSha || null,
    title: input.title.trim(),
    data: input.data,
    body: input.body,
    updated_by: s.id,
  };

  if (input.id) {
    const existing = await getDraft(s, input.id);
    const reviewerEditing = existing.owner_id !== s.id && can(s.role, "content.review");
    if (existing.owner_id !== s.id && !reviewerEditing) throw new AdminError("Only the person who wrote this draft can change it.");
    const { data, error } = await sb
      .from("site_content_drafts")
      .update({ ...row, base_sha: existing.base_sha ?? row.base_sha, status: existing.status === "changes_requested" ? "draft" : existing.status })
      .eq("id", input.id)
      .select(DRAFT_COLS)
      .single();
    if (error) throw new AdminError(error.message);
    return data as Draft;
  }

  if (input.slug) {
    const mine = await myDraftFor(s, input.kind, input.slug);
    if (mine) return saveDraft(s, { ...input, id: mine.id });
  }
  const { data, error } = await sb
    .from("site_content_drafts")
    .insert({ ...row, owner_id: s.id, owner_name: s.fullName })
    .select(DRAFT_COLS)
    .single();
  if (error) throw new AdminError(error.message);
  await logActivity(s, {
    action: `${input.kind}.draft`,
    summary: `Started a draft of the ${KIND_LABEL[input.kind]} "${row.title}"`,
    targetType: input.kind,
    targetId: input.slug ?? undefined,
  });
  return data as Draft;
}

export async function submitForReview(s: Staff, id: string) {
  const d = await getDraft(s, id);
  if (d.owner_id !== s.id) throw new AdminError("Only the person who wrote this draft can submit it.");
  await validateForPublish(d.kind, d, null);
  const { error } = await serviceClient()
    .from("site_content_drafts")
    .update({ status: "in_review", submitted_at: new Date().toISOString(), review_note: null })
    .eq("id", id);
  if (error) throw new AdminError(error.message);
  await logActivity(s, { action: `${d.kind}.submit`, summary: `Submitted "${d.title}" for review`, targetType: d.kind, targetId: d.slug ?? undefined });
}

export async function requestChanges(s: Staff, id: string, note: string) {
  if (!can(s.role, "content.review")) throw new AdminError("Your role can't review drafts.");
  const d = await getDraft(s, id);
  if (note.trim().length < 3) throw new AdminError("Add a short note so the writer knows what to change.");
  const { error } = await serviceClient()
    .from("site_content_drafts")
    .update({ status: "changes_requested", review_note: note.trim().slice(0, 1000) })
    .eq("id", id);
  if (error) throw new AdminError(error.message);
  await logActivity(s, { action: `${d.kind}.changes_requested`, summary: `Asked ${d.owner_name} for changes to "${d.title}"`, targetType: d.kind, targetId: d.slug ?? undefined });
}

export async function discardDraft(s: Staff, id: string) {
  const d = await getDraft(s, id);
  if (d.owner_id !== s.id && !can(s.role, "content.review")) throw new AdminError("Only the writer or a reviewer can discard this draft.");
  const { error } = await serviceClient().from("site_content_drafts").delete().eq("id", id);
  if (error) throw new AdminError(error.message);
  await logActivity(s, { action: `${d.kind}.discard`, summary: `Discarded the draft "${d.title}"`, targetType: d.kind, targetId: d.slug ?? undefined });
}

/* -------------------------------- publishing -------------------------------- */

const articleData = z.object({
  summary: articleFields.summary,
  tags: articleFields.tags,
  date: articleFields.date,
  author: articleFields.author,
});

const caseData = z.object({
  client: caseFields.client,
  summary: caseFields.summary,
  industry: caseFields.industry,
  services: caseFields.services,
  flow: caseFields.flow,
  results: caseFields.results,
  order: caseFields.order,
});

function issues(e: z.ZodError) {
  return e.issues.map((i) => `${String(i.path[0] ?? "field")}: ${i.message}`).join("; ");
}

/** Checks a draft is complete and safe to publish; returns the front matter to write. */
async function validateForPublish(kind: Kind, d: Pick<Draft, "title" | "data" | "body">, live: LiveItem | null) {
  const title = (kind === "article" ? articleFields.title : caseFields.title).safeParse(d.title);
  if (!title.success) throw new AdminError(`Title: ${title.error.issues[0].message}`);
  try {
    await checkBody(d.body, kind === "article" ? [] : ["FlowDiagram", "Results"]);
  } catch (e) {
    throw new AdminError(e instanceof Error ? e.message : "The text can't be published.");
  }
  if (kind === "article") {
    const r = articleData.safeParse({ date: today(), author: "TechieBreed team", ...d.data });
    if (!r.success) throw new AdminError(`Please check: ${issues(r.error)}`);
    return { title: title.data, ...r.data };
  }
  const r = caseData.safeParse({
    results: [],
    ...d.data,
    order: d.data.order === undefined || d.data.order === "" ? Number(live?.data.order ?? 99) : Number(d.data.order),
  });
  if (!r.success) throw new AdminError(`Please check: ${issues(r.error)}`);
  return { title: title.data, ...r.data };
}

export type PublishResult = { slug: string; commit: string; url: string };

export async function publishDraft(s: Staff, id: string, opts: { force?: boolean } = {}): Promise<PublishResult> {
  const d = await getDraft(s, id);
  const live = d.slug ? await getLive(d.kind, d.slug) : null;
  if (!canPublish(s, d.kind, live, d.owner_id)) {
    throw new AdminError(
      d.kind === "article" && can(s.role, "articles.publish_own")
        ? "You can only publish your own posts."
        : "Your role can't publish. Submit it for review instead.",
    );
  }
  if (live && d.base_sha && live.sha !== d.base_sha && !opts.force) {
    throw new AdminError("STALE: The live version changed after this draft was started.");
  }
  const fields = await validateForPublish(d.kind, d, live);

  let slug = d.slug;
  if (!slug) {
    slug = slugify(d.kind === "article" ? d.title : String(d.data.client ?? d.title));
    if (!slugSchema.safeParse(slug).success) throw new AdminError("Couldn't make a web address from the title. Use a longer title.");
    if (await getLive(d.kind, slug)) throw new AdminError(`Something is already published at …/${slug}. Change the title slightly.`);
  }

  // Keep fields the editor doesn't manage (video, art, authorId, hidden state).
  const keep = live ? { ...live.data } : {};
  delete keep.draft;
  const frontMatter: Record<string, unknown> = { ...keep, ...fields };
  if (d.kind === "article") frontMatter.authorId = live?.authorId ?? d.owner_id ?? s.id;
  if (d.kind === "case_study" && !frontMatter.art) frontMatter.art = "operations";

  const path = `${folder(d.kind)}/${slug}.mdx`;
  const r = await writeFile(
    cfg(),
    path,
    serialise(frontMatter, d.body),
    `Admin: ${live ? "update" : "publish"} ${KIND_LABEL[d.kind]} "${fields.title}" (${s.fullName})`,
    live?.sha,
    author(s),
  );
  await serviceClient().from("site_content_drafts").delete().eq("id", id);
  await logActivity(s, {
    action: `${d.kind}.publish`,
    summary: `${live ? "Published changes to" : "Published"} the ${KIND_LABEL[d.kind]} "${fields.title}"${d.owner_id && d.owner_id !== s.id ? ` by ${d.owner_name}` : ""}`,
    targetType: d.kind,
    targetId: slug,
    commitSha: r.commit,
    details: { path },
  });
  return { slug, commit: r.commit, url: liveUrl(pagePath(d.kind, slug)) };
}

export async function setVisibility(s: Staff, kind: Kind, slug: string, published: boolean) {
  const c = cfg();
  const path = `${folder(kind)}/${slug}.mdx`;
  const file = await readFile(c, path);
  if (!file) throw new AdminError("That item wasn't found.");
  const live = toLive(kind, slug, file.sha, file.content);
  if (!canPublish(s, kind, live)) throw new AdminError("Your role can't hide or show this.");
  if (live.hidden === !published) return null;
  const { data, body } = parseEntry(file);
  const next: Record<string, unknown> = { ...data, date: dateString(data.date) };
  if (published) delete next.draft;
  else next.draft = true;
  const r = await writeFile(c, path, serialise(next, body), `Admin: ${published ? "show" : "hide"} ${KIND_LABEL[kind]} "${live.title}" (${s.fullName})`, file.sha, author(s));
  await logActivity(s, {
    action: `${kind}.${published ? "show" : "hide"}`,
    summary: `${published ? "Showed" : "Hid"} the ${KIND_LABEL[kind]} "${live.title}"`,
    targetType: kind,
    targetId: slug,
    commitSha: r.commit,
    details: { path },
  });
  return r.commit;
}

/* ---------------------------------- undo ---------------------------------- */

/**
 * Undoes a published change: puts the file back the way it was before that commit.
 * If the commit created the file, the item is hidden instead (nothing is deleted).
 */
export async function undoChange(s: Staff, sha: string) {
  if (!can(s.role, "activity.undo")) throw new AdminError("Only the Super Admin can undo changes.");
  if (!/^[0-9a-f]{7,40}$/.test(sha)) throw new AdminError("That change wasn't found.");
  const c = cfg();
  const info = await commitDetails(c, sha);
  const files = info.files.filter((f) => f.filename.startsWith("content/"));
  if (files.length !== 1 || info.files.length !== 1) {
    throw new AdminError("This change touched more than one file or wasn't a content change, so it can't be undone here.");
  }
  const path = files[0].filename;
  const current = await readFile(c, path);
  if (!current) throw new AdminError("That file no longer exists.");
  const before = info.parent ? await readFileAt(c, path, info.parent) : null;

  let content: string;
  let note: string;
  if (before === null) {
    if (!path.endsWith(".mdx")) throw new AdminError("This change can't be undone here.");
    const { data, body } = parseEntry(current);
    content = serialise({ ...data, date: dateString(data.date), draft: true }, body);
    note = "hid the new item it created";
  } else {
    content = before;
    note = "restored the previous version";
  }
  if (content === current.content) throw new AdminError("The file already matches the earlier version.");
  const r = await writeFile(c, path, content, `Admin: undo ${sha.slice(0, 7)} — ${note} (${s.fullName})`, current.sha, author(s));
  await logActivity(s, {
    action: "change.undo",
    summary: `Undid "${info.message.split("\n")[0]}" (${note})`,
    targetType: path.startsWith(CASES) ? "case_study" : path.startsWith(ARTICLES) ? "article" : "settings",
    targetId: path,
    commitSha: r.commit,
    details: { undone: sha, path },
  });
  return { commit: r.commit, note };
}

export const SERVICE_OPTIONS = services.map((x) => ({ id: x.id, label: x.short }));
