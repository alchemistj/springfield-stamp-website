// Subset Hoarse Rough 02 to the glyphs the site actually sets in that font, plus space and
// basic punctuation. Commit the WOFF2 this writes (`src/assets/fonts/hoarse-rough-02-subset.woff2`).
//
//   python3 -m pip install --user fonttools brotli
//   node scripts/fonts/subset-display.mjs
//
// Strings below are the text rendered with `var(--font-display)`, after `text-transform: uppercase`
// where the CSS applies it. Sources: src/data/** and the components/pages that set the display font
// (hero headlines, SectionTitle, about/contact/custom/magnetic/notary display lines, PageStub h1).
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const displayText = [
  // Home hero (the second line is uppercased in CSS) and section titles.
  "Springfield Stamp:",
  "YOUR TRUSTED PARTNER FOR CUSTOM PRODUCTS",
  "How We Can Help…",
  "Our Workflow Process Might Be the Easiest Thing You Do All Day!",
  "Why Do Business with Us?",
  "About Us",
  // About: kicker and h1 are uppercased; the why title and the closing word "PERFECT" are not.
  "ABOUT",
  "SPRINGFIELD STAMP",
  "Why Choose Springfield Stamp?",
  "PERFECT",
  // Contact: h1, the reach line (uppercased, including the NAP number), and the form heading.
  "CONTACT US",
  "YOU CAN REACH US AT:",
  "(417) 881-8828",
  "SEND US A MESSAGE",
  // Custom stamps: brand and section titles and the call heading are uppercased.
  "FIND THE PERFECT STAMP FOR YOUR UNIQUE NEEDS",
  "READY TO CREATE YOUR OWN CUSTOM STAMP?",
  "WHY CHOOSE SPRINGFIELD STAMP?",
  "MAKE YOUR MARK WITH SPRINGFIELD STAMP",
  "GIVE US A CALL TODAY",
  // Magnetic name tags: brand and call heading are uppercased; section titles keep their case.
  "GIVE US A CALL TODAY TO GET STARTED!",
  "Find the Perfect Magnetic Name Tag for Your Needs",
  "Looking for something truly unique?",
  "Design Your Own in Minutes: It's Easy!",
  "The Power of Name Tags",
  "More Than Just Name Tags: Building Connection",
  "Ready to give your team the professional image they deserve?",
  // Notary: hero and section titles are uppercased.
  "YOUR ONE-STOP SPOT FOR MISSOURI",
  "NOTARY STAMPS",
  "MISSOURI NOTARY STAMP REQUIREMENTS",
  "BUY YOUR MISSOURI NOTARY SUPPLIES TODAY",
  // PageStub sets each route h1 in the display font, without a text transform.
  "Springfield Stamp: Your Trusted Partner for Custom Products",
  "Your Friendly Neighborhood CUSTOM STAMP Experts!",
  "Your One-Stop Spot for Missouri Notary Stamps",
  "MAGNETIC NAME TAGS that Make Connections Count!",
];

/** Space and basic punctuation, whether or not a current headline uses every mark. */
const basicPunctuation = " \u00a0.,;:!?\"'‘’“”()[]/\\-–—…·&";

const chars = [...new Set((displayText.join("") + basicPunctuation).normalize("NFC"))].sort().join("");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const srcFont = path.join(root, "src/assets/fonts/hoarse-rough-02.woff2");
const outFont = path.join(root, "src/assets/fonts/hoarse-rough-02-subset.woff2");
const textFile = path.join(mkdtempSync(path.join(tmpdir(), "ss-subset-")), "chars.txt");
writeFileSync(textFile, chars, "utf8");

const before = statSync(srcFont).size;
const run = spawnSync(
  "python3",
  ["-m", "fontTools.subset", srcFont, `--text-file=${textFile}`, "--flavor=woff2", `--output-file=${outFont}`],
  { stdio: "inherit" },
);
if (run.status !== 0) {
  console.error("pyftsubset failed. Install fonttools and brotli, then run this script again.");
  process.exit(run.status ?? 1);
}
const after = statSync(outFont).size;
console.log(`glyphs requested: ${[...chars].length}`);
console.log(`display font: ${before} bytes -> ${after} bytes (${outFont})`);
