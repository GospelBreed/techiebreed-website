import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { can, isRole, type Permission, type Role } from "./roles";
import { serviceClient, sessionClient, supabaseConfigured } from "./supabase";

/**
 * Data Access Layer for the admin. Every admin page and server action goes
 * through requireStaff(), which checks, in order:
 *   1. a valid Supabase session,
 *   2. an active site_staff row (invited people are activated on first sign-in),
 *   3. the second sign-in step when the person has an authenticator app or must use one,
 *   4. the permission for what they're trying to do.
 */

export type Staff = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  status: "invited" | "active" | "suspended";
  requireMfa: boolean;
  mfaEnabled: boolean;
  lastSignIn: string | null;
};

export type SessionState =
  | { state: "not_configured" }
  | { state: "signed_out" }
  | { state: "no_access"; email: string }
  | { state: "needs_mfa"; staff: Staff }
  | { state: "needs_mfa_setup"; staff: Staff }
  | { state: "ok"; staff: Staff };

type StaffRow = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: Staff["status"];
  require_mfa: boolean;
  last_sign_in: string | null;
};

export async function loadStaffRow(id: string): Promise<StaffRow | null> {
  const { data, error } = await serviceClient()
    .from("site_staff")
    .select("id,email,full_name,role,status,require_mfa,last_sign_in")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Could not load staff: ${error.message}`);
  return data as StaffRow | null;
}

/** Reads the signed-in person and their access. Always request-time. */
export async function getSessionState(): Promise<SessionState> {
  await connection();
  if (!supabaseConfigured()) return { state: "not_configured" };
  const supabase = await sessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { state: "signed_out" };

  const row = await loadStaffRow(user.id);
  if (!row || row.status === "suspended" || !isRole(row.role)) {
    return { state: "no_access", email: user.email ?? "" };
  }

  const [{ data: aal }, { data: factors }] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);
  const mfaEnabled = (factors?.totp ?? []).some((f) => f.status === "verified");

  const staff: Staff = {
    id: row.id,
    email: row.email,
    fullName: row.full_name || row.email,
    role: row.role,
    status: row.status,
    requireMfa: row.require_mfa,
    mfaEnabled,
    lastSignIn: row.last_sign_in,
  };

  if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") return { state: "needs_mfa", staff };
  if (staff.requireMfa && !mfaEnabled) return { state: "needs_mfa_setup", staff };
  return { state: "ok", staff };
}

/**
 * Use at the top of every admin page and server action.
 * Redirects to sign-in / the code step when needed; sends people without
 * the permission back to the dashboard.
 */
export async function requireStaff(permission?: Permission, opts: { allowMfaSetup?: boolean } = {}): Promise<Staff> {
  const s = await getSessionState();
  switch (s.state) {
    case "not_configured":
      redirect("/admin/login");
    case "signed_out":
      redirect("/admin/login");
    case "no_access":
      redirect("/admin/login?error=no_access");
    case "needs_mfa":
      redirect("/admin/verify");
    case "needs_mfa_setup":
      if (!opts.allowMfaSetup) redirect("/admin/account?setup=mfa");
      return s.staff;
    case "ok":
      if (permission && !can(s.staff.role, permission)) redirect("/admin?denied=1");
      return s.staff;
  }
}
