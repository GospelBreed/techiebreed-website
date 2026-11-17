"use client";

import { useActionState, useEffect, useRef } from "react";
import { deleteEnquiryAction, enquiryAction, type EnquiryState } from "@/server/admin/actions/enquiry-actions";
import { Notice, SubmitButton } from "./ui";

const initial: EnquiryState = {};
const selectCls =
  "h-11 w-full rounded-[10px] border border-line bg-white px-3 text-[15px] text-ink hover:border-forest/40 focus:border-forest focus:shadow-[0_0_0_3px_rgb(45_189_50/0.25)] focus:outline-none";

type Option = { value: string; label: string };

/** Status and assignment, side by side. */
export function EnquiryManage({
  id,
  status,
  statuses,
  assignee,
  handlers,
}: {
  id: string;
  status: string;
  statuses: Option[];
  assignee: string | null;
  handlers: { id: string; name: string }[];
}) {
  const [state, action] = useActionState(enquiryAction, initial);
  return (
    <div className="grid gap-3">
      <Notice kind={state.error ? "error" : "success"}>{state.error ?? state.message}</Notice>
      <form action={action} className="grid gap-1.5">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="intent" value="status" />
        <label htmlFor="enq-status" className="text-[14px] font-medium text-ink">
          Status
        </label>
        <div className="flex gap-2">
          <select id="enq-status" name="status" defaultValue={status} key={status} className={selectCls}>
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <SubmitButton variant="secondary" pendingLabel="Saving…" className="shrink-0">
            Save
          </SubmitButton>
        </div>
      </form>
      <form action={action} className="grid gap-1.5">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="intent" value="assign" />
        <label htmlFor="enq-assignee" className="text-[14px] font-medium text-ink">
          Handled by
        </label>
        <div className="flex gap-2">
          <select id="enq-assignee" name="assignee" defaultValue={assignee ?? ""} key={assignee ?? ""} className={selectCls}>
            <option value="">Nobody yet</option>
            {handlers.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
          <SubmitButton variant="secondary" pendingLabel="Saving…" className="shrink-0">
            Save
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}

/** One-click "Mark as replied" next to the reply button. */
export function MarkReplied({ id }: { id: string }) {
  const [state, action] = useActionState(enquiryAction, initial);
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="intent" value="status" />
      <input type="hidden" name="status" value="replied" />
      <SubmitButton variant="secondary" pendingLabel="Saving…">
        Mark as replied
      </SubmitButton>
      {state.error && <Notice kind="error">{state.error}</Notice>}
    </form>
  );
}

export function NoteForm({ id }: { id: string }) {
  const [state, action] = useActionState(enquiryAction, initial);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="grid gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="intent" value="note" />
      <label htmlFor="enq-note" className="text-[14px] font-medium text-ink">
        Add a note <span className="font-normal text-muted">— only the team sees notes</span>
      </label>
      <textarea id="enq-note" name="note" rows={3} maxLength={4000} required className="rounded-[10px] border border-line bg-white px-3 py-2 text-[15px] focus:border-forest focus:outline-none" />
      <Notice kind={state.error ? "error" : "success"}>{state.error ?? state.message}</Notice>
      <div>
        <SubmitButton variant="dark" pendingLabel="Adding…">
          Add note
        </SubmitButton>
      </div>
    </form>
  );
}

export function DeleteEnquiry({ id, name }: { id: string; name: string }) {
  const [state, action] = useActionState(deleteEnquiryAction, initial);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Delete the enquiry from ${name} and its notes for good? This can't be undone.`)) e.preventDefault();
      }}
      className="grid gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton variant="danger" pendingLabel="Deleting…">
        Delete enquiry
      </SubmitButton>
      {state.error && <Notice kind="error">{state.error}</Notice>}
    </form>
  );
}
