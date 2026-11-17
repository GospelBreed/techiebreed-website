import "server-only";
import { site } from "@/lib/site";

/** Transactional emails for the admin (invites, password resets), sent through Resend. */

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function sendAdminEmail(opts: {
  to: string;
  subject: string;
  heading: string;
  lines: string[];
  button: { label: string; url: string };
  footnote?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      // Local development without email: print the link so the flow can still be tested.
      console.info(`[admin email → ${opts.to}] ${opts.subject}
${opts.button.label}: ${opts.button.url}`);
      return;
    }
    throw new Error("Email isn't set up (RESEND_API_KEY / CONTACT_FROM_EMAIL).");
  }

  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1c1c24;max-width:520px">
  <p style="font-size:20px;font-weight:bold;color:#004c28;margin:0 0 16px">${escapeHtml(opts.heading)}</p>
  ${opts.lines.map((l) => `<p style="margin:0 0 12px;line-height:1.55">${escapeHtml(l)}</p>`).join("")}
  <p style="margin:24px 0"><a href="${escapeHtml(opts.button.url)}" style="background:#2dbd32;color:#0d2a1a;font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:999px;display:inline-block">${escapeHtml(opts.button.label)}</a></p>
  ${opts.footnote ? `<p style="color:#68686d;font-size:13px;line-height:1.5">${escapeHtml(opts.footnote)}</p>` : ""}
  <p style="color:#68686d;font-size:13px;margin-top:24px">TechieBreed · ${escapeHtml(site.url.replace(/^https?:\/\//, ""))}</p>
</div>`;
  const text = `${opts.heading}\n\n${opts.lines.join("\n\n")}\n\n${opts.button.label}: ${opts.button.url}\n\n${opts.footnote ?? ""}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, html, text }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}`);
}
