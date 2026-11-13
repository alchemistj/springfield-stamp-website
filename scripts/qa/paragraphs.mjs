// Paragraph checks for a rebuild (Rule 4 typography, Rule 0.4 keeps the human work).
// Ported from alchemistj/springfield-warrior-sports-website PR #9
// (scripts/qa/paragraphs.mjs @ 927b217). Adaptations for this site: page list,
// live HTML path (docs/reference/raw, the saved springfieldstamp.com captures;
// the live host answers 403 from this network), chrome executable, and selectors.
//
// 1. Length: every body paragraph renders at most 4 lines at 1440 (Rule 4: paragraphs 3-4 lines max).
//    A paragraph that is a single sentence is reported but does not fail: it cannot split without changing words.
//    390 is reported too, for information: 4 lines there is about 30 words, so it does not fail the check.
// 2. Parity: every paragraph on the live site (from the saved capture in docs/reference/raw/<slug>.html)
//    is its own paragraph in the build. A live <p> split by a blank line (<br><br>) counts as separate
//    paragraphs. A live paragraph may be split into consecutive build paragraphs (allowed when it would
//    break the 4-line max), but only between sentences: each part but the last must end a sentence.
//    It must never be merged into a longer paragraph, and never dropped.
//    A live <p> whose text is a heading on the rebuild counts as kept (the rebuild uses real headings
//    where the live Thrive page used a <p>).
//
// The rebuild spec (docs/SPEC-astro-rebuild.md) already changed three bits of wording. Parity
// compares text after those required fixes, so they are not reported as missing paragraphs:
// "60 years" / "over 60 years" / "60+ years" → the 50 equivalent, "avaailable" → "available",
// and the name-tag list sentence "custom stamps" → "magnetic name tags".
//
// Ignored live text: Gravity Forms' required-fields note (inside the form).
//
// Usage: node scripts/qa/paragraphs.mjs <build-base-url> [out.md]
//   PAGES=home,about limits the pages. Exit code 1 when any check fails.
import { chromium } from "playwright";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const [base, outFile = "paragraph-report.md"] = process.argv.slice(2);
if (!base) { console.error("usage: node scripts/qa/paragraphs.mjs <build-base-url> [out.md]"); process.exit(2); }
const only = (process.env.PAGES || "").split(",").filter(Boolean);
const PAGES = [
  ["home", "/"],
  ["custom-stamps", "/custom-stamps/"],
  ["missouri-notary-stamp", "/missouri-notary-stamp/"],
  ["magnetic-name-tags", "/magnetic-name-tags/"],
  ["about", "/about/"],
  ["contact", "/contact/"],
];
const pages = PAGES.filter(([slug]) => existsSync(path.join("docs/reference/raw", `${slug}.html`)) && (!only.length || only.includes(slug)));
const MAX_LINES = 4;
const MIN_CHARS = 25; // shorter fragments are labels, not paragraphs
// Copy the rebuild was already required to replace. These are not merges: the words differ,
// and a paragraph fix must not change words. Homepage client copy is commit 6eb5eb8 (hero
// subhead, replaced product rows, full brand name in the workflow intro, the first testimonial
// and the customer-service paragraph). The magnetic page keeps one product list; the live
// capture also has the duplicate heading and its "specific business needs" lead.
const REPLACED = new Set([
  "High-quality stamps, name tags & awards. Fast turnaround, friendly service.",
  "Leave a lasting impression with custom stamps crafted to your exact specifications. Choose from a variety of sizes, styles, and ink colors to create unique stamps for your business, personal use, or special occasions.",
  "Make introductions a breeze with professional-looking magnetic name tags. Our customizable options allow you to showcase your brand logo, personalize with employee names, and choose from various styles and materials to match your needs.",
  "Simplify your stamping needs with our convenient self-inking stamps. These stamps offer clean, crisp impressions with every use, eliminating the need for separate ink pads. Perfect for everyday tasks like signing documents, addressing envelopes, or personalizing packaging.",
  "Add a touch of elegance and professionalism to your correspondence with a personalized address stamp. Choose from classic or decorative designs, and let us create a stamp that reflects your unique style.",
  "Elevate your workspace with professional and stylish desk name plates. Our high-quality materials and elegant designs ensure your name stands out, making a lasting impression on visitors and colleagues.",
  "Celebrate accomplishments and recognition with beautiful acrylic awards. We offer a variety of styles and sizes to suit any occasion, allowing you to personalize each award with text, logos, or images.",
  "Ordering your custom products from Springfield Stamp is simple and hassle-free.",
  "\"I needed custom stamps in a hurry, and Springfield Stamp came to the rescue! They had my order ready in just a few days, and the quality is fantastic.",
  "At Springfield Stamp, we don't just sell products, we build relationships. Our friendly and knowledgeable team is dedicated to providing exceptional customer service. We'll take the time to understand your needs, answer your questions, and offer expert suggestions to ensure you get the perfect product for your specific requirements.",
  "Find the Perfect name tag for Your Unique Needs",
  "We offer a wide variety of magnetic name tags to meet your specific business needs, including:",
]);
const CHROME = [
  process.env.CHROME,
  "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome",
  "/opt/pw-browsers/chromium-1243/chrome-linux/chrome",
  "/usr/local/bin/google-chrome",
].find((p) => p && existsSync(p));

