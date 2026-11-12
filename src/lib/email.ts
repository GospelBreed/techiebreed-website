import "server-only";
import type { Enquiry } from "./schemas";

/**
 * Sends enquiries to the TechieBreed inbox through Resend's HTTP API.
 * Needs RESEND_API_KEY and CONTACT_TO_EMAIL; CONTACT_FROM_EMAIL must be on a domain verified in Resend.
 */

export type EmailConfig = { apiKey: string; to: string[]; from: string };

export function emailConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  if (!apiKey || to.length === 0) return null;
  const from = process.env.CONTACT_FROM_EMAIL?.trim() || "TechieBreed Website <onboarding@resend.dev>";
  return { apiKey, to, from };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Label/value rows for the email, in reading order. */
export function enquiryRows(e: Enquiry): [string, string][] {
  if (e.kind === "discovery") {
    return [
      ["Name", e.name],
      ["Email", e.email],
      ["Company", e.company],
      ["Role", e.role],
      ["Company size", e.companySize],
      ["Country", e.country],
      ["Interested in", e.interest],
      ...(e.service ? ([["Service page", e.service]] as [string, string][]) : []),
      ["What's taking up the team's time", e.timeDrain],
      ["Tools currently used", e.tools || "—"],
    ];
  }
  return [
    ["Name", e.name],
    ["Email", e.email],
    ["Phone", e.phone || "—"],
    ["Programme", e.programme],
    ["Who it's for", e.learners],
    ["Message", e.message || "—"],
  ];
}

export function enquirySubject(e: Enquiry): string {
  const subject =
    e.kind === "discovery"
      ? `New enquiry: ${e.interest} — ${e.company}`
      : `Academy interest: ${e.programme} — ${e.name}`;
  return subject.replace(/[\r\n]+/g, " ").slice(0, 200);
}

function renderHtml(e: Enquiry): string {
  const rows = enquiryRows(e)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;color:#68686d;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td>` +
        `<td style="padding:8px 12px;color:#1c1c24;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  return `<div style="font-family:Arial,sans-serif;font-size:15px"><h2 style="color:#004c28;margin:0 0 12px">${escapeHtml(
    enquirySubject(e),
  )}</h2><table style="border-collapse:collapse">${rows}</table><p style="color:#68686d;font-size:13px;margin-top:16px">Sent from the website form. Reply to this email to answer ${escapeHtml(
    e.name,
  )} directly.</p></div>`;
}

function renderText(e: Enquiry): string {
  return `${enquirySubject(e)}\n\n${enquiryRows(e)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n")}\n`;
}

export async function sendEnquiry(config: EmailConfig, e: Enquiry): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: config.from,
      to: config.to,
      reply_to: e.email,
      subject: enquirySubject(e),
      html: renderHtml(e),
      text: renderText(e),
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend responded ${res.status}: ${detail.slice(0, 300)}`);
  }
}
