import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Industries TechieBreed works with";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "Industries", title: "Different industries. *The same busywork.*" });
}
