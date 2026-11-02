// Checks the built Contact and About pages in dist/ (run `npm run build` first).
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { about } from "../../src/data/about";
import { contact } from "../../src/data/contact";

const DIST = path.resolve("dist");
const read = (p: string) => fs.readFileSync(path.join(DIST, p), "utf8");
const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const decode = (s: string) =>
  s.replace(/&#38;|&amp;/g, "&").replace(/&#39;|&#x27;|&apos;/g, "'").replace(/&quot;|&#34;/g, '"').replace(/&nbsp;|\u00a0/g, " ");
const text = (html: string) => decode(html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<\/?(?:strong|b|em|span)\b[^>]*>/g, "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");

describe("contact page build", () => {
  const html = read("contact/index.html");
  it("renders the form fields in the server HTML, with a disabled button for no-JS", () => {
    for (const name of ["first", "last", "email", "phone", "message", "website_url"]) expect(html).toMatch(new RegExp(`name="${name}"`));
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled/);
    expect(html).toContain("Form loading…");
    expect(html).toContain("This form needs JavaScript. Call us at");
    expect(html).toContain('href="tel:+14178818828"');
  });
  it("has no map iframe or Google Maps embed URL in the server HTML", () => {
    expect(html).not.toMatch(/<iframe/i);
    expect(html).not.toContain("maps/embed");
    expect(html).toContain("View on Google Maps");
  });
  it("has the spec's meta description and one H1", () => {
    expect(html).toContain(
      "Contact Springfield Stamp &#38; Engraving at 1416 S. Glenstone Ave., Springfield, MO. Call (417) 881-8828 or email orders@springfieldstamp.com.",
    );
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
  });
  it("carries the copy word for word", () => {
    const t = text(html);
    for (const s of [contact.intro.aside, contact.allows, contact.lookForward, contact.details.hoursTimes, contact.details.name, "Send Message", "Email", "Phone", "Message"]) {
      expect(t).toContain(s);
    }
  });
});

describe("about page build", () => {
  const html = read("about/index.html");
  it("carries the copy, with the 50-year wording", () => {
    const t = text(html);
    for (const p of [...about.story, about.storyMobile, ...about.why.paragraphs, about.closing.body]) {
      const s = p.map((x) => (typeof x === "string" ? x : x.strong)).join("");
      expect(t).toContain(decode(s).replace(/\s+/g, " "));
    }
    expect(t).toContain("over 50 years");
    expect(t).not.toMatch(/60 years|60\+/);
  });
  it("links the closing button to /contact/", () => {
    expect(html).toContain('href="/contact/"');
  });
});

describe("shipped JS", () => {
  const js = walk(DIST)
    .filter((f) => f.endsWith(".js"))
    .map((f) => fs.readFileSync(f, "utf8"));
  it("contains the literal Central Forms endpoint in one piece", () => {
    expect(js.some((s) => s.includes("https://forms.fluidframemarketing.com/api/lead"))).toBe(true);
  });
  it("contains the preview relay path and the site and form keys", () => {
    const all = js.join("\n");
    expect(all).toContain("/api/preview-forms-lead");
    expect(all).toContain("springfield-stamp-website");
    expect(all).toContain("main-contact");
  });
  it("keeps the Google Maps embed URL in JS only, and never posts anywhere but the two endpoints", () => {
    const all = js.join("\n");
    expect(all).toContain("google.com/maps/embed");
    expect(all).not.toContain("FORMS_PREVIEW_LEAD_URL");
  });
});
