"use client";

import { useActionState, useState } from "react";
import { settingsAction, type SettingsState } from "@/server/admin/actions/settings-actions";
import { Notice, SubmitButton } from "./ui";

type Values = {
  email: string;
  phone: string;
  linkedin: string;
  x: string;
  instagram: string;
  bookingUrl: string;
  replyTime: string;
  adsEnabled: boolean;
};

const inputCls =
  "h-11 w-full rounded-[10px] border border-line bg-white px-3.5 text-[15.5px] text-ink hover:border-forest/40 focus:border-forest focus:shadow-[0_0_0_3px_rgb(45_189_50/0.25)] focus:outline-none aria-invalid:border-[#b42318]";

type TextKey = Exclude<keyof Values, "adsEnabled">;

function Input({
  name,
  label,
  hint,
  values,
  set,
  errors,
  type = "text",
}: {
  name: TextKey;
  label: string;
  hint?: string;
  values: Values;
  set: (k: TextKey, v: string) => void;
  errors?: Record<string, string>;
  type?: string;
}) {
  const id = `s-${name}`;
  const err = errors?.[name];
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[14.5px] font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={values[name]}
        onChange={(ev) => set(name, ev.target.value)}
        aria-invalid={err ? true : undefined}
        aria-describedby={err || hint ? `${id}-d` : undefined}
        className={inputCls}
      />
      {(err || hint) && (
        <p id={`${id}-d`} className={err ? "text-[13px] text-[#b42318]" : "text-[13px] text-muted"}>
          {err ?? hint}
        </p>
      )}
    </div>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[18px] border border-line bg-white p-5 md:p-6">
      <h2 className="text-[16px] font-bold text-forest">{title}</h2>
      {sub && <p className="mt-0.5 text-[13.5px] text-muted">{sub}</p>}
      <div className="mt-4 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

export function SettingsForm({ values, sha, canAds }: { values: Values; sha: string; canAds: boolean }) {
  const [state, action] = useActionState(settingsAction, {} as SettingsState);
  const e = state.fieldErrors;
  // Controlled fields: React resets forms after each submit, which must never wipe what was typed.
  const [v, setV] = useState<Values>(values);
  const set = (k: TextKey, val: string) => setV((cur) => ({ ...cur, [k]: val }));
  return (
    <form action={action} className="grid gap-6">
      <input type="hidden" name="sha" value={sha} />

      <Section title="Contact details" sub="Shown in the footer, on the Contact page and in Google's business details.">
        <Input name="email" label="Contact email" type="email" values={v} set={set} errors={e} />
        <Input name="phone" label="Phone" hint="International format, e.g. +234 816 588 7386. Used for tap-to-call too." values={v} set={set} errors={e} />
        <Input name="replyTime" label="Reply time" hint={`Shown after a form is sent: "We'll reply within …".`} values={v} set={set} errors={e} />
        <Input name="bookingUrl" label="Booking link" hint="Your Cal.com page, used by every Book button and the booking calendar." values={v} set={set} errors={e} />
      </Section>

      <Section title="Social links" sub="Leave a link empty to hide its icon.">
        <Input name="linkedin" label="LinkedIn" values={v} set={set} errors={e} />
        <Input name="x" label="X (Twitter)" values={v} set={set} errors={e} />
        <Input name="instagram" label="Instagram" values={v} set={set} errors={e} />
      </Section>

      <section className="rounded-[18px] border border-line bg-white p-5 md:p-6">
        <h2 className="text-[16px] font-bold text-forest">Ads</h2>
        <p className="mt-0.5 text-[13.5px] text-muted">Google AdSense on the public pages. Never shown in the admin.</p>
        {canAds ? (
          <label className="mt-4 flex items-center gap-3 text-[15px] text-ink">
            <input type="hidden" name="adsField" value="1" />
            <input type="checkbox" name="adsEnabled" checked={v.adsEnabled} onChange={(ev) => setV((cur) => ({ ...cur, adsEnabled: ev.target.checked }))} className="size-5 accent-[#2dbd32]" />
            Show ads on the website
          </label>
        ) : (
          <p className="mt-4 text-[15px] text-ink">
            Ads are <strong>{values.adsEnabled ? "on" : "off"}</strong>. Only the Super Admin can change this.
          </p>
        )}
      </section>

      <div className="sticky bottom-0 z-10 -mx-4 grid gap-3 border-t border-line bg-[#f3f6f4]/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
        <Notice kind={state.error ? "error" : "success"}>{state.error ?? state.message}</Notice>
        <div>
          <SubmitButton pendingLabel="Saving…">Save settings</SubmitButton>
        </div>
      </div>
    </form>
  );
}
