import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SetPasswordForm } from "@/components/admin/AuthForms";
import { getSessionState } from "@/server/admin/auth";
import { ROLE_LABEL, ROLE_SUMMARY } from "@/server/admin/roles";

export const metadata: Metadata = { title: "Set up your account" };

export default async function WelcomePage() {
  const s = await getSessionState();
  if (s.state === "signed_out" || s.state === "not_configured") redirect("/admin/login?error=link_expired");
  if (s.state === "no_access") redirect("/admin/login?error=no_access");
  const { staff } = s;
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight font-semibold text-forest">Welcome to the admin</h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          You&rsquo;re joining as <strong className="text-forest">{ROLE_LABEL[staff.role]}</strong>: {ROLE_SUMMARY[staff.role].charAt(0).toLowerCase() + ROLE_SUMMARY[staff.role].slice(1)}
        </p>
      </div>
      <SetPasswordForm askName defaultName={staff.fullName === staff.email ? "" : staff.fullName} />
    </div>
  );
}
