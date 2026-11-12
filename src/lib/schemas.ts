import { z } from "zod";
import { packages } from "@/content-data/services";
import { programmes } from "@/content-data/academy";

/** Shared by the forms (instant feedback) and the API route (the real check). */

export const companySizes = ["Just me", "2–10", "11–50", "51–200", "201–500", "500+"] as const;

export const countries = [
  "Nigeria",
  "United Kingdom",
  "United States",
  "Ghana",
  "Kenya",
  "South Africa",
  "Canada",
  "Other",
] as const;

export const ACADEMY_INTEREST = "TechieBreed Academy";
export const interests: string[] = [...packages.map((p) => p.interest), ACADEMY_INTEREST];

export const NOT_SURE = "Not sure yet";
export const programmeOptions: string[] = [...programmes.map((p) => p.title), NOT_SURE];
export const learnerOptions = ["Just me", "My team"] as const;

const text = (label: string, max: number) =>
  z
    .string({ error: `Enter ${label}.` })
    .trim()
    .min(1, `Enter ${label}.`)
    .max(max, `Keep ${label} under ${max} characters.`);

const optionalText = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`).optional().default("");

const email = z
  .string({ error: "Enter your email address." })
  .trim()
  .min(1, "Enter your email address.")
  .max(200, "That email address is too long.")
  .pipe(z.email("Enter a valid email address, like name@company.com."));

/** One of a fixed list of options. */
const oneOf = (values: readonly string[], message: string) =>
  z.string({ error: message }).refine((v) => values.includes(v), { message });

/** Hidden field real visitors never fill in; bots usually do. */
const honeypot = z.string().max(500).optional().default("");

export const discoverySchema = z.object({
  kind: z.literal("discovery"),
  name: text("your name", 120),
  email,
  company: text("your company name", 160),
  role: text("your role", 120),
  companySize: oneOf(companySizes, "Choose your company size."),
  country: oneOf(countries, "Choose your country."),
  timeDrain: text("what's taking up your team's time", 3000).refine((v) => v.length >= 10, {
    message: "Tell us a little more — a sentence or two is plenty.",
  }),
  tools: optionalText(1000),
  interest: oneOf(interests, "Choose what you're interested in."),
  service: optionalText(60),
  website: honeypot,
});

export const academySchema = z.object({
  kind: z.literal("academy"),
  name: text("your name", 120),
  email,
  phone: optionalText(40),
  programme: oneOf(programmeOptions, "Choose a programme."),
  learners: oneOf(learnerOptions, "Tell us who the training is for."),
  message: optionalText(2000),
  website: honeypot,
});

export const enquirySchema = z.discriminatedUnion("kind", [discoverySchema, academySchema]);

export type DiscoveryInput = z.infer<typeof discoverySchema>;
export type AcademyInput = z.infer<typeof academySchema>;
export type Enquiry = z.infer<typeof enquirySchema>;

export type FieldErrors = Record<string, string>;

/** First error message per field, for showing under each input. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export type ApiResult = { ok: true } | { ok: false; message: string; fieldErrors?: FieldErrors };
