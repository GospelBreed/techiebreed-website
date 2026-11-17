"use client";

import { useActionState, useState, useTransition } from "react";
import {
  changePasswordAction,
  confirmMfaAction,
  removeMfaAction,
  startMfaAction,
  updateProfileAction,
  type EnrollState,
  type FormState,
} from "@/server/admin/actions/auth-actions";
import { Field, Notice, SubmitButton } from "./ui";

const initial: FormState = {};

export function ProfileForm({ fullName, email }: { fullName: string; email: string }) {
  const [state, action] = useActionState(updateProfileAction, initial);
  return (
    <form action={action} className="grid gap-4">
      <Notice kind={state.error ? "error" : "success"}>{state.error ?? state.message}</Notice>
      <Field label="Your name" name="fullName" autoComplete="name" required defaultValue={fullName} />
      <div className="flex flex-col gap-1.5">
        <span className="text-[14.5px] font-medium text-ink">Email</span>
        <p className="text-[15px] text-ink-soft">{email}</p>
      </div>
      <div>
        <SubmitButton variant="dark" pendingLabel="Saving…">
          Save
        </SubmitButton>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePasswordAction, initial);
  return (
    <form action={action} className="grid gap-4" key={state.ok ? "done" : "form"}>
      <Notice kind={state.error ? "error" : "success"}>{state.error ?? state.message}</Notice>
      <Field label="Current password" name="current" type="password" autoComplete="current-password" required />
      <Field label="New password" name="password" type="password" autoComplete="new-password" required hint="At least 10 characters." />
      <Field label="Type the new password again" name="confirm" type="password" autoComplete="new-password" required />
      <div>
        <SubmitButton variant="dark" pendingLabel="Changing…">
          Change password
        </SubmitButton>
      </div>
    </form>
  );
}

export function MfaPanel({ enabled, required }: { enabled: boolean; required: boolean }) {
  const [enroll, setEnroll] = useState<EnrollState | null>(null);
  const [starting, startTransition] = useTransition();
  const [confirmState, confirm] = useActionState(confirmMfaAction, initial);
  const [removeState, remove] = useActionState(async () => removeMfaAction(), initial);

  if (confirmState.ok) return <Notice kind="success">{confirmState.message}</Notice>;
  if (removeState.ok) return <Notice kind="success">{removeState.message}</Notice>;

  if (enabled) {
    return (
      <div className="grid gap-4">
        <Notice kind="success">Your authenticator app is on. You&rsquo;ll enter a code each time you sign in.</Notice>
        <Notice kind="error">{removeState.error}</Notice>
        {!required && (
          <form action={remove}>
            <SubmitButton variant="danger" pendingLabel="Turning off…">
              Turn off
            </SubmitButton>
          </form>
        )}
      </div>
    );
  }

  if (!enroll?.qr) {
    return (
      <div className="grid gap-4">
        <p className="text-[15px] text-ink-soft">
          After your password, you&rsquo;ll also enter a 6-digit code from an app on your phone, so a stolen password alone can&rsquo;t open your
          account. Use Google Authenticator, Microsoft Authenticator or Authy.
        </p>
        <Notice kind="error">{enroll?.error}</Notice>
        <div>
          <button
            type="button"
            disabled={starting}
            onClick={() => startTransition(async () => setEnroll(await startMfaAction()))}
            className="inline-flex h-11 items-center rounded-full bg-sprout px-5 text-[15px] font-semibold text-on-sprout hover:bg-sprout-bright disabled:opacity-70"
          >
            {starting ? "Preparing…" : "Set up authenticator app"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-[200px_1fr] md:items-start">
      <div className="rounded-[14px] border border-line bg-white p-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- Supabase returns the QR as an inline SVG data URL */}
        <img src={enroll.qr} alt="QR code to scan with your authenticator app" className="block size-full" />
      </div>
      <div className="grid gap-4">
        <ol className="list-decimal space-y-1.5 pl-5 text-[14.5px] text-ink-soft">
          <li>Open your authenticator app and add an account.</li>
          <li>Scan this QR code. If you can&rsquo;t scan, type this key instead:</li>
        </ol>
        <code className="w-fit rounded-md bg-mint px-2.5 py-1.5 font-mono text-[13.5px] break-all text-forest">{enroll.secret}</code>
        <form action={confirm} className="grid gap-3">
          <Notice kind="error">{confirmState.error}</Notice>
          <input type="hidden" name="factorId" value={enroll.factorId} />
          <Field
            label="Enter the 6-digit code the app shows"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={7}
            required
            autoFocus
          />
          <div>
            <SubmitButton pendingLabel="Checking…">Turn on</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
