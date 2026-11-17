"use client";

import { useActionState, useState } from "react";
import {
  discardAction,
  reviewAction,
  undoAction,
  visibilityAction,
  type ContentState,
} from "@/server/admin/actions/content-actions";
import { Notice, SubmitButton } from "./ui";

const initial: ContentState = {};

/** For Admins looking at a submitted draft: publish it or send it back with a note. */
export function ReviewPanel({ id, kind, owner }: { id: string; kind: "article" | "case_study"; owner: string }) {
  const [state, action] = useActionState(reviewAction, initial);
  const [note, setNote] = useState("");
  return (
    <form action={action} className="grid gap-3 rounded-[16px] border border-[#f5d77a] bg-butter p-5">
      <p className="text-[15px] font-semibold text-pine">{owner} submitted this for review.</p>
      <Notice kind={state.error ? "error" : "success"}>{state.error ?? state.message}</Notice>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="kind" value={kind} />
      <label htmlFor="review-note" className="text-[14px] font-medium text-ink">
        Note for the writer <span className="font-normal text-muted">(needed when asking for changes)</span>
      </label>
      <textarea
        id="review-note"
        name="note"
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="rounded-[10px] border border-line bg-white px-3 py-2 text-[15px]"
      />
      <div className="flex flex-wrap gap-2">
        <SubmitButton name="intent" value="approve" pendingLabel="Publishing…">
          Approve &amp; publish
        </SubmitButton>
        <SubmitButton name="intent" value="changes" variant="secondary" pendingLabel="Sending…">
          Ask for changes
        </SubmitButton>
        {state.stale && (
          <SubmitButton name="intent" value="approve_force" variant="danger" pendingLabel="Publishing…">
            Publish anyway (replace the live version)
          </SubmitButton>
        )}
      </div>
    </form>
  );
}

export function DiscardDraft({ id, kind }: { id: string; kind: "article" | "case_study" }) {
  const [state, action] = useActionState(discardAction, initial);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Discard this draft? The live website isn't affected.")) e.preventDefault();
      }}
      className="grid gap-2"
    >
      <Notice kind="error">{state.error}</Notice>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="kind" value={kind} />
      <SubmitButton variant="danger" pendingLabel="Discarding…" className="h-9 px-4 text-[13.5px]">
        Discard draft
      </SubmitButton>
    </form>
  );
}

export function VisibilityToggle({ kind, slug, hidden, title }: { kind: "article" | "case_study"; slug: string; hidden: boolean; title: string }) {
  const [state, action] = useActionState(visibilityAction, initial);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!hidden && !confirm(`Hide "${title}" from the website? You can show it again any time.`)) e.preventDefault();
      }}
      className="grid gap-1"
    >
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="published" value={hidden ? "true" : "false"} />
      <SubmitButton variant="secondary" pendingLabel="Saving…" className="h-8 px-3 text-[13px]">
        {hidden ? "Show on website" : "Hide"}
      </SubmitButton>
      {(state.error || state.message) && (
        <span className={state.error ? "text-[12.5px] text-[#b42318]" : "text-[12.5px] text-leaf"}>{state.error ?? state.message}</span>
      )}
    </form>
  );
}

export function UndoButton({ sha, label }: { sha: string; label: string }) {
  const [state, action] = useActionState(undoAction, initial);
  if (state.ok) return <span className="text-[12.5px] font-semibold text-leaf">{state.message}</span>;
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Undo "${label}"? The previous version goes back on the website.`)) e.preventDefault();
      }}
      className="grid gap-1"
    >
      <input type="hidden" name="sha" value={sha} />
      <SubmitButton variant="secondary" pendingLabel="Undoing…" className="h-8 px-3 text-[13px]">
        Undo
      </SubmitButton>
      {state.error && <span className="max-w-[260px] text-[12.5px] text-[#b42318]">{state.error}</span>}
    </form>
  );
}
