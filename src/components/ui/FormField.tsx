import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-[10px] border border-line bg-white px-4 text-[16px] text-ink placeholder:text-muted/80 " +
  "transition-[border-color,box-shadow] duration-200 hover:border-forest/40 " +
  "focus:border-forest focus:shadow-[0_0_0_3px_rgb(45_189_50/0.25)] focus:outline-none " +
  "aria-[invalid=true]:border-coral aria-[invalid=true]:shadow-[0_0_0_3px_rgb(245_111_102/0.18)]";

type FieldMeta = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
};

type ControlProps = {
  id: string;
  name: string;
  required?: boolean;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

/** Label, hint and error around any control, wired up for screen readers. */
export function FormField({
  label,
  name,
  error,
  hint,
  required,
  className,
  children,
}: FieldMeta & { children: (props: ControlProps) => ReactNode }) {
  const id = `f-${name}`;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-[15px] font-medium text-ink">
        {label}
        {required ? (
          <span className="text-[#b42318]" aria-hidden>
            {" "}
            *
          </span>
        ) : (
          <span className="font-normal text-muted"> (optional)</span>
        )}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="-mt-1 text-[14px] text-muted">
          {hint}
        </p>
      )}
      {children({
        id,
        name,
        required,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}
      {error && (
        <p id={`${id}-error`} className="text-[14px] font-medium text-[#b42318]">
          {error}
        </p>
      )}
    </div>
  );
}

type Native<T extends "input" | "textarea" | "select"> = Omit<
  ComponentPropsWithoutRef<T>,
  "name" | "id" | "required" | "className"
>;

export function TextInput({ label, name, error, hint, required, className, ...input }: FieldMeta & Native<"input">) {
  return (
    <FormField {...{ label, name, error, hint, required, className }}>
      {(p) => <input type="text" {...p} {...input} className={cn(control, "h-12")} />}
    </FormField>
  );
}

export function TextArea({ label, name, error, hint, required, className, ...area }: FieldMeta & Native<"textarea">) {
  return (
    <FormField {...{ label, name, error, hint, required, className }}>
      {(p) => <textarea rows={4} {...p} {...area} className={cn(control, "min-h-[120px] py-3")} />}
    </FormField>
  );
}

export function SelectInput({
  label,
  name,
  error,
  hint,
  required,
  className,
  options,
  placeholder = "Choose one",
  ...select
}: FieldMeta & Native<"select"> & { options: ReadonlyArray<string>; placeholder?: string }) {
  return (
    <FormField {...{ label, name, error, hint, required, className }}>
      {(p) => (
        <div className="relative">
          <select defaultValue="" {...p} {...select} className={cn(control, "h-12 appearance-none pr-11")}>
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-forest"
          >
            <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </FormField>
  );
}
