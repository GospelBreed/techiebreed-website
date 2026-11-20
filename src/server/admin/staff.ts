import "server-only";
import { headers } from "next/headers";
import { site } from "@/lib/site";
import { logActivity } from "./activity";
import type { Staff } from "./auth";
import { sendAdminEmail } from "./mail";
import { ROLE_LABEL, type Role } from "./roles";
import { serviceClient } from "./supabase";

/** Thrown with a message that can be shown to the person using the admin. */
export class AdminError extends Error {}

export const MIN_PASSWORD = 10;
const LOCK_AFTER = 5;
const LOCK_MINUTES = 15;

/**
 * Origin for links in invite and reset emails. In production it is always the
 * site's own address — never taken from request headers, which a caller could
 * set to send someone a reset link pointing at another site. Locally it follows
 * the address the dev server was reached on.
 */
export async function appOrigin(): Promise<string> {
  if (process.env.NODE_ENV === "production") return new URL(site.url).origin;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.techiebreed.org";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/* ------------------------------ sign-in lockout ------------------------------ */

export async function isLockedOut(email: string): Promise<boolean> {
  const since = new Date(Date.now() - LOCK_MINUTES * 60_000).toISOString();
  const { data } = await serviceClient()
    .from("site_login_attempts")
    .select("success")
    .ilike("email", email)
    .gte("at", since)
    .order("at", { ascending: false })
    .limit(LOCK_AFTER);
  const rows = data ?? [];
  return rows.length >= LOCK_AFTER && rows.every((r) => !r.success);
}

export async function recordAttempt(email: string, success: boolean) {
  await serviceClient().from("site_login_attempts").insert({ email: email.toLowerCase(), ip: await clientIp(), success });
}

/* --------------------------------- emails --------------------------------- */

type LinkType = "invite" | "recovery";

/**
 * Creates a one-time sign-in link without Supabase sending its own email.
 * For "invite", a user is created if they don't exist yet.
 */
async function oneTimeLink(type: LinkType, email: string, next: string): Promise<{ url: string; userId: string }> {
  const sb = serviceClient();
  let res = await sb.auth.admin.generateLink({ type, email });
  if (res.error && type === "invite" && /already.*(registered|exists)/i.test(res.error.message)) {
    // Person already has an account in this Supabase project (e.g. a shared project): send a reset link instead.
    res = await sb.auth.admin.generateLink({ type: "recovery", email });
    type = "recovery";
  }
  if (res.error || !res.data) throw new AdminError(`Couldn't create the link: ${res.error?.message ?? "unknown error"}`);
  const origin = await appOrigin();
  const q = new URLSearchParams({ token_hash: res.data.properties.hashed_token, type, next });
  return { url: `${origin}/admin/auth/confirm?${q}`, userId: res.data.user.id };
}

async function sendInviteEmail(email: string, name: string, role: Role, url: string, inviter: string) {
  await sendAdminEmail({
    to: email,
    subject: "You've been invited to the TechieBreed website admin",
    heading: `Hi ${name.split(" ")[0] || "there"}, you've been invited`,
    lines: [
      `${inviter} has given you ${ROLE_LABEL[role]} access to the TechieBreed website admin.`,
      "Click the button to choose your password and sign in. The link works once and expires in 24 hours.",
    ],
    button: { label: "Set up my account", url },
    footnote: "If you weren't expecting this, you can ignore this email.",
  });
}

/* ------------------------------- staff admin ------------------------------- */

export type StaffListItem = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  status: Staff["status"];
  require_mfa: boolean;
  last_sign_in: string | null;
  created_at: string;
  mfa_enabled: boolean;
};

export async function listStaff(): Promise<StaffListItem[]> {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("site_staff")
    .select("id,email,full_name,role,status,require_mfa,last_sign_in,created_at")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Omit<StaffListItem, "mfa_enabled">[];
  const withMfa = await Promise.all(
    rows.map(async (r) => {
      const f = await sb.auth.admin.mfa.listFactors({ userId: r.id });
      const mfa_enabled = (f.data?.factors ?? []).some((x) => x.factor_type === "totp" && x.status === "verified");
      return { ...r, mfa_enabled };
    }),
  );
  return withMfa;
}

export async function superAdminExists(): Promise<boolean> {
  const { count } = await serviceClient()
    .from("site_staff")
    .select("id", { count: "exact", head: true })
    .eq("role", "super_admin");
  return (count ?? 0) > 0;
}

/** First-time setup: invites SUPER_ADMIN_EMAIL as the Super Admin. Only works while none exists. */
export async function bootstrapSuperAdmin(): Promise<string> {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) throw new AdminError("SUPER_ADMIN_EMAIL isn't set in the environment.");
  if (await superAdminExists()) throw new AdminError("A Super Admin already exists. Sign in instead.");
  const { url, userId } = await oneTimeLink("invite", email, "/admin/welcome");
  const { error } = await serviceClient()
    .from("site_staff")
    .upsert({ id: userId, email, full_name: "", role: "super_admin", status: "invited", require_mfa: false });
  if (error) throw new AdminError(error.message);
  await sendInviteEmail(email, "", "super_admin", url, "TechieBreed");
  await logActivity(null, { action: "staff.bootstrap", summary: `Super Admin set-up link sent to ${email}`, targetType: "staff", targetId: userId });
  return email;
}

