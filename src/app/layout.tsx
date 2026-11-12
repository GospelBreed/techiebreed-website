import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileAuditBar } from "@/components/layout/MobileAuditBar";
import { JsonLd, organizationLd } from "@/components/seo/JsonLd";
import { site } from "@/lib/site";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.descriptor}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_NG",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#004c28",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-NG" className={`${geist.variable} ${fraunces.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <noscript>
          <style>{".reveal>*,.hero .hero-copy>*,.hero .hero-b{opacity:1!important;translate:none!important;scale:none!important}"}</style>
        </noscript>
        <JsonLd data={organizationLd()} />
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
