import "server-only";
import type { Staff } from "./auth";
import { googleConfig, GoogleError, googlePost, type GoogleConfig } from "./google";
import { can } from "./roles";
import { AdminError } from "./staff";

/**
 * Website analytics for the admin: Google Search (Search Console) and visitors
 * (Google Analytics 4). Answers are kept for a few minutes so busy admin pages
 * don't use up Google's daily allowance.
 */

export const RANGES = { "7": "Last 7 days", "28": "Last 28 days", "90": "Last 3 months" } as const;
export type Range = keyof typeof RANGES;
export const isRange = (v: unknown): v is Range => typeof v === "string" && v in RANGES;

export type Point = { date: string; value: number };
export type Row = { label: string; values: number[] };
type Totals<K extends string> = Record<K, number>;

export type SearchReport = {
  range: { start: string; end: string };
  totals: Totals<"clicks" | "impressions" | "ctr" | "position">;
  previous: Totals<"clicks" | "impressions" | "ctr" | "position">;
  clicks: Point[];
  queries: Row[]; // clicks, impressions, position
  pages: Row[]; // clicks, impressions
  countries: Row[]; // clicks
  devices: Row[]; // clicks
};

export type VisitorReport = {
  range: { start: string; end: string };
  totals: Totals<"users" | "sessions" | "views" | "engagement" | "duration">;
  previous: Totals<"users" | "sessions" | "views" | "engagement" | "duration">;
  users: Point[];
  pages: Row[]; // views, users
  channels: Row[]; // sessions
  sources: Row[]; // sessions
  countries: Row[]; // users
  devices: Row[]; // users
};

export type LiveReport = { users: number; pages: Row[]; at: string };

export type AnalyticsStatus = { configured: boolean; search: boolean; visitors: boolean; account: string | null };

export function analyticsStatus(): AnalyticsStatus {
  const cfg = googleConfig();
  return { configured: Boolean(cfg), search: Boolean(cfg?.gscSite), visitors: Boolean(cfg?.ga4Property), account: cfg?.account.client_email ?? null };
}

function mustSee(s: Staff) {
  if (!can(s.role, "analytics.view")) throw new AdminError("Your role can't see analytics.");
}

// ---------- dates (Lagos time)

function lagosDay(offsetDays: number): string {
  const d = new Date(Date.now() + 60 * 60 * 1000 + offsetDays * 86_400_000); // Lagos is UTC+1 all year
  return d.toISOString().slice(0, 10);
}

/** Current and previous window. Ends yesterday: today's numbers are still coming in. */
function windows(range: Range) {
  const n = Number(range);
  return {
    cur: { start: lagosDay(-n), end: lagosDay(-1) },
    prev: { start: lagosDay(-2 * n), end: lagosDay(-n - 1) },
  };
}

function everyDay(start: string, end: string): string[] {
  const out: string[] = [];
  for (let t = Date.parse(start); t <= Date.parse(end); t += 86_400_000) out.push(new Date(t).toISOString().slice(0, 10));
  return out;
}

/** Fills days with no data with 0 so the chart line doesn't skip them. */
function series(start: string, end: string, found: Map<string, number>): Point[] {
  return everyDay(start, end).map((date) => ({ date, value: found.get(date) ?? 0 }));
}

// ---------- small cache

const cache = new Map<string, { until: number; value: Promise<unknown> }>();

function remember<T>(key: string, ms: number, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.until > Date.now()) return hit.value as Promise<T>;
  const value = fn();
  cache.set(key, { until: Date.now() + ms, value });
  value.catch(() => cache.delete(key)); // never keep a failure
  if (cache.size > 50) for (const [k, v] of cache) if (v.until < Date.now()) cache.delete(k);
  return value;
}

function needs(cfg: GoogleConfig | null, part: "gsc" | "ga"): GoogleConfig {
  if (!cfg) throw new GoogleError("Analytics isn't connected yet: GOOGLE_SERVICE_ACCOUNT_JSON is missing in Vercel.");
  if (part === "gsc" && !cfg.gscSite) throw new GoogleError("Google Search isn't connected yet: GSC_SITE_URL is missing in Vercel.");
  if (part === "ga" && !cfg.ga4Property) throw new GoogleError("Visitor numbers aren't connected yet: GA4_PROPERTY_ID is missing in Vercel.");
  return cfg;
}