export async function inviteStaff(actor: Staff, input: { email: string; fullName: string; role: Role }) {
  if (input.role === "super_admin") throw new AdminError("There can only be one Super Admin.");
  const email = input.email.trim().toLowerCase();
  const sb = serviceClient();
  const { data: existing } = await sb.from("site_staff").select("id").ilike("email", email).maybeSingle();
  if (existing) throw new AdminError("That person already has access. Change their role instead.");
  const { url, userId } = await oneTimeLink("invite", email, "/admin/welcome");
  const { error } = await sb.from("site_staff").insert({
    id: userId,
    email,
    full_name: input.fullName.trim(),
    role: input.role,
    status: "invited",
    invited_by: actor.id,
  });
  if (error) throw new AdminError(error.message);
  await sendInviteEmail(email, input.fullName, input.role, url, actor.fullName);
  await logActivity(actor, {
    action: "staff.invite",
    summary: `Invited ${input.fullName || email} as ${ROLE_LABEL[input.role]}`,
    targetType: "staff",
    targetId: userId,
  });
}

export async function resendInvite(actor: Staff, staffId: string) {
  const row = await getRow(staffId);
  if (row.status !== "invited") throw new AdminError("This person has already set up their account.");
  const { url } = await oneTimeLink("invite", row.email, "/admin/welcome");
  await sendInviteEmail(row.email, row.full_name, row.role as Role, url, actor.fullName);
  await logActivity(actor, { action: "staff.reinvite", summary: `Re-sent invite to ${row.full_name || row.email}`, targetType: "staff", targetId: staffId });
}

async function getRow(id: string) {
  const { data, error } = await serviceClient().from("site_staff").select("*").eq("id", id).maybeSingle();
  if (error || !data) throw new AdminError("That person wasn't found.");
  return data as { id: string; email: string; full_name: string; role: string; status: Staff["status"] };
}

function guardTarget(actor: Staff, row: { id: string; role: string }) {
  if (row.id === actor.id) throw new AdminError("You can't change your own access here.");
  if (row.role === "super_admin") throw new AdminError("The Super Admin's access can't be changed.");
}

export async function changeRole(actor: Staff, staffId: string, role: Role) {
  if (role === "super_admin") throw new AdminError("There can only be one Super Admin.");
  const row = await getRow(staffId);
  guardTarget(actor, row);
  if (row.role === role) return;
  const { error } = await serviceClient().from("site_staff").update({ role }).eq("id", staffId);
  if (error) throw new AdminError(error.message);
  await logActivity(actor, {
    action: "staff.role",
    summary: `Changed ${row.full_name || row.email} from ${ROLE_LABEL[row.role as Role]} to ${ROLE_LABEL[role]}`,
    targetType: "staff",
    targetId: staffId,
  });
}

export async function setSuspended(actor: Staff, staffId: string, suspended: boolean) {
  const row = await getRow(staffId);
  guardTarget(actor, row);
  const sb = serviceClient();
  // Ban in Supabase too, so any open session is refused at the next check.
  const ban = await sb.auth.admin.updateUserById(staffId, { ban_duration: suspended ? "876000h" : "none" });
  if (ban.error) throw new AdminError(ban.error.message);
  const status = suspended ? "suspended" : "active";
  const { error } = await sb.from("site_staff").update({ status }).eq("id", staffId);
  if (error) throw new AdminError(error.message);
  await logActivity(actor, {
    action: suspended ? "staff.suspend" : "staff.reactivate",
    summary: `${suspended ? "Suspended" : "Reactivated"} ${row.full_name || row.email}`,
    targetType: "staff",
    targetId: staffId,
  });
}

export async function setRequireMfa(actor: Staff, staffId: string, required: boolean) {
  const row = await getRow(staffId);
  if (row.id !== actor.id && row.role === "super_admin") throw new AdminError("The Super Admin's settings can't be changed.");
  const { error } = await serviceClient().from("site_staff").update({ require_mfa: required }).eq("id", staffId);
  if (error) throw new AdminError(error.message);
  await logActivity(actor, {
    action: "staff.require_mfa",
    summary: `${required ? "Required" : "Made optional"} the authenticator app for ${row.full_name || row.email}`,
    targetType: "staff",
    targetId: staffId,
  });
}

/** For someone who lost their phone: removes their authenticator so they can sign in with password and set it up again. */
export async function resetMfa(actor: Staff, staffId: string) {
  const row = await getRow(staffId);
  guardTarget(actor, row);
  const sb = serviceClient();
  const f = await sb.auth.admin.mfa.listFactors({ userId: staffId });
  for (const factor of f.data?.factors ?? []) {
    await sb.auth.admin.mfa.deleteFactor({ userId: staffId, id: factor.id });
  }
  await logActivity(actor, { action: "staff.reset_mfa", summary: `Reset the authenticator app for ${row.full_name || row.email}`, targetType: "staff", targetId: staffId });
}

/** Sends a reset link if (and only if) the email belongs to active staff. Callers always show the same message. */
export async function sendPasswordReset(email: string) {
  const clean = email.trim().toLowerCase();
  const { data } = await serviceClient()
    .from("site_staff")
    .select("id,full_name,status")
    .ilike("email", clean)
    .maybeSingle();
  if (!data || data.status === "suspended") return;
  const { url } = await oneTimeLink("recovery", clean, "/admin/reset-password");
  await sendAdminEmail({
    to: clean,
    subject: "Reset your TechieBreed admin password",
    heading: "Reset your password",
    lines: ["We received a request to reset the password for your TechieBreed website admin account.", "The link works once and expires in 1 hour."],
    button: { label: "Choose a new password", url },
    footnote: "If you didn't ask for this, you can ignore this email — your password won't change.",
  });
}
