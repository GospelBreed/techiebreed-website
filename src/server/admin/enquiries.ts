import "server-only";
import { enquiryRows, enquirySubject } from "@/lib/email";
import type { Enquiry } from "@/lib/schemas";
import { logActivity } from "./activity";
import type { Staff } from "./auth";
import { can } from "./roles";
import { AdminError } from "./staff";
import { serviceClient, supabaseConfigured } from "./supabase";

/**
 * Enquiries from the website forms (discovery and Academy interest).
 * The contact form saves every enquiry here as well as emailing it, so nothing
 * is lost if an email goes astray. Support, Admins and the Super Admin handle them.
 */

export const STATUSES = ["new", "replied", "closed", "spam"] as const;
export type EnquiryStatus = (typeof STATUSES)[number];
export const STATUS_LABEL: Record<EnquiryStatus, string> = { new: "New", replied: "Replied", closed: "Closed", spam: "Spam" };
export const STATUS_STYLE: Record<EnquiryStatus, string> = {
  new: "bg-butter text-[#7a5a00]",
  replied: "bg-[#eaf7ec] text-leaf",
  closed: "bg-mint text-muted",
  spam: "bg-blush text-[#8a1c14]",
};

export type EnquiryRow = {
  id: string;
  created_at: string;
  updated_at: string;
  kind: "discovery" | "academy";
  name: string;
  email: string;
  company: string | null;
  interest: string | null;
  payload: Record<string, unknown>;
  status: EnquiryStatus;
  assigned_to: string | null;
};

export type EnquiryNote = { id: number; author_name: string; body: string; at: string };

export const PAGE_SIZE = 25;

