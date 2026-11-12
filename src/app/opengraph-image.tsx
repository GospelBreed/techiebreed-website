import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "TechieBreed — Intelligent Business Systems Company";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "Intelligent Business Systems", title: "Your business has better things to do than *repetitive work.*" });
}
