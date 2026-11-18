"use client";

import { useEffect } from "react";
import { SelectInput, TextArea, TextInput } from "@/components/ui/FormField";
import { programmes } from "@/content-data/academy";
import { academySchema, learnerOptions, programmeOptions } from "@/lib/schemas";
import { site } from "@/lib/site";
import { FormError, FormSuccess, Honeypot, SubmitButton } from "./FormStatus";
import { useEnquiryForm } from "./useEnquiryForm";

/** Register interest in an Academy programme. Enrollment itself happens on the student hub. */
export function AcademyInterestForm() {
  const { formRef, status, errors, message, onSubmit, clearError, startOver } = useEnquiryForm(academySchema, "academy");

  // The student hub links here as /academy?programme=<id>#interest: pre-select that programme.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("programme");
    const title = programmes.find((p) => p.id === id)?.title;
    const select = formRef.current?.querySelector<HTMLSelectElement>('select[name="programme"]');
    if (title && select) select.value = title;
  }, [formRef, status]);

  if (status === "sent") {
    return (
      <FormSuccess title="You're on the list" resetLabel="Register someone else" onReset={startOver}>
        <p>
          We&rsquo;ll email you when the next cohort opens. Ready to start now? Enroll on the{" "}
          <a href={site.academyHubUrl} className="font-semibold text-leaf underline underline-offset-4 hover:text-forest">
            student hub
          </a>
          .
        </p>
      </FormSuccess>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onInput={(e) => clearError((e.target as HTMLInputElement).name)}
      noValidate
      className="relative grid gap-5"
    >
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Full name" name="name" required autoComplete="name" error={errors.name} />
        <TextInput label="Email" name="email" type="email" required autoComplete="email" error={errors.email} />
        <TextInput label="Phone or WhatsApp" name="phone" type="tel" autoComplete="tel" error={errors.phone} />
        <SelectInput label="Who is the training for?" name="learners" required options={learnerOptions} error={errors.learners} />
      </div>
      <SelectInput label="Programme" name="programme" required options={programmeOptions} error={errors.programme} />
      <TextArea label="Anything you'd like us to know?" name="message" rows={3} error={errors.message} />

      {status === "error" && <FormError message={message} />}

      <div>
        <SubmitButton sending={status === "sending"}>Register my interest</SubmitButton>
      </div>
    </form>
  );
}
