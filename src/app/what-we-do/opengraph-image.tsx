import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "What TechieBreed does";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "What we do", title: "Systems that take repetitive work *off your team's plate*" });
}
