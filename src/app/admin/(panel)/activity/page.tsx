import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { UndoButton } from "@/components/admin/ContentControls";
import { Notice } from "@/components/admin/ui";
import { recentActivity } from "@/server/admin/activity";
import { requireStaff } from "@/server/admin/auth";
import { can } from "@/server/admin/roles";
import { githubConfig, recentCommits } from "@/server/mcp/github";

export const metadata: Metadata = { title: "Activity" };

function when(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });
}

/** Content changes made through the admin or the Claude connector can be undone from here. */
const UNDOABLE = /^(Admin: (publish|update|show|hide)|Website connector: (publish|draft|edit|show|hide|add|update))/;

export default async function ActivityPage() {
  const staff = await requireStaff("activity.view");
  const gh = githubConfig();
  const [activity, commits] = await Promise.all([recentActivity(60), gh ? recentCommits(gh, 25) : Promise.resolve([])]);
  const canUndo = can(staff.role, "activity.undo");

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-display text-[30px] leading-tight font-semibold text-forest md:text-[36px]">Activity</h1>
        <p className="mt-1 text-[15px] text-ink-soft">Who did what, and every change that went live.</p>
      </header>

      <section className="rounded-[18px] border border-line bg-white">
        <div className="px-5 pt-5 md:px-6">
          <h2 className="text-[16px] font-bold text-forest">Changes to the live website</h2>
          <p className="text-[13.5px] text-muted">
            Includes changes from the admin and from Claude.{canUndo ? " Undo puts the previous version back; a newly published item is hidden instead." : ""}
          </p>
        </div>
        {!gh ? (
          <div className="p-5">
            <Notice kind="error">GITHUB_TOKEN and GITHUB_REPO are missing in Vercel.</Notice>
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {commits.map((c) => (
              <li key={c.sha} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-6">
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-medium text-ink">{c.message}</p>
                  <p className="text-[12.5px] text-muted">
                    {c.author} · {when(c.date)} ·{" "}
                    <a href={c.url} target="_blank" className="inline-flex items-center gap-0.5 text-leaf hover:text-forest">
                      {c.sha.slice(0, 7)} <ExternalLink aria-hidden className="size-3" />
                    </a>
                  </p>
                </div>
                {canUndo && UNDOABLE.test(c.message) && <UndoButton sha={c.sha} label={c.message} />}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-[18px] border border-line bg-white">
        <h2 className="px-5 pt-5 text-[16px] font-bold text-forest md:px-6">Admin activity</h2>
        {activity.length === 0 ? (
          <p className="px-5 py-6 text-[14.5px] text-muted md:px-6">Nothing yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {activity.map((a) => (
              <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-2.5 text-[14.5px] md:px-6">
                <span>
                  <strong className="font-semibold text-ink">{a.actor_name}</strong>{" "}
                  <span className="text-ink-soft">{a.summary.charAt(0).toLowerCase() + a.summary.slice(1)}</span>
                </span>
                <span className="text-[12.5px] text-muted">{when(a.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
