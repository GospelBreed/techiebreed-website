/**
 * Stock photos used on the home page, from Magnific (formerly Freepik).
 * Author and page are kept for reference.
 * Files live in public/images/home (1200px wide JPEGs; next/image resizes them).
 */

import type { ServiceId } from "./services";

export type Photo = {
  src: string;
  /** CSS object-position, to keep faces in frame when cropped. */
  focus?: string;
  author: string;
  /** Magnific page for the photo (for the credit). */
  page: string;
  /** What the photo shows, used on the credits page. */
  caption: string;
};

const M = "https://www.magnific.com/free-photo/";
const img = (name: string) => `/images/home/${name}.jpg`;

/** Rotate through the floating hero circles. */
export const heroPhotos: Photo[] = [
  { src: img("hero-1"), author: "DC Studio", caption: "Entrepreneur working from home", page: `${M}confident-young-female-entrepreneur-working-from-home-evening-african-american-woman-seated-with_423531786.htm` },
  { src: img("hero-2"), focus: "72% 35%", author: "garetsvisual", caption: "Businessman smiling at his laptop", page: `${M}portrait-smiling-african-american-businessman-white-shirt-sitting-happily-looking-camera-while-working-his-laptop-office-isolated_23675695.htm` },
  { src: img("hero-3"), focus: "40% 40%", author: "DC Studio", caption: "Freelancer smiling at his laptop", page: `${M}male-freelancer-smiling-his-laptop_416930671.htm` },
  { src: img("hero-4"), author: "pch.vector", caption: "Colleagues on a video call", page: `${M}happy-excited-colleagues-using-laptop-video-call_6447767.htm` },
  { src: img("hero-5"), focus: "40% 30%", author: "pch.vector", caption: "Businesswoman holding her phone", page: `${M}happy-joyful-business-woman-holding-cellphone_6101357.htm` },
  { src: img("hero-6"), focus: "45% 40%", author: "ASphotofamily", caption: "Woman with her phone in a café", page: `${M}african-american-girl-wear-glasses-with-mobile-phone-sitting-outdoor-caffe_25983548.htm` },
  { src: img("hero-7"), focus: "40% 40%", author: "rawpixel.com", caption: "Businesswoman on a phone call", page: `${M}happy-businesswoman-talking-phone_2895065.htm` },
  { src: img("hero-8"), focus: "40% 40%", author: "prostooleh", caption: "Woman smiling at her phone", page: `${M}pretty-black-girl-winter_3192852.htm` },
];

/** "Sound familiar?" problem slides. */
export const painPhotos: Record<"enquiries" | "follow-ups" | "data-entry" | "tools", Photo> = {
  enquiries: { src: img("pain-enquiries"), focus: "62% 50%", author: "Magnific", caption: "Woman reading her phone late at night", page: `${M}close-up-woman-holding-device_19905380.htm` },
  "follow-ups": { src: img("pain-follow-ups"), author: "DC Studio", caption: "Tired worker at his desk", page: `${M}frustrated-worker-feeling-exhausted-about-office-work-using-laptop-computer-desk-tired-employee-working-business-plan-feeling-angry-disappointed-about-financial-mistake_26439252.htm` },
  "data-entry": { src: img("pain-data-entry"), focus: "40% 50%", author: "DC Studio", caption: "Businesswoman working late", page: `${M}stressed-businesswoman-suffering-from-headache-work-doing-overtime-late-night_15853478.htm` },
  tools: { src: img("pain-tools"), author: "pressfoto", caption: "Man working across laptop and tablet", page: `${M}man-working-digital-tablet_5633740.htm` },
};

/** Home page service cards. */
export const servicePhotos: Record<ServiceId, Photo> = {
  automation: { src: img("service-automation"), author: "DC Studio", caption: "Colleagues reviewing reports together", page: `${M}african-american-staff-members-consulting-each-other-monthly-reports-reviewing-kpi-data-insights_422861029.htm` },
  agents: { src: img("service-agents"), author: "DC Studio", caption: "Customer support agent assisting customers", page: `${M}portrait-smiling-call-center-worker-typing-keyboard-assisting-customers_416753840.htm` },
  sales: { src: img("service-sales"), author: "DC Studio", caption: "Two people shaking hands", page: `${M}smiling-hr-employee-shaking-hands-with-man-after-interview_417798699.htm` },
  integrations: { src: img("service-integrations"), author: "DC Studio", caption: "Developers at a multi-screen desk", page: `${M}network-developers-updating-firewall-system-through-information-processing-using-multiple-layers-security-company-programmers-standing-near-desk-with-multiple-monitors-top-it_26344413.htm` },
  data: { src: img("service-data"), author: "DC Studio", caption: "Manager reviewing data dashboards", page: `${M}african-disabled-invalid-manager-woman-working-pc-showing-data-prosessing-desktop-project-regarding-economy-looking-financial-documents-checking-graphs-reading-raports-business-office_21516170.htm` },
  software: { src: img("service-software"), author: "DC Studio", caption: "Software developer writing code", page: `${M}software-developer-using-terminal-window-app-laptop-learning-code-new-user-interface-program-developing-cloud-computing-online-server-with-firewall-security-css-html-script_30652013.htm` },
};
