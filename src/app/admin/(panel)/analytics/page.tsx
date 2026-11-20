import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Suspense } from "react";
import { LiveVisitors } from "@/components/admin/LiveVisitors";
import { TrendChart } from "@/components/admin/TrendChart";
import { Notice } from "@/components/admin/ui";
import { analyticsStatus, isRange, RANGES, searchReport, visitorReport, type Range, type Row } from "@/server/admin/analytics";
import { requireStaff, type Staff } from "@/server/admin/auth";
import { GoogleError } from "@/server/admin/google";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Analytics" };

const num = (n: number) => Math.round(n).toLocaleString("en-GB");
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const secs = (n: number) => (n < 60 ? `${Math.round(n)}s` : `${Math.floor(n / 60)}m ${String(Math.round(n % 60)).padStart(2, "0")}s`);
const day = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export default async function AnalyticsPage({ searchParams }: PageProps<"/admin/analytics">) {
  const staff = await requireStaff("analytics.view");
  const sp = await searchParams;
  const range: Range = isRange(sp.range) ? sp.range : "28";
  const st = analyticsStatus();

  return (
    <div className="grid grid-cols-1 gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] leading-tight font-semibold text-forest md:text-[36px]">Analytics</h1>
          <p className="mt-1 text-[15px] text-ink-soft">Who visits the website, and how people find it on Google.</p>
        </div>
        {st.configured && (
          <nav aria-label="Time period" className="flex flex-wrap gap-2">
            {(Object.keys(RANGES) as Range[]).map((r) => (
              <Link
                key={r}
                href={`/admin/analytics?range=${r}`}
                aria-current={r === range ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[14px] font-semibold",
                  r === range ? "bg-forest text-white" : "bg-white text-forest ring-1 ring-line hover:bg-mint",
                )}
              >
                {RANGES[r]}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {!st.configured ? (
        <SetupSteps />
      ) : (
        <>
          {st.visitors && <LiveVisitors />}
          <Suspense key={`v${range}`} fallback={<SectionSkeleton title="Visitors" />}>
            {st.visitors ? <Visitors staff={staff} range={range} /> : <Missing title="Visitors" what="GA4_PROPERTY_ID" />}
          </Suspense>
          <Suspense key={`s${range}`} fallback={<SectionSkeleton title="Google Search" />}>
            {st.search ? <Search staff={staff} range={range} /> : <Missing title="Google Search" what="GSC_SITE_URL" />}
          </Suspense>
        </>
      )}
    </div>
  );
}

// ---------- sections

async function Visitors({ staff, range }: { staff: Staff; range: Range }) {
  let r;
  try {
    r = await visitorReport(staff, range);
  } catch (e) {
    return <Failed title="Visitors" error={e} />;
  }
  const t = r.totals;
  const p = r.previous;
  return (
    <Section title="Visitors" sub={`${day(r.range.start)} – ${day(r.range.end)} · from Google Analytics`}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Visitors" value={num(t.users)} now={t.users} before={p.users} />
        <Tile label="Visits" value={num(t.sessions)} now={t.sessions} before={p.sessions} />
        <Tile label="Pages viewed" value={num(t.views)} now={t.views} before={p.views} />
        <Tile label="Engaged visits" value={pct(t.engagement)} now={t.engagement} before={p.engagement} hint={`Avg. ${secs(t.duration)} per visit`} />
      </div>
      {t.users === 0 && t.views === 0 ? (
        <p className="rounded-[12px] bg-mint px-4 py-3 text-[14.5px] text-ink-soft">
          No visits recorded yet for this period. If tracking was switched on recently, numbers appear within a day.
        </p>
      ) : (
        <>
          <TrendChart points={r.users} label="Visitors" />
          <div className="grid gap-5 lg:grid-cols-2">
            <Ranked title="Most-read pages" rows={r.pages} cols={["Views", "Visitors"]} />
            <Ranked title="How people arrive" rows={r.channels} cols={["Visits"]} />
            <Ranked title="Top sources" rows={r.sources} cols={["Visits"]} />
            <Ranked title="Countries" rows={r.countries} cols={["Visitors"]} />
            <Ranked title="Devices" rows={r.devices} cols={["Visitors"]} />
          </div>
        </>
      )}
    </Section>
  );
}

async function Search({ staff, range }: { staff: Staff; range: Range }) {
  let r;
  try {
    r = await searchReport(staff, range);
  } catch (e) {
    return <Failed title="Google Search" error={e} />;
  }
  const t = r.totals;
  const p = r.previous;
  return (
    <Section title="Google Search" sub={`${day(r.range.start)} – ${day(r.range.end)} · from Search Console · the last 2–3 days are still being counted`}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Clicks from Google" value={num(t.clicks)} now={t.clicks} before={p.clicks} />
        <Tile label="Times shown in results" value={num(t.impressions)} now={t.impressions} before={p.impressions} />
        <Tile label="Click rate" value={pct(t.ctr)} now={t.ctr} before={p.ctr} />
        <Tile label="Average position" value={t.position ? t.position.toFixed(1) : "–"} now={t.position} before={p.position} lowerIsBetter hint="1 is the top of the page" />
      </div>
      {t.impressions === 0 ? (
        <p className="rounded-[12px] bg-mint px-4 py-3 text-[14.5px] text-ink-soft">Google hasn&rsquo;t shown the site in search results in this period yet.</p>
      ) : (
        <>
          <TrendChart points={r.clicks} label="Clicks" />
          <div className="grid gap-5 lg:grid-cols-2">
            <Ranked title="What people searched for" rows={r.queries} cols={["Clicks", "Shown", "Position"]} wide />
            <Ranked title="Pages people clicked" rows={r.pages} cols={["Clicks", "Shown"]} />
            <Ranked title="Countries" rows={r.countries} cols={["Clicks"]} />
            <Ranked title="Devices" rows={r.devices} cols={["Clicks"]} />
          </div>
        </>
      )}
    </Section>
  );
}

// ---------- building blocks

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="grid min-w-0 grid-cols-1 gap-5 rounded-[18px] border border-line bg-white p-5 md:p-6" aria-label={title}>
      <div>
        <h2 className="text-[18px] font-bold text-forest">{title}</h2>
        {sub && <p className="mt-0.5 text-[13.5px] text-muted">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

function Tile({ label, value, now, before, lowerIsBetter, hint }: { label: string; value: string; now: number; before: number; lowerIsBetter?: boolean; hint?: string }) {
  let change: React.ReactNode = <span className="text-muted">No earlier data</span>;
  if (before > 0) {
    const diff = (now - before) / before;
    const flat = Math.abs(diff) < 0.005;
    const good = flat ? null : lowerIsBetter ? diff < 0 : diff > 0;
    const Icon = flat ? Minus : diff > 0 ? ArrowUpRight : ArrowDownRight;
    change = (
      <span className={cn("inline-flex items-center gap-0.5 font-semibold", good === null ? "text-muted" : good ? "text-leaf" : "text-[#b42318]")}>
        <Icon aria-hidden className="size-3.5" />
        {flat ? "Same" : `${diff > 0 ? "+" : ""}${(diff * 100).toFixed(0)}%`}
        <span className="sr-only">{good === null ? "" : good ? " (better)" : " (worse)"}</span>
      </span>
    );
  }
  return (
    <div className="rounded-[14px] bg-[#f6f9f7] p-4">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-1 text-[24px] leading-none font-bold text-ink tabular-nums">{value}</p>
      <p className="mt-2 text-[12.5px]">
        {change} <span className="text-muted">vs the period before</span>
      </p>
      {hint && <p className="mt-0.5 text-[12.5px] text-muted">{hint}</p>}
    </div>
  );
}

function Ranked({ title, rows, cols, wide }: { title: string; rows: Row[]; cols: string[]; wide?: boolean }) {
  const top = Math.max(1, ...rows.map((r) => r.values[0] ?? 0));
  return (
    <div className={cn("min-w-0", wide && "lg:col-span-2")}>
      <h3 className="mb-2 text-[14.5px] font-bold text-ink">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-[14px] text-muted">Nothing to show for this period.</p>
      ) : (
        <table className="w-full table-fixed text-[14px]">
          <thead>
            <tr className="text-[12.5px] text-muted">
              <th className="pb-1.5 text-left font-medium">
                <span className="sr-only">{title}</span>
              </th>
              {cols.map((c) => (
                <th key={c} className="w-[52px] pb-1.5 md:w-[72px] text-right font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="py-[3px] pr-3">
                  <div className="relative overflow-hidden rounded-[6px] px-2 py-1">
                    <span aria-hidden className="absolute inset-y-0 left-0 rounded-[6px] bg-mint" style={{ width: `${((r.values[0] ?? 0) / top) * 100}%` }} />
                    <span className="relative block truncate text-ink-soft" title={r.label}>
                      {r.label}
                    </span>
                  </div>
                </td>
                {cols.map((c, i) => (
                  <td key={c} className={cn("text-right tabular-nums", i === 0 ? "font-semibold text-ink" : "text-ink-soft")}>
                    {c === "Position" ? (r.values[i] ?? 0).toFixed(1) : num(r.values[i] ?? 0)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Failed({ title, error }: { title: string; error: unknown }) {
  if (!(error instanceof GoogleError)) console.error(`[analytics] ${title} failed:`, error instanceof Error ? error.message : error);
  return (
    <Section title={title}>
      <Notice kind="error">{error instanceof GoogleError ? error.message : "The numbers couldn't be loaded. Try again in a minute."}</Notice>
    </Section>
  );
}

function Missing({ title, what }: { title: string; what: string }) {
  return (
    <Section title={title}>
      <Notice kind="info">
        Not connected yet: add <code className="font-semibold">{what}</code> in Vercel (see the set-up steps in docs/ADMIN.md).
      </Notice>
    </Section>
  );
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="grid min-w-0 grid-cols-1 gap-5 rounded-[18px] border border-line bg-white p-5 md:p-6" aria-busy aria-label={`${title} loading`}>
      <div className="h-6 w-40 animate-pulse rounded bg-mint" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[104px] animate-pulse rounded-[14px] bg-mint" />
        ))}
      </div>
      <div className="h-[220px] animate-pulse rounded-[14px] bg-mint" />
    </section>
  );
}

function SetupSteps() {
  return (
    <section className="rounded-[18px] border border-line bg-white p-5 md:p-6">
      <h2 className="text-[16px] font-bold text-forest">Connect Google</h2>
      <p className="mt-1 text-[14.5px] text-ink-soft">Analytics isn&rsquo;t connected yet. The Super Admin sets it up once:</p>
      <ol className="mt-3 grid list-decimal gap-1.5 pl-5 text-[14.5px] text-ink-soft">
        <li>Create a Google service account and download its JSON key.</li>
        <li>Add the service account to Search Console and to Google Analytics as a viewer.</li>
        <li>
          In Vercel add <code>GOOGLE_SERVICE_ACCOUNT_JSON</code>, <code>GSC_SITE_URL</code>, <code>GA4_PROPERTY_ID</code> and{" "}
          <code>NEXT_PUBLIC_GA_MEASUREMENT_ID</code>, then redeploy.
        </li>
      </ol>
      <p className="mt-3 text-[13.5px] text-muted">The full steps are in docs/ADMIN.md under &ldquo;Analytics&rdquo;.</p>
    </section>
  );
}
