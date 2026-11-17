import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/Logo";

/** Depends on who is signed in, so navigations may wait for the server. */
export const instant = false;

/** Centered card for sign-in, code entry, password reset and first-time set-up. */
export default function AuthLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="on-dark flex min-h-dvh flex-col items-center justify-center bg-[radial-gradient(70%_90%_at_50%_45%,var(--color-forest-glow)_0%,var(--color-forest)_62%)] px-4 py-12">
      <Link href="/" className="mb-8 rounded-md" aria-label="TechieBreed website">
        <Logo tone="light" />
      </Link>
      <main className="w-full max-w-[420px] rounded-[24px] bg-white p-7 text-ink shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)] md:p-9">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-mint" />}>{children}</Suspense>
      </main>
      <p className="mt-6 text-[13px] text-white/70">TechieBreed website admin · authorised staff only</p>
    </div>
  );
}
