// Visual parity check. Serves the built site (`dist/`), screenshots every page in the route registry
// (read from dist/sitemap.xml) at 1440 and 390 wide, full page, saves them to docs/reference/build/
// next to the live references in docs/reference/live/, and prints how far apart they are.
//
// Usage: npm run build && node scripts/reference/compare.mjs [--pages home,about] [--sbs] [--out docs/reference/build]
//   --pages  comma list of page names (home, custom-stamps, ...). Default: all pages that have a live reference.
//   --sbs    also write <name>-<viewport>-sbs.png (live on the left, build on the right, cut into bands).
//   --band   band height in px for the difference table (default 200).
// Env: CHROME=<path to chromium> (default: /opt/pw-browsers chromium if present, else Playwright's own).
import { createRequire } from "node:module";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const sharp = require("sharp");

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : dflt;
};
const flag = (name) => args.includes(`--${name}`);
const OUT = opt("out", "docs/reference/build");
const LIVE = "docs/reference/live";
const DIST = "dist";
const BAND = Number(opt("band", 200));
const VIEWPORTS = [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
];

if (!fs.existsSync(path.join(DIST, "index.html"))) {
  console.error("dist/index.html not found. Run `npm run build` first.");
  process.exit(1);
}

// Page list from the registry-built sitemap.
const sitemap = fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
const paths = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
const nameOf = (p) => (p === "/" ? "home" : p.replace(/^\/|\/$/g, ""));
const wanted = opt("pages", "")
  .split(",")
  .filter(Boolean);
const pages = paths.map((p) => [nameOf(p), p]).filter(([n]) => (wanted.length ? wanted.includes(n) : fs.existsSync(`${LIVE}/${n}-desktop.png`)));

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif",
  ".svg": "image/svg+xml", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain",
};
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const file = path.join(DIST, p);
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const chromePath = process.env.CHROME ?? ["/opt/pw-browsers/chromium-1243/chrome-linux64/chrome", "/opt/pw-browsers/chromium-1243/chrome-linux/chrome"].find((p) => fs.existsSync(p));
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});
fs.mkdirSync(OUT, { recursive: true });

async function raw(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

// Mean absolute difference per band, over the overlapping rows, per channel average, 0-255.
function bandDiffs(a, b) {
  const rows = Math.min(a.h, b.h);
  const w = Math.min(a.w, b.w);
  const out = [];
  for (let y0 = 0; y0 < rows; y0 += BAND) {
    const y1 = Math.min(rows, y0 + BAND);
    let sum = 0, n = 0;
    for (let y = y0; y < y1; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const ia = (y * a.w + x) * 3, ib = (y * b.w + x) * 3;
        sum += Math.abs(a.data[ia] - b.data[ib]) + Math.abs(a.data[ia + 1] - b.data[ib + 1]) + Math.abs(a.data[ia + 2] - b.data[ib + 2]);
        n += 3;
      }
    }
    out.push({ y0, mae: sum / n });
  }
  return out;
}

const summary = [];
for (const [vpName, viewport] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const [name, p] of pages) {
    await page.goto(base + p, { waitUntil: "networkidle", timeout: 60000 });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 100));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    const buildFile = path.join(OUT, `${name}-${vpName}.png`);
    await page.screenshot({ path: buildFile, fullPage: true });
    const liveFile = path.join(LIVE, `${name}-${vpName}.png`);
    if (!fs.existsSync(liveFile)) {
      console.log(`${name} ${vpName}: no live reference`);
      continue;
    }
    const [live, build] = await Promise.all([raw(liveFile), raw(buildFile)]);
    const diffs = bandDiffs(live, build);
    const avg = diffs.reduce((s, d) => s + d.mae, 0) / diffs.length;
    const worst = [...diffs].sort((x, y) => y.mae - x.mae).slice(0, 5);
    console.log(
      `${name} ${vpName}: live ${live.w}x${live.h}, build ${build.w}x${build.h} (height delta ${build.h - live.h}px), mean band MAE ${avg.toFixed(1)}`,
    );
    console.log(`  worst bands (y: MAE): ${worst.map((d) => `${d.y0}: ${d.mae.toFixed(0)}`).join(", ")}`);
    summary.push({ name, vpName, liveH: live.h, buildH: build.h, avg });
    if (flag("sbs")) {
      const h = Math.max(live.h, build.h);
      const w = Math.max(live.w, build.w);
      const bg = { r: 255, g: 0, b: 255, alpha: 1 };
      const left = await sharp(liveFile).extend({ bottom: h - live.h, background: bg }).toBuffer();
      const right = await sharp(buildFile).extend({ bottom: h - build.h, background: bg }).toBuffer();
      const sbs = await sharp({ create: { width: w * 2 + 20, height: h, channels: 3, background: { r: 255, g: 0, b: 255 } } })
        .composite([{ input: left, left: 0, top: 0 }, { input: right, left: w + 20, top: 0 }])
        .png()
        .toBuffer();
      const step = vpName === "desktop" ? 1100 : 1500;
      for (let i = 0, y = 0; y < h; i++, y += step) {
        await sharp(sbs).extract({ left: 0, top: y, width: w * 2 + 20, height: Math.min(step, h - y) }).toFile(path.join(OUT, `${name}-${vpName}-sbs-${i}.png`));
      }
    }
  }
  await ctx.close();
}
await browser.close();
server.close();
fs.writeFileSync(path.join(OUT, "compare-summary.json"), JSON.stringify(summary, null, 2) + "\n");
