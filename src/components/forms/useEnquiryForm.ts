"use client";

import { useRef, useState, type FormEvent } from "react";
import type { ZodType } from "zod";
import { fieldErrors as toFieldErrors, type ApiResult, type FieldErrors } from "@/lib/schemas";

export type FormStatus = "idle" | "sending" | "sent" | "error";

/**
 * Validates a form against a schema, posts it to /api/contact and tracks
 * idle → sending → sent / error. Focuses the first problem field on failure.
 */
export function useEnquiryForm(schema: ZodType, kind: "discovery" | "academy") {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");

  function focusFirstError(errs: FieldErrors) {
    const first = Object.keys(errs)[0];
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`);
    el?.focus();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const data = { ...Object.fromEntries(new FormData(e.currentTarget).entries()), kind };

    const check = schema.safeParse(data);
    if (!check.success) {
      const errs = toFieldErrors(check.error);
      setErrors(errs);
      setStatus("error");
      setMessage("Please check the highlighted fields.");
      focusFirstError(errs);
      return;
    }

    setErrors({});
    setMessage("");
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => null)) as ApiResult | null;
      if (res.ok && body?.ok) {
        setStatus("sent");
        formRef.current?.reset();
        return;
      }
      const errs = body && !body.ok ? (body.fieldErrors ?? {}) : {};
      setErrors(errs);
      setMessage(body && !body.ok ? body.message : "Something went wrong. Please try again.");
      setStatus("error");
      focusFirstError(errs);
    } catch {
      setStatus("error");
      setMessage("We couldn't reach our server. Check your connection and try again.");
    }
  }

  /** Clear a field's error as soon as the visitor edits it. */
  function clearError(name: string) {
    if (!errors[name]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function startOver() {
    setStatus("idle");
    setErrors({});
    setMessage("");
  }

  return { formRef, status, errors, message, onSubmit, clearError, startOver };
}
