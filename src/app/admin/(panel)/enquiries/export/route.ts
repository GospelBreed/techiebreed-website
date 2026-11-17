import { requireStaff } from "@/server/admin/auth";
import { exportCsv, STATUSES, type EnquiryStatus } from "@/server/admin/enquiries";

/** Downloads enquiries as a CSV file that opens in Excel or Google Sheets. */
export async function GET(req: Request) {
  const staff = await requireStaff("enquiries.manage");
  const s = new URL(req.url).searchParams.get("status");
  const status = STATUSES.includes(s as EnquiryStatus) ? (s as EnquiryStatus) : undefined;
  const csv = await exportCsv(staff, status);
  const day = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="techiebreed-enquiries-${status ?? "all"}-${day}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