// ---------- Google Search (Search Console)

type GscRow = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number };

async function gsc(cfg: GoogleConfig, w: { start: string; end: string }, dimensions: string[], rowLimit = 10): Promise<GscRow[]> {
  const r = await googlePost<{ rows?: GscRow[] }>(cfg, "gsc", `/webmasters/v3/sites/${encodeURIComponent(cfg.gscSite!)}/searchAnalytics/query`, {
    startDate: w.start,
    endDate: w.end,
    dimensions,
    rowLimit,
    dataState: "all",
  });
  return r.rows ?? [];
}

const gscTotals = (rows: GscRow[]) => {
  const r = rows[0];
  return { clicks: r?.clicks ?? 0, impressions: r?.impressions ?? 0, ctr: r?.ctr ?? 0, position: r?.position ?? 0 };
};

/** Turns a full page address into a short path for display. */
function shortPath(url: string): string {
  try {
    const u = new URL(url);
    return decodeURIComponent(u.pathname + u.search) || "/";
  } catch {
    return url;
  }
}

const DEVICE: Record<string, string> = { DESKTOP: "Computer", MOBILE: "Mobile", TABLET: "Tablet", desktop: "Computer", mobile: "Mobile", tablet: "Tablet", "smart tv": "TV" };

export async function searchReport(s: Staff, range: Range): Promise<SearchReport> {
  mustSee(s);
  const cfg = needs(googleConfig(), "gsc");
  const { cur, prev } = windows(range);
  return remember(`gsc:${cfg.gscSite}:${cur.start}:${cur.end}`, 10 * 60_000, async () => {
    const [tot, ptot, byDate, queries, pages, countries, devices] = await Promise.all([
      gsc(cfg, cur, [], 1),
      gsc(cfg, prev, [], 1),
      gsc(cfg, cur, ["date"], 500),
      gsc(cfg, cur, ["query"], 15),
      gsc(cfg, cur, ["page"], 10),
      gsc(cfg, cur, ["country"], 8),
      gsc(cfg, cur, ["device"], 5),
    ]);
    return {
      range: cur,
      totals: gscTotals(tot),
      previous: gscTotals(ptot),
      clicks: series(cur.start, cur.end, new Map(byDate.map((r) => [r.keys![0], r.clicks]))),
      queries: queries.map((r) => ({ label: r.keys![0], values: [r.clicks, r.impressions, r.position] })),
      pages: pages.map((r) => ({ label: shortPath(r.keys![0]), values: [r.clicks, r.impressions] })),
      countries: countries.map((r) => ({ label: countryName(r.keys![0]), values: [r.clicks] })),
      devices: devices.map((r) => ({ label: DEVICE[r.keys![0]] ?? r.keys![0], values: [r.clicks] })),
    };
  });
}

/** Search Console gives ISO 3166 alpha-3 codes ("nga"). */
function countryName(code: string): string {
  if (code.toLowerCase() === "zzz") return "Unknown";
  const alpha3: Record<string, string> = { nga: "NG", gha: "GH", gbr: "GB", usa: "US", can: "CA", ken: "KE", zaf: "ZA", ind: "IN", deu: "DE", irl: "IE", are: "AE", nld: "NL", fra: "FR", aus: "AU" };
  const two = alpha3[code.toLowerCase()];
  if (!two) return code.toUpperCase();
  try {
    return new Intl.DisplayNames(["en-GB"], { type: "region" }).of(two) ?? two;
  } catch {
    return two;
  }
}

// ---------- Visitors (GA4)

type GaResponse = { rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[] };

async function ga(
  cfg: GoogleConfig,
  w: { start: string; end: string },
  metrics: string[],
  dimension?: string,
  limit = 10,
): Promise<{ key: string; values: number[] }[]> {
  const r = await googlePost<GaResponse>(cfg, "ga", `/v1beta/properties/${cfg.ga4Property}:runReport`, {
    dateRanges: [{ startDate: w.start, endDate: w.end }],
    metrics: metrics.map((name) => ({ name })),
    ...(dimension
      ? {
          dimensions: [{ name: dimension }],
          orderBys: dimension === "date" ? [{ dimension: { dimensionName: "date" } }] : [{ metric: { metricName: metrics[0] }, desc: true }],
          limit: dimension === "date" ? 400 : limit,
        }
      : {}),
  });
  return (r.rows ?? []).map((row) => ({ key: row.dimensionValues?.[0]?.value ?? "", values: (row.metricValues ?? []).map((m) => Number(m.value) || 0) }));
}

