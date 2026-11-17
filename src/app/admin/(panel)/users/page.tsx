import type { Metadata } from "next";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { InviteForm, StaffActions } from "@/components/admin/UserForms";
import { requireStaff } from "@/server/admin/auth";
import { ROLE_LABEL, ROLES, ROLE_SUMMARY } from "@/server/admin/roles";
import { listStaff } from "@/server/admin/staff";

export const metadata: Metadata = { title: "Users" };

const STATUS_STYLE = {
  active: "bg-[#eaf7ec] text-leaf",
  invited: "bg-butter text-[#7a5a00]",
  suspended: "bg-blush text-[#b42318]",
} as const;

function lastSeen(iso: string | null) {
  if (!iso) return "Never signed in";
  return `Last sign-in ${new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" })}`;
}

export default async function UsersPage() {
  const me = await requireStaff("staff.manage");
  const staff = await listStaff();

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-display text-[30px] leading-tight font-semibold text-forest md:text-[36px]">Users</h1>
        <p className="mt-1 text-[15px] text-ink-soft">Invite your team and choose what each person can do.</p>
      </header>

      <section className="rounded-[18px] border border-line bg-white p-5 md:p-7">
        <h2 className="mb-5 text-[17px] font-bold text-forest">Invite someone</h2>
        <InviteForm />
      </section>

      <section className="rounded-[18px] border border-line bg-white">
        <h2 className="px-5 pt-5 text-[17px] font-bold text-forest md:px-7 md:pt-6">Team ({staff.length})</h2>
        <ul className="divide-y divide-line">
          {staff.map((s) => (
            <li key={s.id} className="grid gap-3 px-5 py-4 md:px-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {s.full_name || s.email}
                    {s.id === me.id && <span className="ml-2 text-[13px] font-normal text-muted">(you)</span>}
                  </p>
                  <p className="text-[14px] text-muted">{s.email}</p>
                  <p className="mt-1 text-[13px] text-muted">{lastSeen(s.last_sign_in)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-forest px-2.5 py-0.5 text-[12.5px] font-semibold text-white">{ROLE_LABEL[s.role]}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[12.5px] font-semibold capitalize ${STATUS_STYLE[s.status]}`}>{s.status}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12.5px] font-semibold ${s.mfa_enabled ? "bg-[#eaf7ec] text-leaf" : "bg-mint text-muted"}`}
                    title={s.require_mfa ? "Authenticator app required" : "Authenticator app optional"}
                  >
                    {s.mfa_enabled ? <ShieldCheck aria-hidden className="size-3.5" /> : <ShieldOff aria-hidden className="size-3.5" />}
                    {s.mfa_enabled ? "App on" : s.require_mfa ? "App required" : "App off"}
                  </span>
                </div>
              </div>
              {s.id !== me.id && s.role !== "super_admin" && (
                <StaffActions
                  id={s.id}
                  name={s.full_name || s.email}
                  role={s.role}
                  status={s.status}
                  requireMfa={s.require_mfa}
                  mfaEnabled={s.mfa_enabled}
                />
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[18px] border border-line bg-white p-5 md:p-7">
        <h2 className="mb-4 text-[17px] font-bold text-forest">What each role can do</h2>
        <dl className="grid gap-3 md:grid-cols-2">
          {ROLES.map((r) => (
            <div key={r} className="rounded-[12px] bg-mint/60 p-3.5">
              <dt className="text-[14.5px] font-semibold text-forest">{ROLE_LABEL[r]}</dt>
              <dd className="mt-0.5 text-[13.5px] text-ink-soft">{ROLE_SUMMARY[r]}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
