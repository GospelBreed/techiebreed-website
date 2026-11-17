import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { Notice } from "@/components/admin/ui";
import { requireStaff } from "@/server/admin/auth";
import { can } from "@/server/admin/roles";
import { readSiteSettings } from "@/server/admin/settings";
import { githubConfig } from "@/server/mcp/github";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const staff = await requireStaff("settings.edit");
  const header = (
    <header>
      <h1 className="font-display text-[30px] leading-tight font-semibold text-forest md:text-[36px]">Settings</h1>
      <p className="mt-1 text-[15px] text-ink-soft">Contact details, links and ads used across the website. Changes go live in about 2 minutes.</p>
    </header>
  );
  if (!githubConfig()) {
    return (
      <div className="grid gap-6">
        {header}
        <Notice kind="error">Settings aren&rsquo;t connected: GITHUB_TOKEN and GITHUB_REPO are missing in Vercel.</Notice>
      </div>
    );
  }
  const { settings: s, sha } = await readSiteSettings();
  return (
    <div className="grid gap-6">
      {header}
      <SettingsForm
        sha={sha}
        canAds={can(staff.role, "settings.ads")}
        values={{
          email: s.contact.email,
          phone: s.contact.phone,
          linkedin: s.social.linkedin,
          x: s.social.x,
          instagram: s.social.instagram,
          bookingUrl: s.bookingUrl,
          replyTime: s.replyTime,
          adsEnabled: s.ads.enabled,
        }}
      />
    </div>
  );
}
