import { NextResponse, type NextRequest } from "next/server";
import { emailConfig, sendEnquiry } from "@/lib/email";
import { rateLimited } from "@/lib/rateLimit";
import { enquirySchema, fieldErrors, type ApiResult } from "@/lib/schemas";

/** Receives the discovery and Academy interest forms and emails them to the team. */
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

  // Honeypot filled in: almost certainly a bot. Pretend it worked and send nothing.
  if (enquiry.website) return json({ ok: true });

  const config = emailConfig();
  if (!config) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] Email is not configured; enquiry not sent:", enquiry);
      return json({ ok: true });
    }
    console.error("[contact] RESEND_API_KEY or CONTACT_TO_EMAIL is missing");
    return json(
      { ok: false, message: "Our contact form isn't connected yet. Please email us directly while we fix it." },
      503,
    );
  }

  try {
    await sendEnquiry(config, enquiry);
  } catch (err) {
    console.error("[contact] Sending failed:", err instanceof Error ? err.message : err);
    return json({ ok: false, message: "We couldn't send your message just now. Please try again in a moment." }, 502);
  }

  return json({ ok: true });
}
