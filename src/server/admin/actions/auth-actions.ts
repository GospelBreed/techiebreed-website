"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { logActivity } from "../activity";
import { getSessionState, loadStaffRow, requireStaff } from "../auth";
import { AdminError, bootstrapSuperAdmin, isLockedOut, MIN_PASSWORD, recordAttempt, sendPasswordReset } from "../staff";
import { serviceClient, sessionClient, supabaseConfigured } from "../supabase";

export type FormState = { error?: string; message?: string; ok?: boolean };

const email = z.email("Enter a valid email address.").transform((v) => v.trim().toLowerCase());

function safeNext(v: FormDataEntryValue | null): string {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/admin") && !s.startsWith("//") ? s : "/admin";
}

function passwordProblem(pw: string, confirm: string, mail?: string): string | null {
  if (pw.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters.`;
  if (pw !== confirm) return "The two passwords don't match.";
  if (mail && pw.toLowerCase().includes(mail.split("@")[0].toLowerCase())) return "Don't use your email name in your password.";
  if (/^(.)\1+$/.test(pw) || /^(password|1234567890|qwertyuiop)/i.test(pw)) return "That password is too easy to guess.";
  return null;
}

/* --------------------------------- sign in --------------------------------- */

export async function signInAction(_: FormState, form: FormData): Promise<FormState> {
  if (!supabaseConfigured()) return { error: "The admin isn't connected to its database yet." };
  const parsed = email.safeParse(form.get("email"));
  const password = String(form.get("password") ?? "");
  if (!parsed.success || !password) return { error: "Enter your email and password." };
  const mail = parsed.data;

  if (await isLockedOut(mail)) return { error: "Too many attempts. Wait 15 minutes, or reset your password." };

  const sb = await sessionClient();
  const { data, error } = await sb.auth.signInWithPassword({ email: mail, password });
  if (error || !data.user) {
    await recordAttempt(mail, false);
    return { error: "Email or password is incorrect." };
  }
  const row = await loadStaffRow(data.user.id);
  if (!row || row.status === "suspended") {
    await sb.auth.signOut();
    await recordAttempt(mail, false);
    return { error: "This account doesn't have access to the admin." };
  }
  await recordAttempt(mail, true);
  await serviceClient()
    .from("site_staff")
    .update({ last_sign_in: new Date().toISOString(), ...(row.status === "invited" ? { status: "active" } : {}) })
    .eq("id", row.id);

  const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") redirect(`/admin/verify?next=${encodeURIComponent(safeNext(form.get("next")))}`);
  redirect(safeNext(form.get("next")));
}

export async function verifyCodeAction(_: FormState, form: FormData): Promise<FormState> {
  const code = String(form.get("code") ?? "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code from your authenticator app." };
  const s = await getSessionState();
  if (s.state !== "needs_mfa") redirect("/admin");
  const key = `mfa:${s.staff.email}`;
  if (await isLockedOut(key)) return { error: "Too many wrong codes. Wait 15 minutes and try again." };

  const sb = await sessionClient();
  const { data: factors } = await sb.auth.mfa.listFactors();
  const factor = (factors?.totp ?? []).find((f) => f.status === "verified");
  if (!factor) redirect("/admin");
  const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (error) {
    await recordAttempt(key, false);
    return { error: "That code didn't work. Check the time on your phone and try the newest code." };
  }
  await recordAttempt(key, true);
  redirect(safeNext(form.get("next")));
}

export async function signOutAction() {
  if (supabaseConfigured()) {
    const sb = await sessionClient();
    await sb.auth.signOut();
  }
  redirect("/admin/login?signed_out=1");
}

/* ------------------------- passwords and first setup ------------------------- */

export async function forgotPasswordAction(_: FormState, form: FormData): Promise<FormState> {
  if (!supabaseConfigured()) return { error: "The admin isn't connected to its database yet." };
  const parsed = email.safeParse(form.get("email"));
  if (!parsed.success) return { error: "Enter a valid email address." };
  try {
    await sendPasswordReset(parsed.data);
  } catch (e) {
    console.error("[admin] reset email failed:", e instanceof Error ? e.message : e);
  }
  return { ok: true, message: "If that email belongs to an admin account, we've sent a link to reset the password." };
}

/** Used by both the welcome page (invited people) and the reset page. */
export async function setPasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const s = await getSessionState();
  if (s.state === "signed_out" || s.state === "not_configured") {
    return { error: "This link has expired. Ask for a new one from the sign-in page." };
  }
  if (s.state === "no_access") return { error: "This account doesn't have access to the admin." };
  const staff = s.staff;
  const password = String(form.get("password") ?? "");
  const problem = passwordProblem(password, String(form.get("confirm") ?? ""), staff.email);
  if (problem) return { error: problem };
  const fullName = String(form.get("fullName") ?? "").trim();
  if (form.has("fullName") && fullName.length < 2) return { error: "Enter your name." };

  const sb = await sessionClient();
  const { error } = await sb.auth.updateUser({ password });
  if (error) return { error: error.message.includes("different") ? "Choose a password you haven't used before." : error.message };
  await serviceClient()
    .from("site_staff")
    .update({ status: "active", ...(fullName ? { full_name: fullName } : {}), last_sign_in: new Date().toISOString() })
    .eq("id", staff.id);
  await logActivity({ id: staff.id, fullName: fullName || staff.fullName }, {
    action: form.has("fullName") ? "account.setup" : "account.password_reset",
    summary: form.has("fullName") ? "Set up their admin account" : "Reset their password",
    targetType: "account",
    targetId: staff.id,
  });
  redirect(s.state === "needs_mfa_setup" ? "/admin/account?setup=mfa" : s.state === "needs_mfa" ? "/admin/verify" : "/admin");
}

export async function bootstrapAction(): Promise<FormState> {
  if (!supabaseConfigured()) return { error: "The admin isn't connected to its database yet." };
  try {
    const mail = await bootstrapSuperAdmin();
    const [name, domain] = mail.split("@");
    return { ok: true, message: `Set-up link sent to ${name.slice(0, 2)}…@${domain}. Check that inbox.` };
  } catch (e) {
    return { error: e instanceof AdminError ? e.message : "Couldn't send the set-up link. Check the email settings." };
  }
}

/* --------------------------------- account --------------------------------- */

export async function updateProfileAction(_: FormState, form: FormData): Promise<FormState> {
  const staff = await requireStaff(undefined, { allowMfaSetup: true });
  const fullName = String(form.get("fullName") ?? "").trim();
  if (fullName.length < 2 || fullName.length > 80) return { error: "Enter your name (2–80 characters)." };
  await serviceClient().from("site_staff").update({ full_name: fullName }).eq("id", staff.id);
  return { ok: true, message: "Saved." };
}

export async function changePasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const staff = await requireStaff(undefined, { allowMfaSetup: true });
  const current = String(form.get("current") ?? "");
  const password = String(form.get("password") ?? "");
  const problem = passwordProblem(password, String(form.get("confirm") ?? ""), staff.email);
  if (problem) return { error: problem };
  const sb = await sessionClient();
  // Confirm the current password with a throwaway client so the live session isn't replaced.
  const { createClient } = await import("@supabase/supabase-js");
  const check = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: wrong } = await check.auth.signInWithPassword({ email: staff.email, password: current });
  if (wrong) return { error: "Your current password is incorrect." };
  await check.auth.signOut();
  const { error } = await sb.auth.updateUser({ password });
  if (error) return { error: error.message };
  await logActivity(staff, { action: "account.password", summary: "Changed their password", targetType: "account", targetId: staff.id });
  return { ok: true, message: "Password changed." };
}

export type EnrollState = FormState & { factorId?: string; qr?: string; secret?: string };

export async function startMfaAction(): Promise<EnrollState> {
  await requireStaff(undefined, { allowMfaSetup: true });
  const sb = await sessionClient();
  // Remove any half-finished set-up so a fresh QR code can be shown.
  const { data: factors } = await sb.auth.mfa.listFactors();
  for (const f of factors?.all ?? []) {
    if (f.status === "unverified") await sb.auth.mfa.unenroll({ factorId: f.id });
  }
  const { data, error } = await sb.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: `TechieBreed admin ${Date.now()}`,
    issuer: "TechieBreed Admin",
  });
  if (error || !data) return { error: error?.message ?? "Couldn't start set-up." };
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

export async function confirmMfaAction(_: FormState, form: FormData): Promise<FormState> {
  const staff = await requireStaff(undefined, { allowMfaSetup: true });
  const factorId = String(form.get("factorId") ?? "");
  const code = String(form.get("code") ?? "").replace(/\s+/g, "");
  if (!factorId || !/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code shown in your authenticator app." };
  const sb = await sessionClient();
  const { error } = await sb.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) return { error: "That code didn't work. Scan the QR code again or check your phone's time." };
  await logActivity(staff, { action: "account.mfa_on", summary: "Turned on the authenticator app", targetType: "account", targetId: staff.id });
  return { ok: true, message: "Authenticator app turned on. You'll be asked for a code each time you sign in." };
}

export async function removeMfaAction(): Promise<FormState> {
  const staff = await requireStaff();
  if (staff.requireMfa) return { error: "Your account requires an authenticator app, so it can't be turned off." };
  const sb = await sessionClient();
  const { data: factors } = await sb.auth.mfa.listFactors();
  for (const f of factors?.totp ?? []) {
    const { error } = await sb.auth.mfa.unenroll({ factorId: f.id });
    if (error) return { error: error.message };
  }
  await logActivity(staff, { action: "account.mfa_off", summary: "Turned off the authenticator app", targetType: "account", targetId: staff.id });
  return { ok: true, message: "Authenticator app turned off." };
}
