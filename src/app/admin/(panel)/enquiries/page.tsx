import type { Metadata } from "next";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import { Notice } from "@/components/admin/ui";
import { requireStaff } from "@/server/admin/auth";
import { listEnquiries, PAGE_SIZE, STATUS_LABEL, STATUS_STYLE, statusCounts, STATUSES, type EnquiryStatus } from "@/server/admin/enquiries";
import { can } from "@/server/admin/roles";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Enquiries" };

function when(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });
}

type Tab = EnquiryStatus | "open" | "all";
const TABS: { id: Tab; label: string }[] = [
  { id: "open", label: "Open" },
  ...STATUSES.map((s) => ({ id: s as Tab, label: STATUS_LABEL[s] })),
  { id: "all", label: "All" },
];

export default async function EnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  const staff = await requireStaff("enquiries.view");
  const sp = await searchParams;
  const tab = (TABS.find((t) => t.id === sp.status)?.id ?? "open") as Tab;
  const q = typeof sp.q === "string" ? sp.q : "";
  const mine = sp.mine === "1";
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ rows, total }, counts] = await Promise.all([
    listEnquiries(staff, { status: tab, q, page, mine: mine ? staff.id : undefined }),
    statusCounts(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (over: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = { status: tab === "open" ? undefined : tab, q: q || undefined, mine: mine ? "1" : undefined, ...over };
    for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== "") p.set(k, String(v));
    const s = p.toString();
    return `/admin/enquiries${s ? `?${s}` : ""}`;
  };
  const countFor = (t: Tab) => (t === "open" ? counts.new + counts.replied : t === "all" ? null : counts[t]);

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] leading-tight font-semibold text-forest md:text-[36px]">Enquiries</h1>
          <p className="mt-1 text-[15px] text-ink-soft">Messages from the discovery and Academy forms on the website.</p>
        </div>
        {can(staff.role, "enquiries.manage") && (
          <a
            href={`/admin/enquiries/export${tab !== "open" && tab !== "all" ? `?status=${tab}` : ""}`}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-5 text-[15px] font-semibold text-forest hover:border-forest/40 hover:bg-mint"
          >
            <Download aria-hidden className="size-4" /> Download spreadsheet
          </a>
        )}
      </header>

      {sp.deleted && <Notice kind="success">Enquiry deleted.</Notice>}

      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const n = countFor(t.id);
          return (
            <Link
              key={t.id}
              href={href({ status: t.id === "open" ? undefined : t.id, page: undefined })}
              aria-current={tab === t.id ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[14px] font-semibold",
                tab === t.id ? "bg-forest text-white" : "bg-white text-forest ring-1 ring-line hover:bg-mint",
              )}
            >
              {t.label}
              {n !== null && <span className={tab === t.id ? "ml-1.5 text-lime" : "ml-1.5 text-muted"}>{n}</span>}
            </Link>
          );
        })}
        <Link
          href={href({ mine: mine ? undefined : "1", page: undefined })}
          aria-pressed={mine}
          className={cn("rounded-full px-3.5 py-1.5 text-[14px] font-semibold", mine ? "bg-sprout text-on-sprout" : "bg-white text-forest ring-1 ring-line hover:bg-mint")}
        >
          Assigned to me
        </Link>
      </div>

      <form action="/admin/enquiries" className="flex gap-2">
        {tab !== "open" && <input type="hidden" name="status" value={tab} />}
        {mine && <input type="hidden" name="mine" value="1" />}
        <label htmlFor="enq-q" className="sr-only">
          Search enquiries
        </label>
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
          <input
            id="enq-q"
            name="q"
            defaultValue={q}
            placeholder="Search by name, email, company or interest"
            className="h-11 w-full rounded-full border border-line bg-white pr-4 pl-10 text-[15px] focus:border-forest focus:outline-none"
          />
        </div>
        <button className="h-11 rounded-full bg-forest px-5 text-[15px] font-semibold text-white hover:bg-forest-glow">Search</button>
      </form>

      <section className="rounded-[18px] border border-line bg-white">
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-[15px] text-muted md:px-6">
            {q ? `No enquiries match "${q}".` : tab === "open" ? "No open enquiries. New messages from the website appear here." : "Nothing here."}
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/enquiries/${r.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 hover:bg-[#f7faf8] md:px-6">
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-[15px] text-ink", r.status === "new" ? "font-bold" : "font-medium")}>
                      {r.name}
                      {r.company ? <span className="font-normal text-muted"> · {r.company}</span> : null}
                    </span>
                    <span className="block truncate text-[13.5px] text-muted">
                      {r.kind === "academy" ? "Academy" : "Discovery"} · {r.interest ?? "—"}
                    </span>
                  </span>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-semibold", STATUS_STYLE[r.status])}>{STATUS_LABEL[r.status]}</span>
                  <span className="w-28 shrink-0 text-right text-[13px] text-muted">{when(r.created_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {pages > 1 && (
        <nav aria-label="Pages" className="flex items-center justify-between text-[14.5px]">
          {page > 1 ? (
            <Link href={href({ page: page - 1 })} className="font-semibold text-leaf hover:text-forest">
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted">
            Page {page} of {pages} · {total} enquiries
          </span>
          {page < pages ? (
            <Link href={href({ page: page + 1 })} className="font-semibold text-leaf hover:text-forest">
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
