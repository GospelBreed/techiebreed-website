import "server-only";
import type { Staff } from "./auth";
import { serviceClient } from "./supabase";

export type ActivityInput = {
  action: string;
  summary: string;
  targetType?: "article" | "case_study" | "settings" | "staff" | "enquiry" | "account";
  targetId?: string;
  commitSha?: string;
  details?: Record<string, unknown>;
};

/** Records what someone did in the admin. Never throws: a logging failure must not undo the action. */
export async function logActivity(actor: Pick<Staff, "id" | "fullName"> | null, a: ActivityInput) {
  const { error } = await serviceClient()
    .from("site_activity")
    .insert({
      actor_id: actor?.id ?? null,
      actor_name: actor?.fullName ?? "System",
      action: a.action,
      summary: a.summary,
      target_type: a.targetType ?? null,
      target_id: a.targetId ?? null,
      commit_sha: a.commitSha ?? null,
      details: a.details ?? {},
    });
  if (error) console.error("[admin] activity log failed:", error.message);
}

export type ActivityRow = {
  id: number;
  at: string;
  actor_name: string;
  action: string;
  summary: string;
  target_type: string | null;
  target_id: string | null;
  commit_sha: string | null;
};

export async function recentActivity(limit = 10): Promise<ActivityRow[]> {
  const { data, error } = await serviceClient()
    .from("site_activity")
    .select("id,at,actor_name,action,summary,target_type,target_id,commit_sha")
    .order("at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as ActivityRow[];
}
