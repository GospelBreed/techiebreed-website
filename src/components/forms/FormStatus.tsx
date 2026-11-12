"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { ActionButton } from "@/components/ui/Button";

/** Submit button that shows progress while sending. */
export function SubmitButton({ sending, children }: { sending: boolean; children: ReactNode }) {
  return (
    <ActionButton type="submit" disabled={sending} aria-disabled={sending} className="w-full sm:w-auto">
      {sending ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 aria-hidden className="size-[18px] animate-spin" />
          Sending…
        </span>
      ) : (
        children
      )}
    </ActionButton>
  );
}

/** Error summary shown above the form. */
export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-3 rounded-[12px] border border-[#f3c2bf] bg-blush px-4 py-3 text-[15px] text-[#8a1c14]">
      <AlertCircle aria-hidden className="mt-0.5 size-5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

/** Replaces the form once it has been sent. Moves focus to the heading for screen readers. */
export function FormSuccess({ title, children, onReset, resetLabel }: { title: string; children: ReactNode; onReset: () => void; resetLabel: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className="flex flex-col items-start rounded-[20px] bg-sage p-6 md:p-8" role="status">
      <CheckCircle2 aria-hidden className="size-10 text-leaf" strokeWidth={1.75} />
      <h3 ref={ref} tabIndex={-1} className="mt-4 font-display text-[26px] leading-[1.2] font-semibold text-forest focus:outline-none">
        {title}
      </h3>
      <div className="mt-2 text-[16px] leading-[1.6] text-pine">{children}</div>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 text-[15px] font-semibold text-leaf underline decoration-leaf/40 underline-offset-4 hover:text-forest"
      >
        {resetLabel}
      </button>
    </div>
  );
}

/** Hidden field for bots. Real visitors never see or fill it in. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
