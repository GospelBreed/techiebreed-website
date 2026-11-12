import { isPlaceholder, site } from "@/lib/site";

/** Renders schema.org data as JSON-LD. `<` is escaped so content can't close the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** Organization + WebSite, included on every page. Placeholder values are left out. */
export function organizationLd(): Record<string, unknown> {
  const sameAs = Object.values(site.social).filter((v) => !isPlaceholder(v));
  const email = isPlaceholder(site.contact.email) ? undefined : site.contact.email;
  const telephone = isPlaceholder(site.contact.phone) ? undefined : site.contact.phone;
  const orgId = `${site.url}/#organization`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: site.name,
        description: site.description,
        slogan: site.tagline,
        url: site.url,
        logo: { "@type": "ImageObject", url: new URL("/logo.svg", site.url).toString() },
        areaServed: ["NG", "GB", "US"],
        knowsAbout: [
          "Workflow automation",
          "AI assistants",
          "Sales systems",
          "Business system integrations",
          "Business intelligence and reporting",
          "Custom software development",
        ],
        ...(sameAs.length ? { sameAs } : {}),
        ...(email || telephone
          ? {
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "sales",
                ...(email ? { email } : {}),
                ...(telephone ? { telephone } : {}),
                areaServed: ["NG", "GB", "US"],
                availableLanguage: ["en"],
              },
            }
          : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        name: site.name,
        url: site.url,
        publisher: { "@id": orgId },
        inLanguage: "en",
      },
    ],
  };
}
