import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "@/components/admin/AuthForms";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight font-semibold text-forest">Reset your password</h1>
        <p className="mt-1 text-[15px] text-ink-soft">We&rsquo;ll email you a link to choose a new one.</p>
      </div>
      <ForgotForm />
      <Link href="/admin/login" className="text-center text-[14px] font-medium text-leaf hover:text-forest">
        Back to sign in
      </Link>
    </div>
  );
}
