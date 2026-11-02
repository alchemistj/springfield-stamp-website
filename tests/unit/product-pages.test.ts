// Checks the built Custom Stamps, Missouri Notary Stamp and Magnetic Name Tags pages in dist/ (run `npm run build` first).
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { routeByKey } from "../../src/lib/routes";
import { customStamps } from "../../src/data/custom-stamps";
import { notaryStamp } from "../../src/data/missouri-notary-stamp";
import { magneticNameTags } from "../../src/data/magnetic-name-tags";
import type { Rich } from "../../src/data/types";

const DIST = path.resolve("dist");
const read = (p: string) => fs.readFileSync(path.join(DIST, p, "index.html"), "utf8");
const decode = (s: string) =>
  s.replace(/&#38;|&amp;/g, "&").replace(/&#39;|&#x27;|&apos;/g, "'").replace(/&quot;|&#34;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;|\u00a0/g, " ");
const text = (html: string) =>
  decode(
    html
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/<style[\s\S]*?<\/style>/g, "")
      .replace(/<\/?(?:strong|b|em|span)\b[^>]*>/g, "")
      .replace(/<[^>]+>/g, " "),
  ).replace(/\s+/g, " ");
const flat = (parts: Rich) => parts.map((p) => (typeof p === "string" ? p : p.strong)).join("");
const norm = (s: string) => decode(s).replace(/\s+/g, " ").trim();
const noData = (s: string) => s.replace(/data:[a-z/+-]+;base64,[A-Za-z0-9+/=]+/g, "data:");

const pages = [
  { key: "custom-stamps", path: "/custom-stamps/" },
  { key: "missouri-notary-stamp", path: "/missouri-notary-stamp/" },
  { key: "magnetic-name-tags", path: "/magnetic-name-tags/" },
] as const;

const needles: Record<(typeof pages)[number]["key"], string[]> = {
  "custom-stamps": [
    flat(customStamps.intro),
    customStamps.find.title,
    flat(customStamps.find.body),
    ...customStamps.find.rows.flatMap((r) => [r.title, flat(r.body), ...(r.cta ? [r.cta.label] : [])]),
    customStamps.ready.title,
    customStamps.ready.body,
    customStamps.ready.callHeading,
    customStamps.ready.cta.label,
    customStamps.why.title,
    flat(customStamps.why.intro),
    customStamps.why.lead,
    ...customStamps.why.items.flatMap((i) => [i.title, flat(i.body)]),
    customStamps.mark.title,
    customStamps.mark.lead,
    customStamps.mark.contactBody,
  ],
  "missouri-notary-stamp": [
    `${notaryStamp.hero.lead} ${notaryStamp.hero.accent}`,
    notaryStamp.intro,
    notaryStamp.products.title,
    ...notaryStamp.products.items.flatMap((p) => [p.name, p.price, p.body]),
    notaryStamp.requirements.title,
    notaryStamp.requirements.intro,
    ...notaryStamp.requirements.items,
    notaryStamp.requirements.outro,
    notaryStamp.buy.title,
    notaryStamp.buy.body,
  ],
  "magnetic-name-tags": [
    flat(magneticNameTags.intro.hello),
    flat(magneticNameTags.intro.pride),
    magneticNameTags.intro.callHeading,
    flat(magneticNameTags.intro.whether),
    magneticNameTags.find.title,
    magneticNameTags.find.lead,
    ...magneticNameTags.find.rows.flatMap((r) => [r.title, r.body]),
    magneticNameTags.unique.title,
    flat(magneticNameTags.unique.body),
    magneticNameTags.unique.contact,
    magneticNameTags.unique.callLine,
    magneticNameTags.design.title,
    flat(magneticNameTags.design.body),
    magneticNameTags.power.title,
    magneticNameTags.power.lead,
    ...magneticNameTags.power.benefits.flatMap((b) => [b.title, flat(b.body)]),
    flat(magneticNameTags.more.body),
    ...magneticNameTags.more.bullets,
    magneticNameTags.why.title,
    flat(magneticNameTags.why.lead),
    ...magneticNameTags.why.items.flatMap((i) => [i.title, flat(i.body)]),
    magneticNameTags.ready.title,
    magneticNameTags.ready.after,
  ],
};

