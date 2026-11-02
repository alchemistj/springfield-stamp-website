// Text for sitemap.xml, robots.txt and llms.txt, built from the route registry.
// Pure functions so Vitest can check them without building the site.
import { site, SITE_URL } from "../data/site";
import { canonicalUrl, routes } from "./routes";

const xmlEscape = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function sitemapXml(lastmod: string): string {
  const urls = routes
    .map(
      (r) =>
        `  <url>\n    <loc>${xmlEscape(canonicalUrl(r.path))}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${r.priority.toFixed(1)}</priority>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function robotsTxt(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

export function llmsTxt(): string {
  const pages = routes.map((r) => `- [${r.name}](${canonicalUrl(r.path)}): ${r.description}`).join("\n");
  return `# ${site.legalName}

> Family-owned custom stamp, magnetic name tag, desk name plate, acrylic award and Missouri notary supply shop in Springfield, Missouri.

## Business

- Name: ${site.legalName}
- Address: ${site.address.oneLine}
- Phone: ${site.phone.display}
- Email: ${site.email}
- Hours: ${site.hours.days} ${site.hours.times}
- Facebook: ${site.facebook}

## Pages

${pages}
`;
}