// Runs in the page: the paragraphs of the main content, split on blank lines (<br><br>).
function collect({ maxLines, withReviews, minChars }) {
  const CHROME_SEL = "header, footer, nav, form, [data-region=header], [data-region=footer], #tve_header_wrapper, #tve_footer_wrapper, .thrv_header, .thrv_footer, .site-header, .site-footer, .trust-bar, .call-bar, [data-skip-paragraphs]";
  // Reviews are customers' words: they count for parity (not dropped or merged) but not for the length rule.
  const SKIP = withReviews ? CHROME_SEL : CHROME_SEL + ", .review-band, .b2-quotes, .quote, blockquote, [class*=review], [class*=testimonial]";
  const norm = (t) => t.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  // Required wording fixes from docs/SPEC-astro-rebuild.md. Applied to both sides.
  const canon = (t) => t
    .replace(/\b60\+ years\b/g, "50+ years")
    .replace(/\bover 60 years\b/g, "over 50 years")
    .replace(/\b60 years\b/g, "50 years")
    .replace(/\bavaailable\b/g, "available")
    .replace("wide variety of custom stamps to meet your specific business needs", "wide variety of magnetic name tags to meet your specific business needs")
    // The rebuild draws the phone emoji in its own span, so the space after it is not in the text node.
    .replace(/([\u{1F300}-\u{1FAFF}])(?=\S)/gu, "$1 ");
  const out = [];
  for (const p of document.querySelectorAll("p")) {
    if (p.closest(SKIP)) continue;
    const cs = getComputedStyle(p);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.fontSize === "0px") continue;
    // Split on two or more <br> in a row (a blank line in the copy).
    const parts = [];
    let cur = "";
    let brRun = 0;
    const walk = (node) => {
      for (const n of node.childNodes) {
        if (n.nodeType === 3) { if (n.textContent.trim()) brRun = 0; cur += n.textContent; }
        else if (n.nodeName === "BR") { brRun++; if (brRun >= 2) { parts.push(cur); cur = ""; } else cur += " "; }
        else {
          // Hidden runs (mobile-only sentences, font-size 0) are not part of the rendered paragraph.
          if (n.nodeType === 1) {
            const s = getComputedStyle(n);
            if (s.display === "none" || s.visibility === "hidden" || s.fontSize === "0px") { brRun = 0; continue; }
          }
          brRun = 0; walk(n);
        }
      }
    };
    walk(p);
    parts.push(cur);
    // Line count of the whole <p> as rendered (rects grouped by vertical position).
    let lines = 0;
    if (maxLines) {
      const range = document.createRange();
      range.selectNodeContents(p);
      const tops = [...range.getClientRects()].filter((r) => r.width > 2 && r.height > 2).map((r) => Math.round(r.top + r.height / 2));
      const uniq = [];
      for (const t of tops.sort((a, b) => a - b)) if (!uniq.length || t - uniq[uniq.length - 1] > 4) uniq.push(t);
      lines = uniq.length;
    }
    for (const part of parts) {
      const t = canon(norm(part));
      if (t.length >= minChars) out.push({ text: t, lines: parts.length > 1 ? null : lines });
    }
  }
  return out;
}

function headingTexts() {
  const SKIP = "header, footer, nav, form, #tve_header_wrapper, #tve_footer_wrapper, .thrv_header, .thrv_footer, .site-header, .site-footer";
  const norm = (t) => t.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  const out = [];
  for (const h of document.querySelectorAll("h1, h2, h3, h4, h5, h6, figcaption")) {
    if (h.closest(SKIP)) continue;
    const cs = getComputedStyle(h);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const t = norm(h.textContent || "");
    if (t) out.push(t);
  }
  return out;
}

