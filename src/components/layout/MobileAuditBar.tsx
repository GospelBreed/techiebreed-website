"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck } from "lucide-react";
import { auditCta } from "@/lib/site";

/** Sticky "Book an Audit" button on small screens (hidden on the contact page itself). */
export function MobileAuditBar() {
  const pathname = usePathname();
  if (pathname === "/contact") return null;
  return (
    <aside aria-label="Book an audit" className="fixed inset-x-0 bottom-0 z-40 px-4 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] md:hidden">
      <Link
        href={auditCta.href}
        className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-sprout font-semibold text-on-sprout shadow-[0_14px_30px_-10px_rgb(0_0_0/0.45)] transition-colors hover:bg-sprout-bright"
      >
        <CalendarCheck aria-hidden className="size-5" />
        Book an Audit
      </Link>
    </aside>
  );
}
