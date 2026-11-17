import type { Metadata } from "next";

/** Every admin page depends on who is signed in, so navigations here are allowed to wait for the server. */
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin | TechieBreed" },
  robots: { index: false, follow: false, nocache: true },
};

/** Everything under /admin: private, never indexed, its own look (no public header/footer). */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex min-h-dvh flex-col bg-[#f3f6f4] text-ink">{children}</div>;
}