/** Public form → inbox. Returns the new id, or null if storing isn't possible. Never throws. */
export async function saveEnquiry(e: Enquiry): Promise<string | null> {
  if (!supabaseConfigured()) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { website, ...answers } = e;
  try {
    const { data, error } = await serviceClient()
      .from("site_enquiries")
      .insert({
        kind: e.kind,
        name: e.name,
        email: e.email,
        company: e.kind === "discovery" ? e.company : null,
        interest: e.kind === "discovery" ? e.interest : e.programme,
        payload: answers,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return (data as { id: string }).id;
  } catch (err) {
    console.error("[enquiries] saving failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

/** Keeps only characters that are safe inside a PostgREST filter. */
function searchTerm(q: string): string {
  return q.replace(/[^\p{L}\p{N}@.\-+_' ]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export type ListFilter = { status?: EnquiryStatus | "all" | "open"; q?: string; page?: number; mine?: string };

export async function listEnquiries(s: Staff, f: ListFilter) {
  if (!can(s.role, "enquiries.view")) throw new AdminError("Your role can't see enquiries.");
  const page = Math.max(1, f.page ?? 1);
  let query = serviceClient()
    .from("site_enquiries")
    .select("id,created_at,updated_at,kind,name,email,company,interest,status,assigned_to", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const status = f.status ?? "open";
  if (status === "open") query = query.in("status", ["new", "replied"]);
  else if (status !== "all") query = query.eq("status", status);
  if (f.mine) query = query.eq("assigned_to", f.mine);
  const q = searchTerm(f.q ?? "");
  if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%,interest.ilike.%${q}%`);
  const { data, error, count } = await query;
  if (error) throw new AdminError(error.message);
  return { rows: (data ?? []) as Omit<EnquiryRow, "payload">[], total: count ?? 0, page };
}

export async function statusCounts(): Promise<Record<EnquiryStatus, number>> {
  const sb = serviceClient();
  const entries = await Promise.all(
    STATUSES.map(async (st) => {
      const { count } = await sb.from("site_enquiries").select("id", { count: "exact", head: true }).eq("status", st);
      return [st, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<EnquiryStatus, number>;
}

export async function newEnquiryCount(): Promise<number> {
  const { count } = await serviceClient().from("site_enquiries").select("id", { count: "exact", head: true }).eq("status", "new");
  return count ?? 0;
}

export async function getEnquiry(s: Staff, id: string) {
  if (!can(s.role, "enquiries.view")) throw new AdminError("Your role can't see enquiries.");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const sb = serviceClient();
  const [{ data, error }, notes] = await Promise.all([
    sb.from("site_enquiries").select("*").eq("id", id).maybeSingle(),
    sb.from("site_enquiry_notes").select("id,author_name,body,at").eq("enquiry_id", id).order("at", { ascending: true }),
  ]);
  if (error) throw new AdminError(error.message);
  if (!data) return null;
  return { enquiry: data as EnquiryRow, notes: (notes.data ?? []) as EnquiryNote[] };
}

/** The form answers as label/value rows, the same as in the notification email. */
export function answerRows(e: EnquiryRow): [string, string][] {
  try {
    return enquiryRows({ ...(e.payload as object), kind: e.kind, website: "" } as Enquiry);
  } catch {
    return Object.entries(e.payload).map(([k, v]) => [k, String(v ?? "")]);
  }
}

export function replySubject(e: EnquiryRow): string {
  try {
    return `Re: ${enquirySubject({ ...(e.payload as object), kind: e.kind, website: "" } as Enquiry)}`;
  } catch {
    return "Re: your enquiry to TechieBreed";
  }
}

async function mustExist(id: string) {
  const { data } = await serviceClient().from("site_enquiries").select("id,name,status,assigned_to").eq("id", id).maybeSingle();
  if (!data) throw new AdminError("That enquiry no longer exists.");
  return data as { id: string; name: string; status: EnquiryStatus; assigned_to: string | null };
}

export async function setStatus(s: Staff, id: string, status: EnquiryStatus) {
  if (!can(s.role, "enquiries.manage")) throw new AdminError("Your role can't change enquiries.");
  if (!STATUSES.includes(status)) throw new AdminError("Choose a valid status.");
  const e = await mustExist(id);
  if (e.status === status) return;
  const { error } = await serviceClient().from("site_enquiries").update({ status }).eq("id", id);
  if (error) throw new AdminError(error.message);
  await logActivity(s, { action: "enquiry.status", summary: `Marked the enquiry from ${e.name} as ${STATUS_LABEL[status].toLowerCase()}`, targetType: "enquiry", targetId: id });
}

export async function assign(s: Staff, id: string, staffId: string | null) {
  if (!can(s.role, "enquiries.manage")) throw new AdminError("Your role can't change enquiries.");
  const e = await mustExist(id);
  let name = "nobody";
  if (staffId) {
    const { data } = await serviceClient().from("site_staff").select("id,full_name,role,status").eq("id", staffId).maybeSingle();
    const row = data as { full_name: string; role: Staff["role"]; status: Staff["status"] } | null;
    if (!row || row.status === "suspended" || !can(row.role, "enquiries.manage")) throw new AdminError("That person can't handle enquiries.");
    name = row.full_name;
  }
  if (e.assigned_to === staffId) return;
  const { error } = await serviceClient().from("site_enquiries").update({ assigned_to: staffId }).eq("id", id);
  if (error) throw new AdminError(error.message);
  await logActivity(s, { action: "enquiry.assign", summary: `Assigned the enquiry from ${e.name} to ${name}`, targetType: "enquiry", targetId: id });
}

export async function addNote(s: Staff, id: string, body: string) {
  if (!can(s.role, "enquiries.manage")) throw new AdminError("Your role can't add notes.");
  const text = body.trim();
  if (text.length < 2) throw new AdminError("Write a note first.");
  if (text.length > 4000) throw new AdminError("Keep notes under 4,000 characters.");
  const e = await mustExist(id);
  const { error } = await serviceClient().from("site_enquiry_notes").insert({ enquiry_id: id, author_id: s.id, author_name: s.fullName, body: text });
  if (error) throw new AdminError(error.message);
  await logActivity(s, { action: "enquiry.note", summary: `Added a note to the enquiry from ${e.name}`, targetType: "enquiry", targetId: id });
}

export async function deleteEnquiry(s: Staff, id: string) {
  if (!can(s.role, "enquiries.delete")) throw new AdminError("Only the Super Admin can delete enquiries.");
  const e = await mustExist(id);
  const { error } = await serviceClient().from("site_enquiries").delete().eq("id", id);
  if (error) throw new AdminError(error.message);
  await logActivity(s, { action: "enquiry.delete", summary: `Deleted the enquiry from ${e.name}`, targetType: "enquiry" });
}

/** People an enquiry can be assigned to. */
export async function handlers(): Promise<{ id: string; name: string }[]> {
  const { data } = await serviceClient().from("site_staff").select("id,full_name,role,status").neq("status", "suspended").order("full_name");
  return ((data ?? []) as { id: string; full_name: string; role: Staff["role"] }[])
    .filter((r) => can(r.role, "enquiries.manage"))
    .map((r) => ({ id: r.id, name: r.full_name }));
}

function csvCell(v: unknown): string {
  let s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
}

/** All enquiries (optionally one status) as CSV for spreadsheets. */
export async function exportCsv(s: Staff, status?: EnquiryStatus): Promise<string> {
  if (!can(s.role, "enquiries.manage")) throw new AdminError("Your role can't export enquiries.");
  let q = serviceClient()
    .from("site_enquiries")
    .select("created_at,kind,status,name,email,company,interest,payload")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw new AdminError(error.message);
  const header = ["Received", "Form", "Status", "Name", "Email", "Company", "Interested in", "All answers"];
  const lines = ((data ?? []) as EnquiryRow[]).map((r) =>
    [r.created_at, r.kind === "discovery" ? "Discovery" : "Academy", STATUS_LABEL[r.status], r.name, r.email, r.company, r.interest, r.payload]
      .map(csvCell)
      .join(","),
  );
  await logActivity(s, { action: "enquiry.export", summary: `Downloaded ${lines.length} enquiries as a spreadsheet`, targetType: "enquiry" });
  return "﻿" + [header.map(csvCell).join(","), ...lines].join("\r\n") + "\r\n";
}