describe.each(pages)("$path", (pg) => {
  const route = routeByKey(pg.key);
  const html = read(pg.path);

  it("has exactly one H1 with the page's main headline", () => {
    expect(html.match(/<h1[\s>]/g)?.length).toBe(1);
    const h1 = decode(html.match(/<h1[\s\S]*?<\/h1>/)![0]!.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    expect(h1.toLowerCase()).toBe(route.h1.toLowerCase());
  });

  it("has its title and meta description", () => {
    expect(decode(html.match(/<title>([\s\S]*?)<\/title>/)![1]!)).toBe(route.title);
    expect(decode(html.match(/<meta name="description" content="([^"]*)"/)![1]!)).toBe(route.description);
  });

  it("has only the shop phone number (417) 881-8828", () => {
    const phone = /(?:\+?1[\s.-]?)?\(?\b(\d{3})\)?[\s.-]?(\d{3})[\s.-](\d{4})\b/g;
    const found = new Set<string>();
    const body = noData(html);
    for (const m of body.matchAll(phone)) found.add(`${m[1]}${m[2]}${m[3]}`);
    for (const m of body.matchAll(/tel:\+?1?(\d{10})/g)) found.add(m[1]!);
    expect([...found]).toEqual(["4178818828"]);
  });

  it("has no 60-year claim, typo or forbidden host", () => {
    const body = noData(html);
    expect(body).not.toMatch(/\b60\+|\b60[\s-]years?/i);
    for (const bad of ["avaailable", "wp-content", "springfieldstamp.com/wp-", "supabase.co", "fonts.googleapis"]) expect(body.includes(bad), bad).toBe(false);
  });

  it("copy from src/data appears word for word", () => {
    const t = text(html);
    for (const n of needles[pg.key]) expect(t, n.slice(0, 50)).toContain(norm(n));
  });

  it("hero: photo first in body, inlined AVIF, gated, within the 70 KB budget", () => {
    const body = html.slice(html.indexOf("<body"));
    expect(body.indexOf("data-ff-lcp-hero")).toBeGreaterThan(-1);
    expect(body.indexOf("<picture")).toBeLessThan(body.indexOf("<header"));
    expect(body.indexOf("<header")).toBeLessThan(body.indexOf('class="atf-ready"'));
    expect(html).toMatch(/\.atf:not\(:has\(>\s*\.atf-ready\)\)\s*\{\s*visibility:\s*hidden/);
    expect(html).not.toMatch(/<link[^>]+rel="preload"/);
    expect(html).not.toMatch(/transition:\s*all/);
    const hero = [...body.slice(0, body.indexOf("<header")).matchAll(/data:image\/avif;base64,([A-Za-z0-9+/=]+)/g)];
    expect(hero.length).toBeGreaterThanOrEqual(1);
    expect(hero.reduce((s, m) => s + Buffer.from(m[1]!, "base64").length, 0)).toBeLessThanOrEqual(70 * 1024);
  });
});

describe("page specifics", () => {
  it("custom stamps: 50-year fix and typo fix are in place, Portland sentence kept", () => {
    const t = text(read("/custom-stamps/"));
    expect(t).toContain("available in various styles and ink colors");
    expect(t).toContain("….whether you are from Portland, Maine or Portland, Oregon!...");
  });

  it("notary: four priced products, Buy now! goes to #buy and #buy exists", () => {
    const html = read("/missouri-notary-stamp/");
    for (const price of ["$22", "$30", "$32", "$19.95"]) expect(text(html)).toContain(price);
    expect(html.match(/href="#buy"/g)?.length).toBe(4);
    expect(html).toMatch(/id="buy"/);
  });

  it('name tags: the product-list sentence no longer says "custom stamps"', () => {
    const t = text(read("/magnetic-name-tags/"));
    expect(t).not.toContain("custom stamps");
    expect(t).toContain("We offer a wide variety of custom magnetic name tags to meet your unique needs, including:");
  });
});
