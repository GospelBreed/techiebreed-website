import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, CircleAlert, Clock, ExternalLink, FileText, Briefcase, Inbox, ShieldCheck, Users } from "lucide-react";
import { Notice } from "@/components/admin/ui";
import { recentActivity, type ActivityRow } from "@/server/admin/activity";
import { requireStaff, type Staff } from "@/server/admin/auth";
import { can, ROLE_LABEL, ROLE_SUMMARY } from "@/server/admin/roles";
import { listEnquiries, STATUS_LABEL, STATUS_STYLE, statusCounts } from "@/server/admin/enquiries";
import { listStaff } from "@/server/admin/staff";
import { githubConfig } from "@/server/mcp/github";
import { listArticles, listCases, publishStatus } from "@/server/mcp/tools";

export const metadata: Metadata = { title: "Dashboard" };

function when(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });
}

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-[18px] border border-line bg-white p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-bold text-forest">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Stat({ icon: Icon, label, value, sub }: { icon: typeof FileText; label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-[18px] border border-line bg-white p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-mint text-forest">
        <Icon aria-hidden className="size-5" strokeWidth={1.8} />
      </span>
      <div>
        <p className="text-[26px] leading-none font-bold text-ink">{value}</p>
        <p className="mt-1 text-[13.5px] text-muted">
          {label}
          {sub ? ` · ${sub}` : ""}
        </p>
      </div>
    </div>
  );
}

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (e) {
    console.error("[admin] dashboard data failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

export default async function DashboardPage({ searchParams }: PageProps<"/admin">) {
  const staff = await requireStaff("dashboard.view");
  const sp = await searchParams;
  const github = Boolean(githubConfig());
  const seesContent = can(staff.role, "articles.view") || can(staff.role, "cases.view");

  const seesEnquiries = can(staff.role, "enquiries.view");
  const [articles, cases, status, activity, team, enquiryCounts, latestEnquiries] = await Promise.all([
    github && can(staff.role, "articles.view") ? safe(listArticles) : null,
    github && can(staff.role, "cases.view") ? safe(listCases) : null,
    github && seesContent ? safe(() => publishStatus()) : null,
    can(staff.role, "activity.view") ? safe(() => recentActivity(8)) : null,
    can(staff.role, "staff.manage") ? safe(listStaff) : null,
    seesEnquiries ? safe(statusCounts) : null,
    seesEnquiries ? safe(async () => (await listEnquiries(staff, { status: "open" })).rows.slice(0, 5)) : null,
  ]);

  const published = articles?.filter((a) => a?.status === "published").length ?? 0;
  const firstName = staff.fullName.split(" ")[0];

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-display text-[30px] leading-tight font-semibold text-forest md:text-[36px]">Hello, {firstName}</h1>
        <p className="mt-1 text-[15px] text-ink-soft">
          You&rsquo;re signed in as <strong className="text-forest">{ROLE_LABEL[staff.role]}</strong>. {ROLE_SUMMARY[staff.role]}
        </p>
      </header>

      {sp.denied && <Notice kind="error">Your role doesn&rsquo;t include that area. Ask the Super Admin if you need access.</Notice>}
      {!staff.mfaEnabled && (
        <Notice kind="info">
          <span className="flex flex-wrap items-center gap-2">
            <ShieldCheck aria-hidden className="size-[18px] text-leaf" />
            Protect your account with an authenticator app.
            <Link href="/admin/account" className="font-semibold text-leaf underline underline-offset-4 hover:text-forest">
              Set it up
            </Link>
          </span>
        </Notice>
      )}
      {seesContent && !github && (
        <Notice kind="error">Content isn&rsquo;t connected: GITHUB_TOKEN and GITHUB_REPO are missing in Vercel.</Notice>
      )}

      {(articles || cases || team || enquiryCounts) && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enquiryCounts && <Stat icon={Inbox} label="New enquiries" value={enquiryCounts.new} sub={`${enquiryCounts.replied} replied, still open`} />}
          {articles && <Stat icon={FileText} label="Articles published" value={published} sub={`${articles.length - published} hidden`} />}
          {cases && <Stat icon={Briefcase} label="Case studies" value={cases.length} />}
          {team && <Stat icon={Users} label="Team members" value={team.length} sub={`${team.filter((t) => t.status === "invited").length} invited`} />}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {status && (
          <Card
            title="Website status"
            action={
              <Link href="/" target="_blank" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-leaf hover:text-forest">
                View site <ExternalLink aria-hidden className="size-4" />
              </Link>
            }
          >
            <div className="flex items-start gap-3">
              {status.state === "live" ? (
                <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-sprout" />
              ) : status.state === "deploying" ? (
                <Clock aria-hidden className="mt-0.5 size-5 shrink-0 text-sun" />
              ) : (
                <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-coral" />
              )}
              <div>
                <p className="font-semibold text-ink">
                  {status.state === "live" ? "Up to date" : status.state === "deploying" ? "Publishing the latest change…" : "Status unknown"}
                </p>
                <p className="mt-0.5 text-[14px] text-muted">{status.message}</p>
              </div>
            </div>
          </Card>
        )}

        {articles && (
          <Card title="Latest articles">
            <ul className="grid gap-3">
              {articles.slice(0, 4).map((a) => (
                <li key={a!.slug} className="flex items-start justify-between gap-3 text-[14.5px]">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink">{String(a!.title)}</span>
                    <span className="text-[13px] text-muted">{a!.date}</span>
                  </span>
                  <span
                    className={
                      a!.status === "published"
                        ? "shrink-0 rounded-full bg-[#eaf7ec] px-2.5 py-0.5 text-[12px] font-semibold text-leaf"
                        : "shrink-0 rounded-full bg-mint px-2.5 py-0.5 text-[12px] font-semibold text-muted"
                    }
                  >
                    {a!.status === "published" ? "Live" : "Hidden"}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {latestEnquiries && (
        <Card
          title="Open enquiries"
          action={
            <Link href="/admin/enquiries" className="text-[14px] font-semibold text-leaf hover:text-forest">
              See all
            </Link>
          }
        >
          {latestEnquiries.length === 0 ? (
            <p className="text-[14.5px] text-muted">No open enquiries. New messages from the website appear here.</p>
          ) : (
            <ul className="divide-y divide-line">
              {latestEnquiries.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/enquiries/${e.id}`} className="flex items-center justify-between gap-3 py-2.5 text-[14.5px] hover:text-forest">
                    <span className="min-w-0">
                      <span className={e.status === "new" ? "block truncate font-bold text-ink" : "block truncate font-medium text-ink"}>{e.name}</span>
                      <span className="block truncate text-[13px] text-muted">{e.interest ?? (e.kind === "academy" ? "Academy" : "Discovery")}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_STYLE[e.status]}`}>{STATUS_LABEL[e.status]}</span>
                      <span className="hidden text-[13px] text-muted sm:inline">{when(e.created_at)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {activity && (
        <Card title="Recent activity">
          {activity.length === 0 ? (
            <p className="text-[14.5px] text-muted">Nothing yet. Changes made in the admin will appear here.</p>
          ) : (
            <ul className="divide-y divide-line">
              {activity.map((a: ActivityRow) => (
                <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5 text-[14.5px]">
                  <span>
                    <strong className="font-semibold text-ink">{a.actor_name}</strong>{" "}
                    <span className="text-ink-soft">{a.summary.charAt(0).toLowerCase() + a.summary.slice(1)}</span>
                  </span>
                  <span className="text-[13px] text-muted">{when(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <YourAccess staff={staff} />
    </div>
  );
}

function YourAccess({ staff }: { staff: Staff }) {
  const areas = [
    { label: "Articles", ok: can(staff.role, "articles.view"), note: can(staff.role, "articles.publish_any") ? "publish any" : can(staff.role, "articles.publish_own") ? "publish your own" : can(staff.role, "articles.edit_any") ? "drafts for review" : "" },
    { label: "Case studies", ok: can(staff.role, "cases.view"), note: can(staff.role, "cases.publish") ? "publish" : "drafts for review" },
    { label: "Enquiries", ok: can(staff.role, "enquiries.view"), note: can(staff.role, "enquiries.delete") ? "including delete" : "" },
    { label: "Settings", ok: can(staff.role, "settings.edit"), note: can(staff.role, "settings.ads") ? "including ads" : "" },
    { label: "Users", ok: can(staff.role, "staff.manage"), note: "" },
  ];
  return (
    <Card title="Your access">
      <ul className="flex flex-wrap gap-2">
        {areas.map((a) => (
          <li
            key={a.label}
            className={
              a.ok
                ? "rounded-full bg-[#eaf7ec] px-3 py-1 text-[13px] font-semibold text-pine"
                : "rounded-full bg-mint px-3 py-1 text-[13px] text-muted line-through decoration-muted/50"
            }
          >
            {a.label}
            {a.ok && a.note ? ` · ${a.note}` : ""}
          </li>
        ))}
      </ul>
    </Card>
  );
}
