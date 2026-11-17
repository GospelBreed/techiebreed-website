"use client";

import { useActionState } from "react";
import { inviteAction, staffCommandAction } from "@/server/admin/actions/staff-actions";
import type { FormState } from "@/server/admin/actions/auth-actions";
import { ASSIGNABLE_ROLES, ROLE_LABEL, ROLE_SUMMARY, type Role } from "@/server/admin/roles";
import { Field, Notice, SubmitButton } from "./ui";

const initial: FormState = {};

export function InviteForm() {
  const [state, action] = useActionState(inviteAction, initial);
  return (
    <form action={action} className="grid gap-4" key={state.ok ? state.message : "invite"}>
      <Notice kind={state.error ? "error" : "success"}>{state.error ?? state.message}</Notice>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full name" name="fullName" autoComplete="off" required />
        <Field label="Email" name="email" type="email" autoComplete="off" required />
      </div>
      <fieldset>
        <legend className="mb-2 text-[14.5px] font-medium text-ink">Role</legend>
        <div className="grid gap-2 md:grid-cols-2">
          {ASSIGNABLE_ROLES.map((r, i) => (
            <label
              key={r}
              className="flex cursor-pointer gap-3 rounded-[12px] border border-line bg-white p-3 hover:border-forest/40 has-[:checked]:border-forest has-[:checked]:bg-mint"
            >
              <input type="radio" name="role" value={r} defaultChecked={i === 1} className="mt-1 accent-[var(--color-forest)]" />
              <span>
                <span className="block text-[14.5px] font-semibold text-forest">{ROLE_LABEL[r]}</span>
                <span className="block text-[13px] leading-snug text-muted">{ROLE_SUMMARY[r]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <SubmitButton pendingLabel="Sending invite…">Send invitation</SubmitButton>
      </div>
    </form>
  );
}

export function StaffActions({
  id,
  name,
  role,
  status,
  requireMfa,
  mfaEnabled,
}: {
  id: string;
  name: string;
  role: Role;
  status: "invited" | "active" | "suspended";
  requireMfa: boolean;
  mfaEnabled: boolean;
}) {
  const [state, action] = useActionState(staffCommandAction, initial);
  const btn = "rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-forest hover:border-forest/40 hover:bg-mint";
  return (
    <div className="grid gap-2">
      <Notice kind={state.error ? "error" : "success"}>{state.error ?? state.message}</Notice>
      <div className="flex flex-wrap items-center gap-2">
        {status !== "suspended" && (
          <form action={action} className="flex items-center gap-1.5">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="command" value="role" />
            <label className="sr-only" htmlFor={`role-${id}`}>
              Role for {name}
            </label>
            <select
              id={`role-${id}`}
              name="role"
              defaultValue={role}
              className="h-8 rounded-full border border-line bg-white px-2.5 text-[13px] text-ink"
            >
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
            <button className={btn}>Change</button>
          </form>
        )}
        <form action={action} className="contents">
          <input type="hidden" name="id" value={id} />
          {status === "invited" && (
            <button name="command" value="resend" className={btn}>
              Resend invite
            </button>
          )}
          <button name="command" value={requireMfa ? "optional_mfa" : "require_mfa"} className={btn}>
            {requireMfa ? "Make app optional" : "Require authenticator"}
          </button>
          {mfaEnabled && (
            <button name="command" value="reset_mfa" className={btn}>
              Reset authenticator
            </button>
          )}
          {status === "suspended" ? (
            <button name="command" value="reactivate" className={btn}>
              Restore access
            </button>
          ) : (
            <button
              name="command"
              value="suspend"
              className="rounded-full border border-[#f3c2bf] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#b42318] hover:bg-blush"
              onClick={(e) => {
                if (!confirm(`Suspend ${name}? They'll be signed out and can't sign in until you restore access.`)) e.preventDefault();
              }}
            >
              Suspend
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
