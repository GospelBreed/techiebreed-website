"use client";

import { useState } from "react";
import { SelectInput, TextArea, TextInput } from "@/components/ui/FormField";
import { services } from "@/content-data/services";
import { companySizes, countries, discoverySchema, interests } from "@/lib/schemas";
import { useSearchParam } from "@/lib/useSearchParam";
import { cn } from "@/lib/cn";
import { FormError, FormSuccess, Honeypot, SubmitButton } from "./FormStatus";
import { useEnquiryForm } from "./useEnquiryForm";

/** The main discovery form on /contact. Pre-selects ?interest= and notes ?service= from links elsewhere. */
export function DiscoveryForm() {
  const { formRef, status, errors, message, onSubmit, clearError, startOver } = useEnquiryForm(discoverySchema, "discovery");
  const urlInterest = useSearchParam("interest");
  const urlService = useSearchParam("service");
  const [picked, setPicked] = useState<string | null>(null);

  const interest = picked ?? (urlInterest && interests.includes(urlInterest) ? urlInterest : "");
  const service = services.find((s) => s.id === urlService);

  if (status === "sent") {
    return (
      <FormSuccess
        title="Thank you — we've got your message"
        resetLabel="Send another message"
        onReset={() => {
          setPicked(null);
          startOver();
        }}
      >
        <p>We read every enquiry ourselves and will reply by email within [RESPONSE TIME].</p>
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
      aria-describedby="discovery-note"
    >
      <Honeypot />
      <p id="discovery-note" className="text-[14px] text-muted">
        Fields marked <span className="text-[#b42318]">*</span> are required.
      </p>

      {service && (
        <p className="rounded-[12px] bg-mint px-4 py-3 text-[15px] text-pine">
          You&rsquo;re asking about <strong className="font-semibold text-forest">{service.title}</strong>.
          <input type="hidden" name="service" value={service.title} />
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Full name" name="name" required autoComplete="name" error={errors.name} />
        <TextInput label="Work email" name="email" type="email" required autoComplete="email" error={errors.email} />
        <TextInput label="Company" name="company" required autoComplete="organization" error={errors.company} />
        <TextInput label="Your role" name="role" required autoComplete="organization-title" error={errors.role} />
        <SelectInput label="Company size" name="companySize" required options={companySizes} error={errors.companySize} />
        <SelectInput label="Country" name="country" required options={countries} error={errors.country} autoComplete="country-name" />
      </div>

      <TextArea
        label="What's taking up your team's time?"
        name="timeDrain"
        required
        rows={5}
        hint="The repetitive tasks, bottlenecks or headaches you'd most like to get rid of."
        error={errors.timeDrain}
      />
      <TextInput
        label="Tools you currently use"
        name="tools"
        hint="For example: WhatsApp, Excel, Google Workspace, Zoho, QuickBooks."
        error={errors.tools}
      />

      <fieldset aria-describedby={errors.interest ? "interest-error" : undefined}>
        <legend className="text-[15px] font-medium text-ink">
          What are you interested in?<span className="text-[#b42318]" aria-hidden> *</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {interests.map((option) => (
            <label key={option} className="cursor-pointer">
              <input
                type="radio"
                name="interest"
                value={option}
                checked={interest === option}
                onChange={() => setPicked(option)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "inline-flex h-10 items-center rounded-full border px-4 font-pill text-[14px] font-semibold transition-colors duration-200",
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-forest",
                  interest === option
                    ? "border-forest-deep bg-forest-deep text-white"
                    : "border-line bg-white text-[#3d4a40] hover:border-forest/40 hover:text-forest-deep",
                )}
              >
                {option}
              </span>
            </label>
          ))}
        </div>
        {errors.interest && (
          <p id="interest-error" className="mt-2 text-[14px] font-medium text-[#b42318]">
            {errors.interest}
          </p>
        )}
      </fieldset>

      {status === "error" && <FormError message={message} />}

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <SubmitButton sending={status === "sending"}>Send my enquiry</SubmitButton>
        <p className="text-[13.5px] text-muted">We&rsquo;ll only use your details to reply to you.</p>
      </div>
    </form>
  );
}
