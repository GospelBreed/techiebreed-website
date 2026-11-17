import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Plus } from "lucide-react";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { DiscardDraft, ReviewPanel, VisibilityToggle } from "@/components/admin/ContentControls";
import { Notice } from "@/components/admin/ui";
import type { Staff } from "@/server/admin/auth";
import {
  canEditLive,
  canPublish,
  getDraft,
  getLive,
  listDrafts,
  listLive,
  myDraftFor,
  SERVICE_OPTIONS,
  type Draft,
  type Kind,
  type LiveItem,
} from "@/server/admin/content";
import { can } from "@/server/admin/roles";
import { AdminError } from "@/server/admin/staff";
import { githubConfig } from "@/server/mcp/github";

const BASE: Record<Kind, string> = { article: "/admin/articles", case_study: "/admin/case-studies" };
const NOUN: Record<Kind, { one: string; many: string }> = {
  article: { one: "article", many: "Articles" },
  case_study: { one: "case study", many: "Case studies" },
};

function fmt(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });
}

const STATUS_BADGE: Record<string, string> = {
  live: "bg-[#eaf7ec] text-leaf",
  hidden: "bg-mint text-muted",
  draft: "bg-sky text-[#2c4a8a]",
  in_review: "bg-butter text-[#7a5a00]",
  changes_requested: "bg-blush text-[#b42318]",
};
const STATUS_TEXT: Record<string, string> = {
  live: "Live",
  hidden: "Hidden",
  draft: "Draft",
  in_review: "Waiting for review",
  changes_requested: "Changes requested",
};

