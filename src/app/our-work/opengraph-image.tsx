import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "TechieBreed case studies";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "Our work", title: "Working systems, *built for real businesses*" });
}
