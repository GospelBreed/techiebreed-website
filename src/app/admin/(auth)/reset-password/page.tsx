import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SetPasswordForm } from "@/components/admin/AuthForms";
import { getSessionState } from "@/server/admin/auth";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage() {
  const s = await getSessionState();
  if (s.state === "signed_out" || s.state === "not_configured") redirect("/admin/login?error=link_expired");
  if (s.state === "no_access") redirect("/admin/login?error=no_access");
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight font-semibold text-forest">Choose a new password</h1>
        <p className="mt-1 text-[15px] text-ink-soft">For {s.staff.email}</p>
      </div>
      <SetPasswordForm />
    </div>
  );
}
