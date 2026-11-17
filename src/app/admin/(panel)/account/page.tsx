import type { Metadata } from "next";
import { MfaPanel, PasswordForm, ProfileForm } from "@/components/admin/AccountForms";
import { Notice } from "@/components/admin/ui";
import { requireStaff } from "@/server/admin/auth";
import { ROLE_LABEL, ROLE_SUMMARY } from "@/server/admin/roles";

export const metadata: Metadata = { title: "My account" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[18px] border border-line bg-white p-5 md:p-7">
      <h2 className="mb-5 text-[17px] font-bold text-forest">{title}</h2>
      {children}
    </section>
  );
}

export default async function AccountPage({ searchParams }: PageProps<"/admin/account">) {
  const staff = await requireStaff(undefined, { allowMfaSetup: true });
  const sp = await searchParams;
  const mustSetUp = staff.requireMfa && !staff.mfaEnabled;

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-display text-[30px] leading-tight font-semibold text-forest md:text-[36px]">My account</h1>
        <p className="mt-1 text-[15px] text-ink-soft">
          {ROLE_LABEL[staff.role]} — {ROLE_SUMMARY[staff.role]}
        </p>
      </header>

      {(mustSetUp || sp.setup === "mfa") && mustSetUp && (
        <Notice kind="error">Your account requires an authenticator app. Set it up below to continue using the admin.</Notice>
      )}

      <Section title="Two-step sign-in (authenticator app)">
        <MfaPanel enabled={staff.mfaEnabled} required={staff.requireMfa} />
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Profile">
          <ProfileForm fullName={staff.fullName} email={staff.email} />
        </Section>
        <Section title="Password">
          <PasswordForm />
        </Section>
      </div>
    </div>
  );
}
