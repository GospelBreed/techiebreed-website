import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Contact TechieBreed";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "Contact", title: "Let's talk about *your operations*" });
}
