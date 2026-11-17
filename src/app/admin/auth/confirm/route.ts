import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { sessionClient, supabaseConfigured } from "@/server/admin/supabase";

/**
 * Landing point for links in invite and password-reset emails.
 * Exchanges the one-time token for a session, then sends the person on.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") ?? "/admin";
  const next = nextParam.startsWith("/admin") && !nextParam.startsWith("//") ? nextParam : "/admin";

  if (supabaseConfigured() && tokenHash && (type === "invite" || type === "recovery")) {
    const sb = await sessionClient();
    const { error } = await sb.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      // Someone with an existing account who was invited gets a recovery link: send them to the welcome page anyway.
      return NextResponse.redirect(new URL(next, origin));
    }
  }
  return NextResponse.redirect(new URL("/admin/login?error=link_expired", origin));
}
