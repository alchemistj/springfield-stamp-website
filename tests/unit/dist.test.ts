// Checks the built site in dist/ (run `npm run build` first). Every page comes from the route registry.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { routes } from "../../src/lib/routes";
import { home } from "../../src/data/home";
import { site } from "../../src/data/site";

const DIST = path.resolve("dist");
const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));

const built = fs.existsSync(path.join(DIST, "index.html"));
const files = built ? walk(DIST) : [];
const textFiles = files.filter((f) => /\.(html|css|js|xml|txt|json|svg)$/.test(f));
const readText = (f: string) => fs.readFileSync(f, "utf8");
const pageFile = (p: string) => path.join(DIST, p, "index.html");
const decode = (s: string) =>
  s.replace(/&#38;|&amp;/g, "&").replace(/&#39;|&#x27;|&apos;/g, "'").replace(/&quot;|&#34;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;|\u00a0/g, " ");
const visibleText = (html: string) => decode(html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<\/?(?:strong|b|em|span)\b[^>]*>/g, "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
// Strip inline data URIs so base64 noise cannot look like a phone number or a banned string.
const noData = (s: string) => s.replace(/data:[a-z/+-]+;base64,[A-Za-z0-9+/=]+/g, "data:");

describe("build output", () => {
  it("dist exists", () => {
    expect(built, "run `npm run build` before the tests").toBe(true);
  });

  it.each(routes.map((r) => [r.path, r] as const))("%s builds with one H1, canonical, OG and valid JSON-LD", (p, r) => {
    const html = readText(pageFile(p));
    expect(html.match(/<h1[\s>]/g)?.length).toBe(1);
    const canonical = `https://www.springfieldstamp.com${p}`;
    expect(html).toContain(`<link rel="canonical" href="${canonical}"`);
    expect(html).toContain(`<meta property="og:url" content="${canonical}"`);
    expect(html).toMatch(/<meta property="og:image" content="https:\/\/www\.springfieldstamp\.com\/_astro\//);
    expect(decode(html.match(/<title>([\s\S]*?)<\/title>/)![1]!)).toBe(r.title);
    expect(decode(html.match(/<meta name="description" content="([^"]*)"/)![1]!)).toBe(r.description);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]!) as Record<string, unknown>);
    const types = blocks.map((b) => b["@type"]);
    expect(types).toContain("LocalBusiness");
    expect(types).toContain("BreadcrumbList");
    const lb = blocks.find((b) => b["@type"] === "LocalBusiness")!;
    expect(lb["telephone"]).toBe(site.phone.e164);
    expect(lb["openingHours"]).toBe("Mo-Fr 08:00-16:30");
    expect(JSON.stringify(blocks)).not.toMatch(/aggregateRating|"Review"|reviewRating/);
    expect(html).toContain("GT-WK5CGGGZ");
  });

  it("titles and descriptions are unique", () => {
    const titles = routes.map((r) => decode(readText(pageFile(r.path)).match(/<title>([\s\S]*?)<\/title>/)![1]!));
    const descs = routes.map((r) => decode(readText(pageFile(r.path)).match(/<meta name="description" content="([^"]*)"/)![1]!));
    expect(new Set(titles).size).toBe(routes.length);
    expect(new Set(descs).size).toBe(routes.length);
  });

  it("the only phone number anywhere in dist is 417-881-8828", () => {
    const phone = /(?:\+?1[\s.-]?)?\(?\b(\d{3})\)?[\s.-]?(\d{3})[\s.-](\d{4})\b/g;
    const found = new Set<string>();
    for (const f of textFiles) {
      for (const m of noData(readText(f)).matchAll(phone)) found.add(`${m[1]}${m[2]}${m[3]}`);
      for (const m of readText(f).matchAll(/tel:\+?1?(\d{10})/g)) found.add(m[1]!);
    }
    expect([...found]).toEqual(["4178818828"]);
  });

  it('has no "60 years" or "60+" anywhere in dist', () => {
    for (const f of textFiles) {
      const t = noData(readText(f));
      expect(t, f).not.toMatch(/\b60\+|\b60[\s-]years?|sixty years/i);
    }
  });

  it("has no forbidden hosts or typos", () => {
    for (const f of textFiles) {
      const t = noData(readText(f));
      for (const bad of ["wp-content", "springfieldstamp.com/wp-", "supabase.co", "fonts.googleapis", "fonts.gstatic", "avaailable"]) {
        expect(t.includes(bad), `${bad} in ${path.relative(DIST, f)}`).toBe(false);
      }
    }
  });

  it("home copy from src/data appears in the built HTML", () => {
    const text = visibleText(readText(pageFile("/")));
    const norm = (s: string) => decode(s).replace(/\s+/g, " ").trim();
    const flat = (parts: readonly (string | { strong: string })[]) => parts.map((p) => (typeof p === "string" ? p : p.strong)).join("");
    const needles = [
      home.hero.kicker,
      `${home.hero.h1Lead} ${home.hero.h1Rest}`,
      ...home.hero.sub,
      home.hero.callCta.label,
      home.hero.emailCta.label,
      home.help.title,
      ...home.help.products.flatMap((p) => [p.title, flat(p.body), ...(p.cta ? [p.cta.label] : [])]),
      home.workflow.title,
      home.workflow.intro,
      ...home.workflow.testimonials.flatMap((t) => [t.quote, t.name, t.role]),
      flat(home.workflow.outro),
      home.workflow.cta.label,
      home.why.title,
      ...home.why.items.flatMap((i) => [i.title, flat(i.body)]),
      home.about.title,
      flat(home.about.body),
      home.about.cta.label,
    ];
    for (const n of needles) expect(text, n.slice(0, 40)).toContain(norm(n));
    expect(text).toContain("High-quality stamps, name tags, signs & awards. Fast turnaround, friendly service.");
    const headings = [...readText(pageFile("/")).matchAll(/<h3[^>]*class="[^"]*row-title[^"]*"[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => decode(m[1]!.replace(/<[^>]+>/g, "")).trim());
    expect(headings).toEqual(["Custom Stamps", "Name Tags", "Signs", "Name Plates", "Awards & Plaques", "Notary Stamps & Embossers"]);
    for (const gone of ["Self-Inking Stamps", "Address Stamps", "Desk Name Plates", "Acrylic Awards"]) expect(text).not.toContain(gone);
    expect(text).not.toContain("Signs photo coming soon");
    const signsRow = readText(pageFile("/")).match(/<article[^>]*>(?:(?!<\/article>)[\s\S])*?<h3[^>]*row-title[^>]*>Signs<\/h3>[\s\S]*?<\/article>/);
    expect(signsRow, "Signs row").not.toBeNull();
    expect(signsRow![0]).toContain("<img");
    expect(signsRow![0]).not.toMatch(/class="[^"]*\bph\b/);
    expect(signsRow![0]).toContain("EXIT sign");
    expect(text).toContain("Ordering your custom products from Springfield Stamp & Engraving is simple and hassle-free.");
    expect(text).toContain("and Springfield Stamp & Engraving came to the rescue!");
    expect(text).toContain("At Springfield Stamp & Engraving, we don't just sell products");
    expect(text).toContain("over 50 years");
    expect(text).toContain("our 50 years of experience");
  });

  it("uses the new Facebook URL everywhere and never the old one", () => {
    const fb = "https://www.facebook.com/SpringfieldStampandEngraving/";
    expect(site.facebook).toBe(fb);
    expect(readText(pageFile("/"))).toContain(`href="${fb}"`);
    expect(readText(pageFile("/"))).toContain(`"sameAs":["${fb}"]`);
    for (const f of textFiles) expect(noData(readText(f)), path.relative(DIST, f)).not.toMatch(/facebook\.com\/SpringfieldStamp(?!andEngraving)/);
  });

  it("home hero: photo first in body, inlined, gated, within the 70 KB budget", () => {
    const html = readText(pageFile("/"));
    const body = html.slice(html.indexOf("<body"));
    expect(body.indexOf("data-ff-lcp-hero")).toBeGreaterThan(-1);
    expect(body.indexOf("<picture")).toBeLessThan(body.indexOf("<header"));
    expect(body.indexOf("<header")).toBeLessThan(body.indexOf('class="atf-ready"'));
    expect(html).toMatch(/\.atf:not\(:has\(>\s*\.atf-ready\)\)\s*\{\s*visibility:\s*hidden/);
    expect(html).toContain('fetchpriority="high"');
    expect(html).not.toMatch(/<link[^>]+rel="preload"/);
    const hero = [...body.slice(0, body.indexOf("<header")).matchAll(/data:image\/avif;base64,([A-Za-z0-9+/=]+)/g)];
    expect(hero.length).toBeGreaterThanOrEqual(1);
    const bytes = hero.reduce((s, m) => s + Buffer.from(m[1]!, "base64").length, 0);
    expect(bytes).toBeLessThanOrEqual(70 * 1024);
    const logo = html.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
    expect(Buffer.from(logo![1]!, "base64").length).toBeLessThanOrEqual(4 * 1024);
    expect(html).not.toMatch(/transition:\s*all/);
  });

  it("sitemap, robots and llms.txt list every route", () => {
    const sitemap = readText(path.join(DIST, "sitemap.xml"));
    const llms = readText(path.join(DIST, "llms.txt"));
    for (const r of routes) {
      expect(sitemap).toContain(`<loc>https://www.springfieldstamp.com${r.path}</loc>`);
      expect(llms).toContain(`https://www.springfieldstamp.com${r.path}`);
    }
    expect(readText(path.join(DIST, "robots.txt"))).toContain("Sitemap: https://www.springfieldstamp.com/sitemap.xml");
  });
});
