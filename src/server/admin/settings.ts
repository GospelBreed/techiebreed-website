import "server-only";
import { z } from "zod";
import { GitHubError, readFile, writeFile } from "@/server/mcp/github";
import { cfg, SETTINGS } from "@/server/mcp/tools";
import { settingsSchema, type Settings } from "@/server/mcp/validate";
import { logActivity } from "./activity";
import type { Staff } from "./auth";
import { can } from "./roles";
import { AdminError } from "./staff";

/**
 * Site settings (content/settings.json): contact details, social links, booking
 * link, reply time and the ads switch. Saving commits the file to GitHub, so the
 * website updates after the next deploy (about 2 minutes).
 */

export async function readSiteSettings(): Promise<{ settings: Settings; sha: string }> {
  const f = await readFile(cfg(), SETTINGS);
  if (!f) throw new AdminError("content/settings.json is missing from the repository.");
  return { settings: settingsSchema.parse(JSON.parse(f.content)), sha: f.sha };
}

/** "+234 816 588 7386" → "+2348165887386" (used for tap-to-call links). */
export function toE164(phone: string): string | null {
  const t = phone.trim();
  if (!t.startsWith("+")) return null;
  const digits = t.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
}

const https = (label: string) =>
  z
    .string()
    .trim()
    .max(300)
    .refine((v) => /^https:\/\/[^\s]+\.[^\s]+$/.test(v), `${label} must be a full web address starting with https://`);
const optionalHttps = (label: string) => z.union([z.literal(""), https(label)]);

export const settingsInput = z.object({
  email: z.string().trim().pipe(z.email("Enter a valid contact email address.")),
  phone: z.string().trim().min(7, "Enter the phone number.").max(30, "That phone number is too long."),
  linkedin: optionalHttps("The LinkedIn link"),
  x: optionalHttps("The X link"),
  instagram: optionalHttps("The Instagram link"),
  bookingUrl: https("The booking link"),
  replyTime: z.string().trim().min(2, "Enter the reply time, like \"1 hour\".").max(40, "Keep the reply time short, like \"1 hour\"."),
  adsEnabled: z.boolean().optional(),
});
export type SettingsInput = z.infer<typeof settingsInput>;

const FIELD_LABEL: Record<string, string> = {
  "contact.email": "contact email",
  "contact.phone": "phone",
  "social.linkedin": "LinkedIn",
  "social.x": "X",
  "social.instagram": "Instagram",
  bookingUrl: "booking link",
  replyTime: "reply time",
  "ads.enabled": "ads",
};

export async function saveSiteSettings(s: Staff, input: SettingsInput, baseSha: string) {
  if (!can(s.role, "settings.edit")) throw new AdminError("Your role can't change settings.");
  const phoneE164 = toE164(input.phone);
  if (!phoneE164) throw new AdminError("Write the phone number in international format, starting with + (for example +234 816 588 7386).");

  const { settings: current, sha } = await readSiteSettings();
  if (sha !== baseSha) throw new AdminError("Someone else changed the settings while you were editing. Reload the page to see their changes, then try again.");

  const wantsAdsChange = input.adsEnabled !== undefined && input.adsEnabled !== current.ads.enabled;
  if (wantsAdsChange && !can(s.role, "settings.ads")) throw new AdminError("Only the Super Admin can switch ads on or off.");

  const next: Settings = settingsSchema.parse({
    contact: { email: input.email, phone: input.phone, phoneE164 },
    social: { linkedin: input.linkedin, x: input.x, instagram: input.instagram },
    bookingUrl: input.bookingUrl,
    replyTime: input.replyTime,
    ads: { enabled: wantsAdsChange ? input.adsEnabled! : current.ads.enabled },
  });

  const changed: string[] = [];
  const flat = (o: Settings) =>
    ({
      "contact.email": o.contact.email,
      "contact.phone": o.contact.phone,
      "social.linkedin": o.social.linkedin,
      "social.x": o.social.x,
      "social.instagram": o.social.instagram,
      bookingUrl: o.bookingUrl,
      replyTime: o.replyTime,
      "ads.enabled": String(o.ads.enabled),
    }) as Record<string, string>;
  const a = flat(current);
  const b = flat(next);
  for (const k of Object.keys(b)) if (a[k] !== b[k]) changed.push(FIELD_LABEL[k]);
  if (changed.length === 0) return { commit: null, changed };

  let commit: string;
  try {
    const r = await writeFile(
      cfg(),
      SETTINGS,
      `${JSON.stringify(next, null, 2)}\n`,
      `Admin: settings — ${changed.join(", ")} (${s.fullName})`,
      sha,
      { name: s.fullName },
    );
    commit = r.commit;
  } catch (e) {
    if (e instanceof GitHubError && (e.status === 409 || e.status === 422)) {
      throw new AdminError("Someone else changed the settings at the same moment. Reload the page and try again.");
    }
    throw e;
  }

  const adsNote = wantsAdsChange ? ` Ads switched ${next.ads.enabled ? "on" : "off"}.` : "";
  await logActivity(s, {
    action: "settings.update",
    summary: `Changed the site settings (${changed.join(", ")}).${adsNote}`,
    targetType: "settings",
    targetId: SETTINGS,
    commitSha: commit,
    details: { changed },
  });
  return { commit, changed };
}
