// Local Lighthouse mobile runs against a running preview. Prints each run's scores and the median.
// Usage: npx astro preview --port 4321 &  node scripts/perf/lighthouse-local.mjs http://127.0.0.1:4321/ [runs=3]
// Needs lighthouse available to npx (not a project dependency): npx -y lighthouse.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const url = process.argv[2] ?? "http://127.0.0.1:4321/";
const runs = Number(process.argv[3] ?? 3);
const chrome = process.env.CHROME ?? "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome";
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "lh-"));
const results = [];
for (let i = 0; i < runs; i++) {
  const out = path.join(tmp, `run${i}.json`);
  execFileSync(
    "npx",
    ["-y", "lighthouse", url, "--form-factor=mobile", "--only-categories=performance,accessibility,best-practices,seo", "--output=json", `--output-path=${out}`,
      "--chrome-flags=--headless=new --no-sandbox --disable-gpu", "--quiet"],
    { env: { ...process.env, CHROME_PATH: chrome }, stdio: ["ignore", "ignore", "inherit"] },
  );
  const j = JSON.parse(fs.readFileSync(out, "utf8"));
  const c = j.categories;
  const r = {
    perf: Math.round(c.performance.score * 100),
    a11y: Math.round(c.accessibility.score * 100),
    bp: Math.round(c["best-practices"].score * 100),
    seo: Math.round(c.seo.score * 100),
    lcp: Math.round(j.audits["largest-contentful-paint"].numericValue),
    cls: Number(j.audits["cumulative-layout-shift"].numericValue.toFixed(3)),
    tbt: Math.round(j.audits["total-blocking-time"].numericValue),
  };
  results.push(r);
  console.log(JSON.stringify(r));
}
const median = (k) => [...results.map((r) => r[k])].sort((a, b) => a - b)[Math.floor(results.length / 2)];
console.log("median", JSON.stringify(Object.fromEntries(["perf", "a11y", "bp", "seo", "lcp", "cls", "tbt"].map((k) => [k, median(k)]))));
