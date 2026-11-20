import { liveReport } from "@/server/admin/analytics";
import { requireStaff } from "@/server/admin/auth";
import { GoogleError } from "@/server/admin/google";

/** Live visitors for the Analytics page (polled every 30 seconds). */
export async function GET() {
  const staff = await requireStaff("analytics.view");
  const headers = { "Cache-Control": "private, no-store" };
  try {
    return Response.json({ data: await liveReport(staff) }, { headers });
  } catch (e) {
    const message = e instanceof GoogleError ? e.message : "Couldn't load live visitors.";
    if (!(e instanceof GoogleError)) console.error("[analytics] live failed:", e instanceof Error ? e.message : e);
    return Response.json({ error: "analytics_unavailable", message }, { status: 502, headers });
  }
}
