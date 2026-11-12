import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

/** Social share images (1200×630) in the site's look: forest glow, Fraunces headline, lime accent. */

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const fontDir = path.join(process.cwd(), "assets", "fonts");
const fonts = Promise.all([
  readFile(path.join(fontDir, "fraunces-latin-600-normal.woff")),
  readFile(path.join(fontDir, "fraunces-latin-600-italic.woff")),
]);

function Mark() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28.5" fill="none" stroke="#9eeb00" strokeWidth="4.5" />
      <g fill="none" stroke="#9eeb00" strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round">
        <path d="M18 17.5v8h11.5v24h7" />
        <path d="M24 16.5h12.5l3 3h4" />
        <path d="M46.5 16.5h1.5v9h-8.5" />
        <path d="M24 20.5h12l3.2 3.2h7.2" />
        <path d="M21.5 23.5h11.5v5l3.5 3.5v15h-6" />
        <path d="M39 26.5v22h-8.5" />
        <path d="M33.5 32v12.5" />
      </g>
    </svg>
  );
}

/**
 * @param title  Main line. Text inside *asterisks* is set in lime italic.
 * @param eyebrow Small label above the title.
 */
export async function renderOg({ title, eyebrow }: { title: string; eyebrow?: string }) {
  const [regular, italic] = await fonts;
  // Word by word, so the headline wraps; words inside *…* are the accent.
  const words = title
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .flatMap((part) => {
      const accent = part.startsWith("*") && part.endsWith("*");
      return (accent ? part.slice(1, -1) : part)
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => ({ w, accent }));
    });
  const long = title.replace(/\*/g, "").length > 60;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "radial-gradient(70% 90% at 50% 45%, #0a5a33 0%, #004c28 62%)",
          color: "#ffffff",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -180,
            top: -60,
            width: 720,
            height: 720,
            borderRadius: 9999,
            border: "2px solid rgba(255,255,255,0.08)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -60,
            top: 60,
            width: 480,
            height: 480,
            borderRadius: 9999,
            border: "2px solid rgba(255,255,255,0.07)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Mark />
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700, letterSpacing: -0.5 }}>
            <span>Techie</span>
            <span style={{ color: "#9eeb00", marginLeft: -9 }}>Breed</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
          {eyebrow && (
            <div style={{ display: "flex", fontSize: 26, color: "#9eeb00", letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>
              {eyebrow}
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontFamily: "Fraunces",
              fontSize: long ? 60 : 74,
              lineHeight: 1.1,
              letterSpacing: -1,
            }}
          >
            {words.map(({ w, accent }, i) => (
              <span
                key={i}
                style={{
                  marginRight: "0.24em",
                  ...(accent ? { fontStyle: "italic", color: "#9eeb00" } : {}),
                }}
              >
                {w}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "rgba(255,255,255,0.8)" }}>
          <span>Less operational pressure. More intelligent growth.</span>
          <span style={{ display: "flex", height: 8, width: 120, borderRadius: 999, background: "#2dbd32", alignSelf: "center" }} />
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Fraunces", data: regular, style: "normal", weight: 600 },
        { name: "Fraunces", data: italic, style: "italic", weight: 600 },
      ],
    },
  );
}
