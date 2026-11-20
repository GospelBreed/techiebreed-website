import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { Suspense } from "react";
import { Sidebar, type NavItem } from "@/components/admin/Sidebar";
import { signOutAction } from "@/server/admin/actions/auth-actions";
import { requireStaff } from "@/server/admin/auth";
import { newEnquiryCount } from "@/server/admin/enquiries";
import { can, ROLE_LABEL } from "@/server/admin/roles";

/** Depends on who is signed in, so navigations may wait for the server. */
export const instant = false;

/** Signed-in admin frame: sidebar (filtered by role) + content. */
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Panel>{children}</Panel>
    </Suspense>
  );
}

async function Panel({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff(undefined, { allowMfaSetup: true });

  const items: NavItem[] = [{ href: "/admin", label: "Dashboard", icon: "dashboard" }];
  if (can(staff.role, "analytics.view")) items.push({ href: "/admin/analytics", label: "Analytics", icon: "analytics" });
  if (can(staff.role, "articles.view"))
    items.push({ href: "/admin/articles", label: staff.role === "author" ? "My posts" : "Articles", icon: "articles" });
  if (can(staff.role, "cases.view")) items.push({ href: "/admin/case-studies", label: "Case studies", icon: "cases" });
  if (can(staff.role, "enquiries.view")) {
    const badge = await newEnquiryCount().catch(() => 0);
    items.push({ href: "/admin/enquiries", label: "Enquiries", icon: "enquiries", badge });
  }
  if (can(staff.role, "activity.view")) items.push({ href: "/admin/activity", label: "Activity", icon: "activity" });
  if (can(staff.role, "settings.edit")) items.push({ href: "/admin/settings", label: "Settings", icon: "settings" });
  if (can(staff.role, "staff.manage")) items.push({ href: "/admin/users", label: "Users", icon: "users" });
  items.push({ href: "/admin/account", label: "My account", icon: "account" });

  const footer = (
    <div className="grid gap-3 border-t border-white/10 pt-4">
      <div className="px-2">
        <p className="truncate text-[14px] font-semibold text-white">{staff.fullName}</p>
        <p className="text-[12.5px] text-lime">{ROLE_LABEL[staff.role]}</p>
      </div>
      <Link href="/" target="_blank" className="flex items-center gap-2 px-2 text-[13.5px] text-white/70 hover:text-white">
        <ExternalLink aria-hidden className="size-4" /> View website
      </Link>
      <form action={signOutAction}>
        <button className="flex items-center gap-2 px-2 text-[13.5px] text-white/70 hover:text-white">
          <LogOut aria-hidden className="size-4" /> Sign out
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <Sidebar items={items} footer={footer} />
      <main id="main" className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-[1100px]">{children}</div>
      </main>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="flex min-h-dvh">
      <div className="hidden w-[248px] bg-forest lg:block" />
      <div className="flex-1 p-8">
        <div className="mx-auto grid max-w-[1100px] gap-4">
          <div className="h-9 w-64 animate-pulse rounded-lg bg-mint" />
          <div className="h-40 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    </div>
  );
}
