// Swap each option into the real homepage hero, screenshot the built site, then
// put src/ back. The committed tree must not contain those temporary swaps.
import { spawn, execFileSync } from "node:child_process";
import { copyFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const root = new URL("../..", import.meta.url).pathname;
const chrome = "/usr/bin/google-chrome";

function restoreSrc() {
  execFileSync("git", ["checkout", "--", "src"], { cwd: root, stdio: "inherit" });
}

function run(cmd, args) {
  execFileSync(cmd, args, { cwd: root, stdio: "inherit" });
}

async function waitForServer(url) {
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // preview is still starting
    }
    await delay(250);
  }
  throw new Error(`preview did not answer ${url}`);
}

function startPreview() {
  const child = spawn("npx", ["astro", "preview", "--host", "127.0.0.1", "--port", "4399"], {
    cwd: root,
    stdio: "inherit",
  });
  return child;
}

async function stopPreview(child) {
  if (!child || child.killed) return;
  child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    delay(4000).then(() => {
      child.kill("SIGKILL");
    }),
  ]);
}

async function shoot(browser, n) {
  const dir = `${root}docs/header-options/option-${n}`;
  copyFileSync(`${dir}/scene-desktop.jpg`, `${root}src/assets/springfield-stamps4.jpg`);
  copyFileSync(`${dir}/scene-mobile.jpg`, `${root}src/assets/springfield-stamps-mobile.jpg`);
  run("npm", ["run", "build"]);
  const preview = startPreview();
  try {
    await waitForServer("http://127.0.0.1:4399/");
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    await page.goto("http://127.0.0.1:4399/", { waitUntil: "networkidle" });
    await page.locator("[data-ff-lcp-hero]").waitFor({ state: "visible" });
    await page.screenshot({ path: `${dir}/mock-desktop.png` });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: `${dir}/mock-mobile.png` });
    await page.close();
  } finally {
    await stopPreview(preview);
  }
}

const browser = await chromium.launch({ executablePath: chrome, headless: true });
try {
  for (const n of [1, 2, 3, 4, 5]) {
    console.log(`shooting option ${n}`);
    await shoot(browser, n);
  }
} finally {
  await browser.close();
  restoreSrc();
  console.log("src restored");
}
