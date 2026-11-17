"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";

/** Building blocks shared by the admin screens. */

export function Notice({ kind, children }: { kind: "error" | "success" | "info"; children: ReactNode }) {
  if (!children) return null;
  const styles = {
    error: "border-[#f3c2bf] bg-blush text-[#8a1c14]",
    success: "border-[#bfe3c4] bg-[#eaf7ec] text-pine",
    info: "border-line bg-white text-ink-soft",
  }[kind];
  const Icon = kind === "error" ? AlertCircle : CheckCircle2;
  return (
    <div role={kind === "error" ? "alert" : "status"} className={cn("flex items-start gap-3 rounded-[12px] border px-4 py-3 text-[14.5px]", styles)}>
      {kind !== "info" && <Icon aria-hidden className="mt-0.5 size-[18px] shrink-0" />}
      <div>{children}</div>
    </div>
  );
}

export function SubmitButton({
  children,
  pendingLabel = "Working…",
  variant = "primary",
  className,
  name,
  value,
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "dark" | "secondary" | "danger";
  className?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  const styles = {
    primary: "bg-sprout text-on-sprout hover:bg-sprout-bright",
    dark: "bg-forest text-white hover:bg-forest-glow",
    secondary: "border border-line bg-white text-forest hover:border-forest/40 hover:bg-mint",
    danger: "border border-[#f3c2bf] bg-white text-[#b42318] hover:bg-blush",
  }[variant];
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-semibold transition-colors disabled:cursor-wait disabled:opacity-70",
        styles,
        className,
      )}
    >
      {pending ? (
        <>
          <Loader2 aria-hidden className="size-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  required,
  defaultValue,
  hint,
  inputMode,
  autoFocus,
  maxLength,
  pattern,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
  hint?: string;
  inputMode?: "numeric" | "email" | "text";
  autoFocus?: boolean;
  maxLength?: number;
  pattern?: string;
}) {
  const id = `f-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[14.5px] font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        inputMode={inputMode}
        autoFocus={autoFocus}
        maxLength={maxLength}
        pattern={pattern}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="h-11 w-full rounded-[10px] border border-line bg-white px-3.5 text-[15.5px] text-ink transition-[border-color,box-shadow] hover:border-forest/40 focus:border-forest focus:shadow-[0_0_0_3px_rgb(45_189_50/0.25)] focus:outline-none"
      />
      {hint && (
        <p id={`${id}-hint`} className="text-[13px] text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