const browser = await chromium.launch(CHROME ? { executablePath: CHROME, args: ["--no-sandbox", "--disable-dev-shm-usage"] } : {});
const rows = [];
const pending = []; // [slug, live paragraph] not found on its own page; checked site-wide at the end
const allBuild = new Set();
let fails = 0;
for (const [slug, pagePath] of pages) {
  // Live paragraphs from the saved capture (no network: scripts and styles are not needed for text).
  const live = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await live.route("**/*", (r) => r.abort());
  await live.setContent(readFileSync(path.join("docs/reference/raw", `${slug}.html`), "utf8"), { waitUntil: "domcontentloaded" }).catch(() => {});
  const IGNORE = [/indicates required fields/i];
  const seenLive = new Set();
  const liveParas = (await live.evaluate(collect, { maxLines: 0, withReviews: true, minChars: MIN_CHARS })).filter((l) => {
    if (IGNORE.some((re) => re.test(l.text)) || seenLive.has(l.text)) return false;
    seenLive.add(l.text);
    return true;
  });
  await live.close();

  const url = `${base.replace(/\/$/, "")}${pagePath}`;
  const byWidth = {};
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const p = await browser.newPage({ viewport: { width: w, height: h } });
    await p.goto(url, { waitUntil: "networkidle" });
    byWidth[w] = await p.evaluate(collect, { maxLines: MAX_LINES, withReviews: false, minChars: MIN_CHARS });
    byWidth[`parity${w}`] = await p.evaluate(collect, { maxLines: 0, withReviews: true, minChars: MIN_CHARS });
    if (w === 1440) byWidth.headings = await p.evaluate(headingTexts);
    await p.close();
  }
  // 1440 is the parity order. 390 is included so a paragraph that only renders on the phone still counts.
  const sequences = [byWidth.parity1440.map((b) => b.text), byWidth.parity390.map((b) => b.text)];
  const headings = new Set(byWidth.headings.map((h) => h.toLowerCase()));
  for (const texts of sequences) texts.forEach((t) => allBuild.add(t));
  for (const h of byWidth.headings) allBuild.add(h);
  const issues = [];
  const notes = [];

  // Parity
  for (const lp of liveParas) {
    if (REPLACED.has(lp.text) || sequences.some((texts) => texts.includes(lp.text)) || headings.has(lp.text.toLowerCase())) continue;
    let split = null;
    for (const texts of sequences) {
      for (let i = 0; i < texts.length && !split; i++) {
        let acc = texts[i];
        for (let j = i + 1; j < texts.length && acc.length < lp.text.length; j++) {
          acc += " " + texts[j];
          if (acc === lp.text) { split = texts.slice(i, j + 1); break; }
        }
      }
    }
    if (split) {
      // A split must fall between sentences: every part but the last ends with . ! or ? (closing quotes allowed),
      // and the next part starts a new sentence, not a lowercase word.
      // A next part that starts in lowercase continues the sentence (e.g. a split after "Mo.").
      split.slice(0, -1).forEach((part, k) => {
        const next = split[k + 1];
        if (!/[.!?]["'”’)]*$/.test(part) || /^[a-z]/.test(next)) issues.push(`split mid-sentence: "…${part.slice(-50)}" / "${next.slice(0, 40)}…"`);
      });
      continue;
    }
    const host = sequences.flat().find((b) => b.includes(lp.text));
    if (host) issues.push(`merged: "${lp.text.slice(0, 70)}…" is inside a longer build paragraph ("${host.slice(0, 50)}…")`);
    else pending.push([slug, lp.text, issues]);
  }
  // Length
  for (const w of [1440, 390]) {
    for (const b of byWidth[w]) {
      if (!(b.lines && b.lines > MAX_LINES)) continue;
      // One sentence on its own cannot be split without changing words: report it, do not fail.
      // A period before a lowercase word is not a new sentence (the same rule as a split after "Mo.").
      const oneSentence = !/[.!?]["'”’)]*\s+[A-Z0-9“"'(]/.test(b.text);
      if (w === 1440 && oneSentence) notes.push(`${w}px (one sentence, cannot split): ${b.lines} lines: "${b.text.slice(0, 60)}…"`);
      else if (w === 1440) issues.push(`${w}px: ${b.lines} lines (max ${MAX_LINES}): "${b.text.slice(0, 70)}…"`);
      else notes.push(`${w}px (info only): ${b.lines} lines: "${b.text.slice(0, 60)}…"`);
    }
  }
  fails += issues.length;
  rows.push(`## ${slug}: ${issues.length ? issues.length + " issue(s)" : "passes"}\n${issues.map((i) => `- ${i}`).join("\n")}${notes.length ? "\n" + notes.map((n) => `- ${n}`).join("\n") : ""}`);
}
await browser.close();
// A paragraph moved to another page (reviews spread across pages) still counts; one found nowhere is missing.
for (const [slug, text, issues] of pending) {
  if (allBuild.has(text)) continue;
  issues.push(`missing as its own paragraph: "${text.slice(0, 80)}…"`);
  fails++;
  const i = rows.findIndex((r) => r.startsWith(`## ${slug}:`));
  rows[i] = `## ${slug}: ${issues.length} issue(s)\n${issues.map((x) => `- ${x}`).join("\n")}`;
}
writeFileSync(outFile, `# Paragraph checks on ${base}\n\nTotal issues: ${fails}\n\n${rows.join("\n\n")}\n`);
console.log(`Total issues: ${fails}`);
for (const r of rows) console.log(r.split("\n")[0]);
process.exit(fails ? 1 : 0);
