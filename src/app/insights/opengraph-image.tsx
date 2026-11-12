import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "TechieBreed Insights";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "Insights", title: "Practical ideas for *smarter operations*" });
}
