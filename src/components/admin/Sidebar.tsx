"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Briefcase, FileText, History, Inbox, LayoutDashboard, Menu, Settings, UserCog, Users, X, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";

export type NavItem = {
  href: string;
  label: string;
  icon: "dashboard" | "analytics" | "articles" | "cases" | "enquiries" | "activity" | "settings" | "users" | "account";
  /** Small count shown next to the label, e.g. new enquiries. */
  badge?: number;
};

const ICONS: Record<NavItem["icon"], LucideIcon> = {
  dashboard: LayoutDashboard,
  analytics: BarChart3,
  articles: FileText,
  cases: Briefcase,
  enquiries: Inbox,
  settings: Settings,
  activity: History,
  users: Users,
  account: UserCog,
};

function NavLinks({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="grid gap-1">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onNavigate={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[15px] font-medium transition-colors",
                active ? "bg-white/12 text-white" : "text-white/75 hover:bg-white/8 hover:text-white",
              )}
            >
              <Icon aria-hidden className={cn("size-[18px]", active ? "text-lime" : "")} strokeWidth={1.9} />
              {item.label}
              {item.badge ? (
                <span className="ml-auto rounded-full bg-sprout px-2 py-0.5 text-[12px] leading-none font-bold text-on-sprout">
                  {item.badge > 99 ? "99+" : item.badge}
                  <span className="sr-only"> new</span>
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Left navigation on desktop; a slide-down menu on small screens. */
export function Sidebar({ items, footer }: { items: NavItem[]; footer: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <aside className="on-dark hidden w-[248px] shrink-0 flex-col bg-forest px-4 py-5 lg:flex">
        <Link href="/admin" className="mb-8 flex items-center gap-2.5 px-2">
          <LogoMark tone="light" className="size-8" />
          <span className="leading-tight">
            <span className="block text-[16px] font-bold text-white">TechieBreed</span>
            <span className="block text-[12px] font-medium tracking-[0.08em] text-lime uppercase">Admin</span>
          </span>
        </Link>
        <nav aria-label="Admin" className="flex-1">
          <NavLinks items={items} />
        </nav>
        {footer}
      </aside>

      <div className="on-dark flex items-center justify-between bg-forest px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <LogoMark tone="light" className="size-7" />
          <span className="text-[15px] font-bold text-white">
            TechieBreed <span className="text-lime">Admin</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-mobile-nav"
          className="grid size-10 place-items-center rounded-md text-white"
        >
          {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </div>
      {open && (
        <nav id="admin-mobile-nav" aria-label="Admin" className="on-dark border-t border-white/10 bg-forest px-4 pt-2 pb-4 lg:hidden">
          <NavLinks items={items} onNavigate={() => setOpen(false)} />
          <div className="mt-4">{footer}</div>
        </nav>
      )}
    </>
  );
}
