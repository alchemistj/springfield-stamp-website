// JSON-LD builders. Pure functions (no Astro imports) so Vitest can check them.
// Per spec: LocalBusiness + BreadcrumbList only. No ratings or review markup.
import { site, SITE_URL } from "../data/site";
import type { Route } from "./routes";
import { routeByKey } from "./routes";

export const LOGO_URL = `${SITE_URL}/favicon-512.png`;

export function localBusinessSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#organization`,
    name: site.legalName,
    alternateName: site.name,
    url: `${SITE_URL}/`,
    logo: LOGO_URL,
    image: LOGO_URL,
    telephone: site.phone.e164,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    openingHours: site.hours.schema,
    sameAs: [site.facebook],
  };
}

export function breadcrumbSchema(route: Route): Record<string, unknown> {
  const home = routeByKey("home");
  const items = [{ name: home.name, url: `${SITE_URL}${home.path}` }];
  if (route.key !== "home") items.push({ name: route.name, url: `${SITE_URL}${route.path}` });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** Serialise for a <script type="application/ld+json"> body (escapes `<` so `</script>` cannot appear). */
export const jsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, "\\u003c");
