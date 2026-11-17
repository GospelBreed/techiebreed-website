import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "About TechieBreed";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "About", title: "TechieBreed is *evolving.*" });
}
