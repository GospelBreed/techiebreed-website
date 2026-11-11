/** The six things TechieBreed builds. Shared by Home, What We Do, nav and footer. */

export type ServiceId = "automation" | "agents" | "sales" | "integrations" | "data" | "software";

export type Service = {
  id: ServiceId;
  title: string;
  short: string;
  summary: string;
  description: string;
  useCases: string[];
  /** Pastel wash used for this service's card. */
  wash: "sage" | "sky" | "butter" | "blush" | "cream" | "mint";
};

export const services: Service[] = [
  {
    id: "automation",
    title: "AI Operations & Workflow Automation",
    short: "Workflow Automation",
    summary: "Approvals, reminders, task assignments, reporting and follow-ups that run themselves.",
    description:
      "We map how work moves through your business today, then automate the repetitive steps — so approvals, reminders and follow-ups happen on time, every time, without someone chasing them.",
    useCases: [
      "Approval requests that route to the right person and remind them",
      "Automatic reminders for renewals, payments and deadlines",
      "New tasks assigned the moment a job, order or request comes in",
      "Weekly reports compiled and sent without anyone building them",
      "Follow-ups that go out when they should, not when someone remembers",
    ],
    wash: "sage",
  },
  {
    id: "agents",
    title: "AI Agents & Business Assistants",
    short: "AI Assistants",
    summary: "WhatsApp assistants, voice agents and internal helpers that answer, qualify and hand over.",
    description:
      "Assistants that answer common questions, qualify enquiries and book appointments around the clock — and pass anything that needs a person straight to your team. Your team stays in control.",
    useCases: [
      "WhatsApp assistants that answer enquiries and capture leads",
      "Voice agents that take calls, answer questions and book appointments",
      "Internal knowledge assistants that answer staff questions from your own documents",
      "Customer support assistants that resolve common requests and escalate the rest",
    ],
    wash: "sky",
  },
  {
    id: "sales",
    title: "Sales & Revenue Systems",
    short: "Sales Systems",
    summary: "Lead research, prospect enrichment, CRM automation and sales reporting.",
    description:
      "We build the system behind your sales team: finding and researching the right prospects, keeping your CRM up to date on its own, and making sure no follow-up is ever missed.",
    useCases: [
      "Lead research that finds and qualifies prospects that match your ideal customer",
      "Prospect enrichment — the right contact, company details and context, added automatically",
      "CRM automation that logs activity and moves deals forward",
      "Sales reporting that shows what is working, without spreadsheets",
    ],
    wash: "butter",
  },
  {
    id: "integrations",
    title: "Business Systems & Integrations",
    short: "Integrations",
    summary: "Connect your business tools, build dashboards, internal portals and operational databases.",
    description:
      "Your tools should share information without anyone copying and pasting. We connect the software you already use and build the missing pieces around it.",
    useCases: [
      "Connecting your CRM, accounting, forms, email and messaging tools",
      "Custom dashboards that pull everything into one view",
      "Internal portals for staff, partners or suppliers",
      "Operational databases that replace scattered spreadsheets",
    ],
    wash: "blush",
  },
  {
    id: "data",
    title: "Data, Reporting & Business Intelligence",
    short: "Reporting & BI",
    summary: "Automated reports, KPI dashboards, management reporting and performance tracking.",
    description:
      "Know how the business is doing without waiting for someone to pull the numbers. We turn the data you already have into clear reports and dashboards that update themselves.",
    useCases: [
      "Automated daily, weekly and monthly reports",
      "KPI dashboards for leadership and team leads",
      "Management reporting packs ready for board and investor meetings",
      "Performance tracking across teams, branches and campaigns",
    ],
    wash: "cream",
  },
  {
    id: "software",
    title: "Custom Software & Product Development",
    short: "Custom Software",
    summary: "Operational platforms, customer portals, education platforms and industry software.",
    description:
      "When off-the-shelf software doesn't fit the way you work, we design and build software that does — from operations platforms to customer-facing portals.",
    useCases: [
      "Operational platforms built around how your team actually works",
      "Customer portals for bookings, requests, payments and updates",
      "Education platforms with enrolment, payments and learning access",
      "Industry software for property, services, education and more",
    ],
    wash: "mint",
  },
];

export type Package = {
  id: "audit" | "workflow" | "operations" | "managed";
  name: string;
  tagline: string;
  description: string;
  includes: string[];
  recommended?: boolean;
  /** Value sent with the contact form "interest" field. */
  interest: string;
};

export const packages: Package[] = [
  {
    id: "audit",
    name: "AI Operations Audit",
    tagline: "Know exactly where to start",
    description: "We review how your business runs today and show you exactly where automation will help most.",
    includes: ["Process review", "Bottleneck identification", "Clear, prioritised recommendations"],
    recommended: true,
    interest: "AI Operations Audit",
  },
  {
    id: "workflow",
    name: "Smart Workflow Build",
    tagline: "One problem, solved properly",
    description: "We design, build and launch one automated workflow that takes a repetitive job off your team's plate.",
    includes: ["One automated workflow", "Connected to the tools you use", "Testing, launch and handover"],
    interest: "Smart Workflow Build",
  },
  {
    id: "operations",
    name: "Complete Operations System",
    tagline: "Your operations, connected",
    description: "Multiple connected workflows, integrations and dashboards that work together as one system.",
    includes: ["Multiple connected workflows", "Tool integrations", "Dashboards and reporting"],
    interest: "Complete Operations System",
  },
  {
    id: "managed",
    name: "Managed AI Operations",
    tagline: "We keep it running and improving",
    description: "Ongoing care for your systems so they keep working as your business changes.",
    includes: ["Ongoing maintenance", "Monitoring", "Continuous optimisation", "Support when you need it"],
    interest: "Managed AI Operations",
  },
];
