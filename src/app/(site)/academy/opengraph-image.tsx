import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "TechieBreed Academy";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "TechieBreed Academy", title: "Learn to put AI *to work* in your business." });
}
