"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "../auth";
import {
  discardDraft,
  publishDraft,
  requestChanges,
  saveDraft,
  setVisibility,
  submitForReview,
  undoChange,
  type Kind,
} from "../content";
import { AdminError } from "../staff";
import { GitHubError } from "@/server/mcp/github";

export type ContentState = {
  ok?: boolean;
  error?: string;
  message?: string;
  draftId?: string;
  stale?: boolean;
  url?: string;
};

const kindSchema = z.enum(["article", "case_study"]);
const listPath = (k: Kind) => (k === "article" ? "/admin/articles" : "/admin/case-studies");

function fail(e: unknown): ContentState {
  unstable_rethrow(e); // let redirect() through
  if (e instanceof AdminError) {
    if (e.message.startsWith("STALE:")) return { error: e.message.slice(6).trim(), stale: true };
    return { error: e.message };
  }
  if (e instanceof GitHubError) {
    if (e.status === 409) return { error: "Someone changed this on the live site a moment ago. Reload and try again.", stale: true };
    return { error: "Couldn't reach GitHub to publish. Try again in a minute." };
  }
  console.error("[admin] content action failed:", e instanceof Error ? e.message : e);
  return { error: "Something went wrong. Your work hasn't been lost — try again." };
}

const payloadSchema = z.object({
  id: z.string().optional(),
  kind: kindSchema,
  slug: z.string().nullable().optional(),
  baseSha: z.string().nullable().optional(),
  title: z.string().max(200),
  data: z.record(z.string(), z.unknown()),
  body: z.string().max(60_000),
});

function readPayload(form: FormData) {
  try {
    return payloadSchema.parse(JSON.parse(String(form.get("payload") ?? "{}")));
  } catch {
    throw new AdminError("The form couldn't be read. Reload the page and try again.");
  }
}

/** Save (and optionally then submit or publish) — the editor's buttons all go through here. */
export async function editorAction(_: ContentState, form: FormData): Promise<ContentState> {
  const staff = await requireStaff();
  const intent = String(form.get("intent") ?? "save");
  let draftId: string | undefined;
  try {
    const p = readPayload(form);
    const draft = await saveDraft(staff, p);
    draftId = draft.id;
    if (intent === "submit") {
      await submitForReview(staff, draft.id);
      revalidatePath(listPath(p.kind));
      return { ok: true, draftId, message: "Submitted for review. An Admin will publish it or send it back with a note." };
    }
    if (intent === "publish" || intent === "publish_force") {
      const r = await publishDraft(staff, draft.id, { force: intent === "publish_force" });
      revalidatePath(listPath(p.kind));
      redirect(`${listPath(p.kind)}?published=${encodeURIComponent(r.slug)}&commit=${r.commit}`);
    }
    return { ok: true, draftId, message: "Draft saved. Nothing has changed on the website yet." };
  } catch (e) {
    return { ...fail(e), draftId };
  }
}

export async function reviewAction(_: ContentState, form: FormData): Promise<ContentState> {
  const staff = await requireStaff("content.review");
  const id = String(form.get("id") ?? "");
  const kind = kindSchema.catch("article").parse(form.get("kind"));
  try {
    if (form.get("intent") === "changes") {
      await requestChanges(staff, id, String(form.get("note") ?? ""));
      revalidatePath(listPath(kind));
      redirect(`${listPath(kind)}?sent_back=1`);
    }
    const r = await publishDraft(staff, id, { force: form.get("intent") === "approve_force" });
    revalidatePath(listPath(kind));
    redirect(`${listPath(kind)}?published=${encodeURIComponent(r.slug)}&commit=${r.commit}`);
  } catch (e) {
    return fail(e);
  }
}

export async function discardAction(_: ContentState, form: FormData): Promise<ContentState> {
  const staff = await requireStaff();
  const kind = kindSchema.catch("article").parse(form.get("kind"));
  try {
    await discardDraft(staff, String(form.get("id") ?? ""));
  } catch (e) {
    return fail(e);
  }
  revalidatePath(listPath(kind));
  redirect(`${listPath(kind)}?discarded=1`);
}

export async function visibilityAction(_: ContentState, form: FormData): Promise<ContentState> {
  const staff = await requireStaff();
  const kind = kindSchema.catch("article").parse(form.get("kind"));
  const published = form.get("published") === "true";
  try {
    const commit = await setVisibility(staff, kind, String(form.get("slug") ?? ""), published);
    revalidatePath(listPath(kind));
    return {
      ok: true,
      message: commit ? `${published ? "Shown" : "Hidden"}. The website updates in about 2 minutes.` : "Already done.",
    };
  } catch (e) {
    return fail(e);
  }
}

export async function undoAction(_: ContentState, form: FormData): Promise<ContentState> {
  const staff = await requireStaff("activity.undo");
  try {
    const r = await undoChange(staff, String(form.get("sha") ?? ""));
    revalidatePath("/admin/activity");
    return { ok: true, message: `Undone — ${r.note}. The website updates in about 2 minutes.` };
  } catch (e) {
    return fail(e);
  }
}
