import { NextResponse, type NextRequest } from "next/server";
import { emailConfig, sendEnquiry } from "@/lib/email";
import { rateLimited } from "@/lib/rateLimit";
import { enquirySchema, fieldErrors, type ApiResult } from "@/lib/schemas";
import { site } from "@/lib/site";
import { saveEnquiry } from "@/server/admin/enquiries";

/**
 * Receives the discovery and Academy interest forms. Each enquiry is saved to the
 * admin inbox (Supabase) and emailed to the team; it succeeds if either works.
 */
export async function POST(req: NextRequest) {
  const json = (body: ApiResult, status = 200) => NextResponse.json(body, { status });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) {
    return json({ ok: false, message: "You've sent several messages in a short time. Please wait a few minutes and try again." }, 429);
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, message: "We couldn't read that form submission. Please try again." }, 400);
  }

  const parsed = enquirySchema.safeParse(payload);
  if (!parsed.success) {
    return json({ ok: false, message: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) }, 422);
  }
  const enquiry = parsed.data;

  // Honeypot filled in: almost certainly a bot. Pretend it worked and store nothing.
  if (enquiry.website) return json({ ok: true });

  const savedId = await saveEnquiry(enquiry);
  const adminUrl = savedId ? `${site.url}/admin/enquiries/${savedId}` : undefined;

  const config = emailConfig();
  let emailed = false;
  if (config) {
    try {
      await sendEnquiry(config, enquiry, adminUrl);
      emailed = true;
    } catch (err) {
      console.error("[contact] Sending failed:", err instanceof Error ? err.message : err);
    }
  } else if (process.env.NODE_ENV === "production") {
    console.error("[contact] RESEND_API_KEY or CONTACT_TO_EMAIL is missing");
  }

  if (savedId || emailed) return json({ ok: true });

  if (!config && process.env.NODE_ENV !== "production") {
    console.info("[contact] Neither the inbox nor email is configured; enquiry not stored:", enquiry);
    return json({ ok: true });
  }
  return json(
    { ok: false, message: "We couldn't send your message just now. Please try again in a moment, or email us directly." },
    502,
  );
}
