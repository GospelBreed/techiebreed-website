import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { BootstrapForm } from "@/components/admin/AuthForms";
import { Notice } from "@/components/admin/ui";
import { superAdminExists } from "@/server/admin/staff";
import { supabaseConfigured } from "@/server/admin/supabase";

/** Reads the session or database on every request. */
export const instant = false;

export const metadata: Metadata = { title: "First-time set-up" };

/** One-time: emails the Super Admin (SUPER_ADMIN_EMAIL) a link to create their account. Disabled once they exist. */
export default async function SetupPage() {
  await connection();
  if (!supabaseConfigured()) {
    return <Notice kind="info">The admin isn&rsquo;t connected to its database yet. See docs/ADMIN.md.</Notice>;
  }
  const done = await superAdminExists();
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight font-semibold text-forest">First-time set-up</h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          {done
            ? "The Super Admin account already exists."
            : "This sends a one-time link to the Super Admin email address set for this website. Open it to choose your password."}
        </p>
      </div>
      {done ? (
        <Link href="/admin/login" className="text-center font-semibold text-leaf hover:text-forest">
          Go to sign in
        </Link>
      ) : (
        <BootstrapForm />
      )}
    </div>
  );
}
