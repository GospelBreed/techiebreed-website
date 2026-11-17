"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireStaff } from "../auth";
import { saveSiteSettings, settingsInput } from "../settings";
import { AdminError } from "../staff";
import { GitHubError } from "@/server/mcp/github";

export type SettingsState = { ok?: boolean; error?: string; message?: string; fieldErrors?: Record<string, string> };

export async function settingsAction(_: SettingsState, form: FormData): Promise<SettingsState> {
  const staff = await requireStaff("settings.edit");
  const raw = {
    email: String(form.get("email") ?? ""),
    phone: String(form.get("phone") ?? ""),
    linkedin: String(form.get("linkedin") ?? ""),
    x: String(form.get("x") ?? ""),
    instagram: String(form.get("instagram") ?? ""),
    bookingUrl: String(form.get("bookingUrl") ?? ""),
    replyTime: String(form.get("replyTime") ?? ""),
    adsEnabled: form.has("adsField") ? form.get("adsEnabled") === "on" : undefined,
  };
  const parsed = settingsInput.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const k = String(i.path[0] ?? "form");
      fieldErrors[k] ??= i.message;
    }
    return { error: "Please check the highlighted fields.", fieldErrors };
  }
  try {
    const r = await saveSiteSettings(staff, parsed.data, String(form.get("sha") ?? ""));
    revalidatePath("/admin/settings");
    if (!r.commit) return { ok: true, message: "Nothing changed." };
    return { ok: true, message: `Saved (${r.changed.join(", ")}). The website updates in about 2 minutes.` };
  } catch (e) {
    unstable_rethrow(e);
    if (e instanceof AdminError) return { error: e.message };
    if (e instanceof GitHubError) return { error: "Couldn't reach GitHub to save. Try again in a minute." };
    console.error("[admin] settings failed:", e instanceof Error ? e.message : e);
    return { error: "Something went wrong. Try again." };
  }
}
