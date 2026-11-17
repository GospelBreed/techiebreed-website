import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/AuthForms";
import { Notice } from "@/components/admin/ui";
import { getSessionState } from "@/server/admin/auth";
import { superAdminExists } from "@/server/admin/staff";

/** Reads the session or database on every request. */
export const instant = false;

export const metadata: Metadata = { title: "Sign in" };

const MESSAGES: Record<string, { kind: "error" | "success"; text: string }> = {
  no_access: { kind: "error", text: "This account doesn't have access to the admin." },
  link_expired: { kind: "error", text: "That link has expired or was already used. Ask for a new one." },
  signed_out: { kind: "success", text: "You've signed out." },
};

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const sp = await searchParams;
  const s = await getSessionState();

  if (s.state === "not_configured") {
    return (
      <div className="grid gap-4">
        <h1 className="font-display text-[28px] font-semibold text-forest">Admin not connected yet</h1>
        <Notice kind="info">
          The admin needs its database settings (Supabase) before anyone can sign in. See docs/ADMIN.md.
        </Notice>
      </div>
    );
  }
  if (s.state === "ok" || s.state === "needs_mfa_setup") redirect("/admin");
  if (s.state === "needs_mfa") redirect("/admin/verify");

  const key = typeof sp.error === "string" ? sp.error : sp.signed_out ? "signed_out" : "";
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const firstRun = !(await superAdminExists());

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-[30px] leading-tight font-semibold text-forest">Sign in</h1>
        <p className="mt-1 text-[15px] text-ink-soft">TechieBreed website admin</p>
      </div>
      <LoginForm next={next} notice={MESSAGES[key]} />
      {firstRun && (
        <p className="text-center text-[13.5px] text-muted">
          First time here?{" "}
          <Link href="/admin/setup" className="font-semibold text-leaf hover:text-forest">
            Set up the Super Admin
          </Link>
        </p>
      )}
    </div>
  );
}
