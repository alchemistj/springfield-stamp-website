import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { routes } from "../../src/lib/routes";
import { headerNav, footer, site } from "../../src/data/site";
import { breadcrumbSchema, jsonLd, localBusinessSchema } from "../../src/lib/seo";
import { llmsTxt, robotsTxt, sitemapXml } from "../../src/lib/discovery";

describe("route registry", () => {
  it("has the 6 live URLs, with trailing slashes", () => {
    expect(routes.map((r) => r.path)).toEqual(["/", "/custom-stamps/", "/missouri-notary-stamp/", "/magnetic-name-tags/", "/about/", "/contact/"]);
  });
  it("has unique titles and descriptions and no 60-year claims", () => {
    expect(new Set(routes.map((r) => r.title)).size).toBe(6);
    expect(new Set(routes.map((r) => r.description)).size).toBe(6);
    for (const r of routes) expect(`${r.title} ${r.description}`).not.toMatch(/60/);
  });
  it("nav and footer links point at registry routes", () => {
    const paths = new Set(routes.map((r) => r.path));
    for (const l of [...headerNav, ...footer.links]) expect(paths.has(l.path)).toBe(true);
  });
  it("contact description is the spec's", () => {
    expect(routes.find((r) => r.key === "contact")!.description).toBe(
      "Contact Springfield Stamp & Engraving at 1416 S. Glenstone Ave., Springfield, MO. Call (417) 881-8828 or email orders@springfieldstamp.com.",
    );
  });
});

describe("schema and discovery files", () => {
  it("LocalBusiness matches the spec", () => {
    const lb = localBusinessSchema() as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(lb.geo.latitude).toBe(37.1883738);
    expect(lb.geo.longitude).toBe(-93.2618564);
    expect(lb.sameAs).toEqual([site.facebook]);
    expect(lb.address.streetAddress).toBe("1416 S. Glenstone Ave.");
  });
  it("breadcrumbs: home has one item, others two", () => {
    expect((breadcrumbSchema(routes[0]!) as any).itemListElement).toHaveLength(1); // eslint-disable-line @typescript-eslint/no-explicit-any
    expect((breadcrumbSchema(routes[1]!) as any).itemListElement).toHaveLength(2); // eslint-disable-line @typescript-eslint/no-explicit-any
  });
  it("json-ld output cannot close the script tag", () => {
    expect(jsonLd({ a: "</script>" })).not.toContain("</script>");
  });
  it("sitemap, robots, llms.txt are built from the registry", () => {
    for (const r of routes) {
      expect(sitemapXml("2026-11-02")).toContain(`https://www.springfieldstamp.com${r.path}`);
      expect(llmsTxt()).toContain(r.name);
    }
    expect(robotsTxt()).toContain("sitemap.xml");
  });
});

describe("vercel.json", () => {
  const cfg = JSON.parse(fs.readFileSync("vercel.json", "utf8")) as { redirects: { source: string; destination: string; statusCode: number; has?: unknown }[]; headers: { source: string }[] };
  it("redirects every non-home page from no-slash to slash, and apex to www", () => {
    for (const r of routes.filter((x) => x.key !== "home")) {
      const bare = r.path.replace(/\/$/, "");
      expect(cfg.redirects.some((x) => x.source === bare && x.destination === r.path && x.statusCode === 301 && !x.has)).toBe(true);
      expect(cfg.redirects.some((x) => x.source === bare && x.destination === `https://www.springfieldstamp.com${r.path}` && x.has)).toBe(true);
    }
    expect(cfg.redirects.some((x) => x.destination === "https://www.springfieldstamp.com/$1" && x.has)).toBe(true);
  });
  it("has cache headers for /_astro, /images and HTML", () => {
    const sources = cfg.headers.map((h) => h.source);
    expect(sources).toContain("/_astro/(.*)");
    expect(sources).toContain("/images/(.*)");
  });
});