const TOTAL_METRICS = ["activeUsers", "sessions", "screenPageViews", "engagementRate", "averageSessionDuration"];
const gaTotals = (rows: { values: number[] }[]) => {
  const v = rows[0]?.values ?? [];
  return { users: v[0] ?? 0, sessions: v[1] ?? 0, views: v[2] ?? 0, engagement: v[3] ?? 0, duration: v[4] ?? 0 };
};
const gaDate = (d: string) => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
const notSet = (k: string) => (k === "(not set)" || k === "" ? "Unknown" : k);

export async function visitorReport(s: Staff, range: Range): Promise<VisitorReport> {
  mustSee(s);
  const cfg = needs(googleConfig(), "ga");
  const { cur, prev } = windows(range);
  return remember(`ga:${cfg.ga4Property}:${cur.start}:${cur.end}`, 10 * 60_000, async () => {
    const [tot, ptot, byDate, pages, channels, sources, countries, devices] = await Promise.all([
      ga(cfg, cur, TOTAL_METRICS),
      ga(cfg, prev, TOTAL_METRICS),
      ga(cfg, cur, ["activeUsers"], "date"),
      ga(cfg, cur, ["screenPageViews", "activeUsers"], "pagePath", 10),
      ga(cfg, cur, ["sessions"], "sessionDefaultChannelGroup", 8),
      ga(cfg, cur, ["sessions"], "sessionSource", 8),
      ga(cfg, cur, ["activeUsers"], "country", 8),
      ga(cfg, cur, ["activeUsers"], "deviceCategory", 5),
    ]);
    return {
      range: cur,
      totals: gaTotals(tot),
      previous: gaTotals(ptot),
      users: series(cur.start, cur.end, new Map(byDate.map((r) => [gaDate(r.key), r.values[0]]))),
      pages: pages.map((r) => ({ label: r.key || "/", values: r.values })),
      channels: channels.map((r) => ({ label: notSet(r.key), values: r.values })),
      sources: sources.map((r) => ({ label: r.key === "(direct)" ? "Direct (typed or bookmarked)" : notSet(r.key), values: r.values })),
      countries: countries.map((r) => ({ label: notSet(r.key), values: r.values })),
      devices: devices.map((r) => ({ label: DEVICE[r.key] ?? notSet(r.key), values: r.values })),
    };
  });
}

/** People on the website in the last 30 minutes, and what they're reading. */
export async function liveReport(s: Staff): Promise<LiveReport> {
  mustSee(s);
  const cfg = needs(googleConfig(), "ga");
  return remember(`live:${cfg.ga4Property}`, 20_000, async () => {
    const path = `/v1beta/properties/${cfg.ga4Property}:runRealtimeReport`;
    const [total, pages] = await Promise.all([
      googlePost<GaResponse>(cfg, "ga", path, { metrics: [{ name: "activeUsers" }] }),
      googlePost<GaResponse>(cfg, "ga", path, {
        dimensions: [{ name: "unifiedScreenName" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 5,
      }),
    ]);
    return {
      users: Number(total.rows?.[0]?.metricValues?.[0]?.value ?? 0) || 0,
      pages: (pages.rows ?? []).map((r) => ({ label: notSet(r.dimensionValues?.[0]?.value ?? ""), values: [Number(r.metricValues?.[0]?.value ?? 0) || 0] })),
      at: new Date().toISOString(),
    };
  });
}

/** For the dashboard: the last 28 days in two numbers. Null when not connected or failing. */
export async function dashboardSummary(s: Staff): Promise<{ visitors: number | null; clicks: number | null } | null> {
  if (!can(s.role, "analytics.view")) return null;
  const st = analyticsStatus();
  if (!st.configured) return null;
  const [v, c] = await Promise.all([
    st.visitors ? visitorReport(s, "28").then((r) => r.totals.users).catch(() => null) : null,
    st.search ? searchReport(s, "28").then((r) => r.totals.clicks).catch(() => null) : null,
  ]);
  return v === null && c === null ? null : { visitors: v, clicks: c };
}
