"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "../auth";
import { ASSIGNABLE_ROLES } from "../roles";
import { AdminError, changeRole, inviteStaff, resendInvite, resetMfa, setRequireMfa, setSuspended } from "../staff";
import type { FormState } from "./auth-actions";

const inviteSchema = z.object({
  fullName: z.string().trim().min(2, "Enter their name.").max(80),
  email: z.email("Enter a valid email address."),
  role: z.enum(ASSIGNABLE_ROLES, { error: "Choose a role." }),
});

async function run(fn: () => Promise<unknown>, message: string): Promise<FormState> {
  try {
    await fn();
    revalidatePath("/admin/users");
    return { ok: true, message };
  } catch (e) {
    if (e instanceof AdminError) return { error: e.message };
    console.error("[admin] staff action failed:", e instanceof Error ? e.message : e);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function inviteAction(_: FormState, form: FormData): Promise<FormState> {
  const actor = await requireStaff("staff.manage");
  const parsed = inviteSchema.safeParse({
    fullName: form.get("fullName"),
    email: form.get("email"),
    role: form.get("role"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  return run(() => inviteStaff(actor, parsed.data), `Invitation sent to ${parsed.data.email}.`);
}

/** One action for the per-person menu on the Users page. */
export async function staffCommandAction(_: FormState, form: FormData): Promise<FormState> {
  const actor = await requireStaff("staff.manage");
  const id = String(form.get("id") ?? "");
  const command = String(form.get("command") ?? "");
  switch (command) {
    case "role": {
      const role = z.enum(ASSIGNABLE_ROLES).safeParse(form.get("role"));
      if (!role.success) return { error: "Choose a role." };
      return run(() => changeRole(actor, id, role.data), "Role updated.");
    }
    case "suspend":
      return run(() => setSuspended(actor, id, true), "Access suspended.");
    case "reactivate":
      return run(() => setSuspended(actor, id, false), "Access restored.");
    case "require_mfa":
      return run(() => setRequireMfa(actor, id, true), "Authenticator app is now required for this person.");
    case "optional_mfa":
      return run(() => setRequireMfa(actor, id, false), "Authenticator app is now optional for this person.");
    case "reset_mfa":
      return run(() => resetMfa(actor, id), "Authenticator removed. They can sign in with their password and set it up again.");
    case "resend":
      return run(() => resendInvite(actor, id), "Invitation sent again.");
    default:
      return { error: "Unknown action." };
  }
}
