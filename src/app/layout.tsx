import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces, Geist } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileAuditBar } from "@/components/layout/MobileAuditBar";
import { site } from "@/lib/site";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.descriptor}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: "#004c28",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-NG" className={`${geist.variable} ${fraunces.variable} ${dmSans.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <noscript>
          <style>{".reveal>*{opacity:1!important;translate:none!important}"}</style>
        </noscript>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <MobileAuditBar />
      </body>
    </html>
  );
}
