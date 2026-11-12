import { Briefcase, Building2, Handshake, GraduationCap, Network, TrendingUp, type LucideIcon } from "lucide-react";
import type { Wash } from "@/components/cards/washes";

export type Industry = {
  id: string;
  name: string;
  icon: LucideIcon;
  problem: string;
  solution: string;
  examples: string[];
  wash: Wash;
};

export const industries: Industry[] = [
  {
    id: "smes",
    name: "SMEs & growing businesses",
    icon: TrendingUp,
    problem: "Manual processes, missed enquiries and follow-ups that slip through the cracks.",
    solution: "Business automation systems",
    examples: [
      "Every enquiry captured and answered, day or night",
      "Follow-ups that send themselves",
      "Invoices, reminders and reports without the admin",
    ],
    wash: "sage",
  },
  {
    id: "professional-services",
    name: "Professional service firms",
    icon: Briefcase,
    problem: "Client onboarding, scheduling and reporting eat into billable time.",
    solution: "Client operations systems",
    examples: [
      "Onboarding that collects documents and details automatically",
      "Scheduling and reminders without the back-and-forth",
      "Client reports compiled for you",
    ],
    wash: "sky",
  },
  {
    id: "property",
    name: "Real estate & property",
    icon: Building2,
    problem: "Resident communication and service coordination spread across calls, chats and spreadsheets.",
    solution: "Property operations platforms",
    examples: [
      "Service requests logged, assigned and tracked in one place",
      "Residents kept informed automatically",
      "Live view of jobs, properties and response times",
    ],
    wash: "butter",
  },
  {
    id: "education",
    name: "Education & EdTech",
    icon: GraduationCap,
    problem: "Onboarding, payments and learning access handled by hand.",
    solution: "Education management automation",
    examples: [
      "Payments that enrol students automatically",
      "Learning access that opens and closes on schedule",
      "Progress tracking for students and staff",
    ],
    wash: "blush",
  },
  {
    id: "sales",
    name: "Sales-driven businesses",
    icon: Handshake,
    problem: "Lead research, qualification and follow-ups take hours every week.",
    solution: "Lead generation & sales systems",
    examples: [
      "Prospects researched and qualified for you",
      "Outreach drafted for your team to approve",
      "A pipeline that updates itself",
    ],
    wash: "cream",
  },
  {
    id: "enterprise",
    name: "Enterprise teams",
    icon: Network,
    problem: "Disconnected systems and repetitive workflows across departments.",
    solution: "Custom integrations & AI operations",
    examples: [
      "Systems connected so data flows between teams",
      "Repetitive workflows automated across departments",
      "Dashboards that give leadership one view",
    ],
    wash: "mint",
  },
];
