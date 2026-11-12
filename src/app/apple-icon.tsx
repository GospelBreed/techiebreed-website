import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the T mark on forest green. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#004c28" }}>
        <svg width="132" height="132" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="26" fill="none" stroke="#9eeb00" strokeWidth="4" />
          <path d="M19 20h26M32 20v26M24 25h6l2 2M40 25h-6" fill="none" stroke="#9eeb00" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="19" cy="20" r="2.6" fill="#9eeb00" />
          <circle cx="45" cy="20" r="2.6" fill="#9eeb00" />
          <circle cx="32" cy="46" r="2.6" fill="#9eeb00" />
        </svg>
      </div>
    ),
    size,
  );
}
