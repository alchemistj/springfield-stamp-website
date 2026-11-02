// Captures full-page reference screenshots and computed design tokens from the
// live WordPress site, so the Astro rebuild can be compared against it.
// Usage: node scripts/reference/capture-live.mjs [outDir]
import { createRequire } from "node:module";
// Resolve playwright from the project or the global install (cloud containers).
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://www.springfieldstamp.com";
const PAGES = [
  ["home", "/"],
  ["custom-stamps", "/custom-stamps/"],
  ["missouri-notary-stamp", "/missouri-notary-stamp/"],
  ["magnetic-name-tags", "/magnetic-name-tags/"],
  ["about", "/about/"],
  ["contact", "/contact/"],
];
const VIEWPORTS = [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
];
const out = process.argv[2] ?? "docs/reference/live";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const tokens = {};
for (const [vpName, viewport] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const [name, path] of PAGES) {
    await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 60000 });
    // Scroll through so lazy images load, then return to top.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(out, `${name}-${vpName}.png`), fullPage: true });
    if (vpName === "desktop") {
      tokens[name] = await page.evaluate(() => {
        const pick = (sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const s = getComputedStyle(el);
          return {
            text: (el.textContent || "").trim().slice(0, 60),
            fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight,
            lineHeight: s.lineHeight, color: s.color, background: s.backgroundColor,
            letterSpacing: s.letterSpacing, textTransform: s.textTransform,
          };
        };
        return {
          body: pick("body"), h1: pick("h1"), h2: pick("h2"), h3: pick("h3"), p: pick("p"),
          button: pick(".tcb-button-link, .thrv-button a, a.tve_btn, button"),
          header: pick("header"), footer: pick("footer"),
        };
      });
    }
    console.log("captured", name, vpName);
  }
  await ctx.close();
}
writeFileSync(join(out, "computed-styles.json"), JSON.stringify(tokens, null, 2));
await browser.close();
