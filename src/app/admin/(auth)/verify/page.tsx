import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VerifyForm } from "@/components/admin/AuthForms";
import { signOutAction } from "@/server/admin/actions/auth-actions";
import { getSessionState } from "@/server/admin/auth";

export const metadata: Metadata = { title: "Enter your code" };

export default async function VerifyPage({ searchParams }: PageProps<"/admin/verify">) {
  const s = await getSessionState();
  if (s.state !== "needs_mfa") redirect(s.state === "ok" ? "/admin" : "/admin/login");
  const sp = await searchParams;
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight font-semibold text-forest">Enter your code</h1>
        <p className="mt-1 text-[15px] text-ink-soft">Signed in as {s.staff.email}</p>
      </div>
      <VerifyForm next={typeof sp.next === "string" ? sp.next : undefined} />
      <form action={signOutAction} className="text-center">
        <button className="text-[14px] font-medium text-leaf hover:text-forest">Use a different account</button>
      </form>
      <p className="text-center text-[13px] text-muted">Lost your phone? Ask the Super Admin to reset your authenticator.</p>
    </div>
  );
}