function Badge({ s }: { s: string }) {
  return <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_BADGE[s]}`}>{STATUS_TEXT[s]}</span>;
}

function Header({ title, intro, action }: { title: string; intro?: string; action?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[30px] leading-tight font-semibold text-forest md:text-[36px]">{title}</h1>
        {intro && <p className="mt-1 text-[15px] text-ink-soft">{intro}</p>}
      </div>
      {action}
    </header>
  );
}

/* --------------------------------- list --------------------------------- */

export async function ContentIndex({ kind, staff, sp }: { kind: Kind; staff: Staff; sp: Record<string, string | string[] | undefined> }) {
  const base = BASE[kind];
  if (!githubConfig()) return <Notice kind="error">Content isn&rsquo;t connected: GITHUB_TOKEN and GITHUB_REPO are missing in Vercel.</Notice>;
  const [live, drafts] = await Promise.all([listLive(kind), listDrafts(staff, kind)]);

  const authorOnly = kind === "article" && !can(staff.role, "articles.edit_any");
  const visibleLive = authorOnly ? live.filter((l) => l.authorId === staff.id) : live;
  const review = drafts.filter((d) => d.status === "in_review");
  const mine = drafts.filter((d) => d.owner_id === staff.id && d.status !== "in_review");
  const others = drafts.filter((d) => d.owner_id !== staff.id && d.status !== "in_review");
  const draftBySlug = new Map(drafts.filter((d) => d.slug).map((d) => [d.slug!, d]));

  return (
    <div className="grid gap-6">
      <Header
        title={NOUN[kind].many}
        intro={
          kind === "article"
            ? authorOnly
              ? "Your blog posts. You can write, publish, edit and hide your own posts."
              : "Insights articles on the website."
            : "Case studies on the Our Work page."
        }
        action={
          <Link href={`${base}/new`} className="inline-flex h-11 items-center gap-2 rounded-full bg-sprout px-5 text-[15px] font-semibold text-on-sprout hover:bg-sprout-bright">
            <Plus aria-hidden className="size-4" /> New {NOUN[kind].one}
          </Link>
        }
      />

      {typeof sp.published === "string" && (
        <Notice kind="success">
          Published. It goes live on the website in about 2 minutes.{" "}
          <a className="font-semibold underline underline-offset-4" href={kind === "article" ? `/insights/${sp.published}` : `/our-work/${sp.published}`} target="_blank">
            Open the page
          </a>
        </Notice>
      )}
      {sp.discarded && <Notice kind="success">Draft discarded.</Notice>}
      {sp.sent_back && <Notice kind="success">Sent back to the writer with your note.</Notice>}

      {can(staff.role, "content.review") && review.length > 0 && <DraftList title={`Waiting for your review (${review.length})`} drafts={review} base={base} />}
      {mine.length > 0 && <DraftList title="Your drafts" drafts={mine} base={base} />}
      {!can(staff.role, "content.review") && review.filter((d) => d.owner_id === staff.id).length > 0 && (
        <DraftList title="Submitted for review" drafts={review.filter((d) => d.owner_id === staff.id)} base={base} />
      )}
      {others.length > 0 && <DraftList title="Team drafts" drafts={others} base={base} />}

      <section className="rounded-[18px] border border-line bg-white">
        <h2 className="px-5 pt-5 text-[16px] font-bold text-forest md:px-6">On the website ({visibleLive.length})</h2>
        {visibleLive.length === 0 ? (
          <p className="px-5 py-6 text-[14.5px] text-muted md:px-6">{authorOnly ? "You haven't published any posts yet." : "Nothing published yet."}</p>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {visibleLive.map((item) => (
              <LiveRow key={item.slug} item={item} staff={staff} base={base} pending={draftBySlug.get(item.slug)} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DraftList({ title, drafts, base }: { title: string; drafts: Draft[]; base: string }) {
  return (
    <section className="rounded-[18px] border border-line bg-white">
      <h2 className="px-5 pt-5 text-[16px] font-bold text-forest md:px-6">{title}</h2>
      <ul className="mt-2 divide-y divide-line">
        {drafts.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 md:px-6">
            <div className="min-w-0">
              <Link href={`${base}/draft/${d.id}`} className="font-semibold text-ink hover:text-leaf">
                {d.title || "Untitled"}
              </Link>
              <p className="text-[13px] text-muted">
                {d.slug ? "Changes to a live page" : "New"} · {d.owner_name} · {fmt(d.updated_at)}
              </p>
              {d.status === "changes_requested" && d.review_note && <p className="mt-1 text-[13.5px] text-[#b42318]">Reviewer: {d.review_note}</p>}
            </div>
            <Badge s={d.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function LiveRow({ item, staff, base, pending }: { item: LiveItem; staff: Staff; base: string; pending?: Draft }) {
  const editable = canEditLive(staff, item);
  const publishable = canPublish(staff, item.kind, item);
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 md:px-6">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {editable ? (
            <Link href={`${base}/edit/${item.slug}`} className="font-semibold text-ink hover:text-leaf">
              {item.title}
            </Link>
          ) : (
            <span className="font-semibold text-ink">{item.title}</span>
          )}
          <Badge s={item.hidden ? "hidden" : "live"} />
          {pending && <Badge s={pending.status} />}
        </div>
        <p className="text-[13px] text-muted">
          {item.kind === "article" ? `${item.data.date ?? ""} · ${(item.data.tags as string[] | undefined)?.join(", ") ?? ""}` : `${item.data.client ?? ""} · position ${item.data.order ?? "–"}`}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {!item.hidden && (
          <a href={item.url} target="_blank" className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-[13px] font-semibold text-leaf hover:bg-mint">
            View <ExternalLink aria-hidden className="size-3.5" />
          </a>
        )}
        {editable && (
          <Link href={`${base}/edit/${item.slug}`} className="inline-flex h-8 items-center rounded-full border border-line bg-white px-3 text-[13px] font-semibold text-forest hover:border-forest/40 hover:bg-mint">
            Edit
          </Link>
        )}
        {publishable && <VisibilityToggle kind={item.kind} slug={item.slug} hidden={item.hidden} title={item.title} />}
      </div>
    </li>
  );
}

/* -------------------------------- editor -------------------------------- */

type Mode = { type: "new" } | { type: "live"; slug: string } | { type: "draft"; id: string };

export async function EditorScreen({ kind, staff, mode }: { kind: Kind; staff: Staff; mode: Mode }) {
  const base = BASE[kind];
  if (!githubConfig()) return <Notice kind="error">Content isn&rsquo;t connected: GITHUB_TOKEN and GITHUB_REPO are missing in Vercel.</Notice>;

  let draft: Draft | null = null;
  let live: LiveItem | null = null;
  try {
    if (mode.type === "draft") {
      draft = await getDraft(staff, mode.id);
      live = draft.slug ? await getLive(kind, draft.slug) : null;
    } else if (mode.type === "live") {
      live = await getLive(kind, mode.slug);
      if (!live) notFound();
      draft = await myDraftFor(staff, kind, mode.slug);
    }
  } catch (e) {
    if (e instanceof AdminError) return <Notice kind="error">{e.message}</Notice>;
    throw e;
  }
  if (live && !canEditLive(staff, live) && !(draft && can(staff.role, "content.review"))) {
    return <Notice kind="error">You can only edit your own posts.</Notice>;
  }

  const isOwner = !draft || draft.owner_id === staff.id;
  const reviewing = draft && draft.status === "in_review" && can(staff.role, "content.review") && !isOwner;
  const publishOk = canPublish(staff, kind, live, draft?.owner_id ?? staff.id);
  const tagSuggestions =
    kind === "article" ? [...new Set((await listLive("article")).flatMap((a) => (a.data.tags as string[] | undefined) ?? []))].slice(0, 12) : undefined;

  const source = draft ?? live;
  const heading = mode.type === "new" ? `New ${NOUN[kind].one}` : draft ? `Edit draft` : `Edit ${NOUN[kind].one}`;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={base} className="text-[14px] font-medium text-leaf hover:text-forest">
            ← {NOUN[kind].many}
          </Link>
          <h1 className="mt-1 font-display text-[28px] leading-tight font-semibold text-forest md:text-[32px]">{heading}</h1>
          <p className="text-[14px] text-muted">
            {live ? (
              <>
                Editing a live page ·{" "}
                <a href={live.url} target="_blank" className="font-semibold text-leaf hover:text-forest">
                  view it
                </a>
              </>
            ) : (
              "Not on the website yet"
            )}
            {draft && ` · draft by ${draft.owner_name}, saved ${fmt(draft.updated_at)}`}
          </p>
        </div>
        {draft && <DiscardDraft id={draft.id} kind={kind} />}
      </div>

      {draft?.status === "changes_requested" && draft.review_note && <Notice kind="error">Reviewer asked for changes: {draft.review_note}</Notice>}
      {draft?.status === "in_review" && isOwner && <Notice kind="info">Submitted for review. You can keep editing; the reviewer sees your latest saved version.</Notice>}
      {reviewing && draft && <ReviewPanel id={draft.id} kind={kind} owner={draft.owner_name} />}
      {!publishOk && !reviewing && (
        <Notice kind="info">Your role saves drafts and submits them for review. An Admin publishes them to the website.</Notice>
      )}

      <ContentEditor
        key={draft?.id ?? live?.sha ?? "new"}
        kind={kind}
        draftId={draft?.id}
        slug={draft?.slug ?? live?.slug ?? null}
        baseSha={draft?.base_sha ?? live?.sha ?? null}
        title={source?.title ?? ""}
        data={source?.data ?? (kind === "article" ? { author: staff.fullName } : {})}
        body={source?.body ?? (kind === "case_study" ? CASE_TEMPLATE : "")}
        canPublish={publishOk}
        canSubmit={!publishOk && isOwner}
        isLive={Boolean(live)}
        tagSuggestions={tagSuggestions}
        serviceOptions={kind === "case_study" ? SERVICE_OPTIONS : undefined}
        video={kind === "case_study" && live?.data.video ? (live.data.video as { src: string; duration?: string }) : null}
      />
    </div>
  );
}

const CASE_TEMPLATE = `## The problem before TechieBreed

## What the business was doing manually

## What we built

## How the system works

<FlowDiagram />

## What changed

## Results

<Results />
`;
