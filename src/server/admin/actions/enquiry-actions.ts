"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { requireStaff } from "../auth";
import { addNote, assign, deleteEnquiry, setStatus, STATUSES, type EnquiryStatus } from "../enquiries";
import { AdminError } from "../staff";

export type EnquiryState = { ok?: boolean; error?: string; message?: string };

function fail(e: unknown): EnquiryState {
  unstable_rethrow(e);
  if (e instanceof AdminError) return { error: e.message };
  console.error("[admin] enquiry action failed:", e instanceof Error ? e.message : e);
  return { error: "Something went wrong. Try again." };
}

/** Status, assignment and notes on one enquiry. */
export async function enquiryAction(_: EnquiryState, form: FormData): Promise<EnquiryState> {
  const staff = await requireStaff("enquiries.manage");
  const id = String(form.get("id") ?? "");
  const intent = String(form.get("intent") ?? "");
  try {
    let message: string;
    if (intent === "status") {
      const status = String(form.get("status") ?? "") as EnquiryStatus;
      if (!STATUSES.includes(status)) throw new AdminError("Choose a valid status.");
      await setStatus(staff, id, status);
      message = "Status updated.";
    } else if (intent === "assign") {
      const to = String(form.get("assignee") ?? "");
      await assign(staff, id, to || null);
      message = to ? "Assigned." : "Unassigned.";
    } else if (intent === "note") {
      await addNote(staff, id, String(form.get("note") ?? ""));
      message = "Note added.";
    } else {
      throw new AdminError("Unknown action.");
    }
    revalidatePath(`/admin/enquiries/${id}`);
    revalidatePath("/admin/enquiries");
    return { ok: true, message };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteEnquiryAction(_: EnquiryState, form: FormData): Promise<EnquiryState> {
  const staff = await requireStaff("enquiries.delete");
  try {
    await deleteEnquiry(staff, String(form.get("id") ?? ""));
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/admin/enquiries");
  redirect("/admin/enquiries?deleted=1");
}
