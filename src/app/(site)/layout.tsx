import Script from "next/script";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileAuditBar } from "@/components/layout/MobileAuditBar";
import { JsonLd, organizationLd } from "@/components/seo/JsonLd";
import { site } from "@/lib/site";

/** Chrome for the public website: header, footer, mobile booking bar, ads, analytics and structured data. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* Google AdSense (React hoists this into <head>). Public pages only, never the admin.
          Switched on/off by the Super Admin in Admin → Settings. */}
      {site.adsEnabled && (
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6181959399492699"
          crossOrigin="anonymous"
        />
      )}
      {/* Google Analytics 4: visitor numbers for Admin → Analytics. Public pages only.
          Page changes inside the site are counted by GA4's enhanced measurement. */}
      {site.gaMeasurementId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${site.gaMeasurementId}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${site.gaMeasurementId}");`}
          </Script>
        </>
      )}
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
    </>
  );
}
