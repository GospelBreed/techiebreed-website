"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  bootstrapAction,
  forgotPasswordAction,
  setPasswordAction,
  signInAction,
  verifyCodeAction,
  type FormState,
} from "@/server/admin/actions/auth-actions";
import { Field, Notice, SubmitButton } from "./ui";

const initial: FormState = {};

export function LoginForm({ next, notice }: { next?: string; notice?: { kind: "error" | "success"; text: string } }) {
  const [state, action] = useActionState(signInAction, initial);
  return (
    <form action={action} className="grid gap-4">
      {notice && !state.error && <Notice kind={notice.kind}>{notice.text}</Notice>}
      <Notice kind="error">{state.error}</Notice>
      <input type="hidden" name="next" value={next ?? "/admin"} />
      <Field label="Email" name="email" type="email" autoComplete="username" required autoFocus />
      <Field label="Password" name="password" type="password" autoComplete="current-password" required />
      <SubmitButton pendingLabel="Signing in…" className="mt-1 w-full">
        Sign in
      </SubmitButton>
      <Link href="/admin/forgot-password" className="text-center text-[14px] font-medium text-leaf hover:text-forest">
        Forgot your password?
      </Link>
    </form>
  );
}

export function VerifyForm({ next }: { next?: string }) {
  const [state, action] = useActionState(verifyCodeAction, initial);
  return (
    <form action={action} className="grid gap-4">
      <Notice kind="error">{state.error}</Notice>
      <input type="hidden" name="next" value={next ?? "/admin"} />
      <Field
        label="6-digit code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9 ]{6,7}"
        maxLength={7}
        required
        autoFocus
        hint="Open Google Authenticator, Microsoft Authenticator or Authy and enter the code for TechieBreed Admin."
      />
      <SubmitButton pendingLabel="Checking…" className="w-full">
        Continue
      </SubmitButton>
    </form>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(forgotPasswordAction, initial);
  if (state.ok) return <Notice kind="success">{state.message}</Notice>;
  return (
    <form action={action} className="grid gap-4">
      <Notice kind="error">{state.error}</Notice>
      <Field label="Email" name="email" type="email" autoComplete="username" required autoFocus />
      <SubmitButton pendingLabel="Sending…" className="w-full">
        Send reset link
      </SubmitButton>
    </form>
  );
}

export function SetPasswordForm({ askName, defaultName }: { askName?: boolean; defaultName?: string }) {
  const [state, action] = useActionState(setPasswordAction, initial);
  return (
    <form action={action} className="grid gap-4">
      <Notice kind="error">{state.error}</Notice>
      {askName && <Field label="Your name" name="fullName" autoComplete="name" required defaultValue={defaultName} autoFocus />}
      <Field
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="At least 10 characters. A short phrase is easiest to remember."
      />
      <Field label="Type it again" name="confirm" type="password" autoComplete="new-password" required />
      <SubmitButton pendingLabel="Saving…" className="w-full">
        {askName ? "Finish set-up" : "Save new password"}
      </SubmitButton>
    </form>
  );
}

export function BootstrapForm() {
  const [state, action] = useActionState(async () => bootstrapAction(), initial);
  if (state.ok) return <Notice kind="success">{state.message}</Notice>;
  return (
    <form action={action} className="grid gap-4">
      <Notice kind="error">{state.error}</Notice>
      <SubmitButton pendingLabel="Sending…" className="w-full">
        Email me the set-up link
      </SubmitButton>
    </form>
  );
}
