import { defineConfig } from "@playwright/test";
import fs from "node:fs";

// Uses the Chromium that is already installed (do not run `playwright install`).
const candidates = [
  process.env.CHROME,
  "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome",
  "/opt/pw-browsers/chromium-1243/chrome-linux/chrome",
].filter((p): p is string => !!p && fs.existsSync(p));
const executablePath = candidates[0];

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4321",
    launchOptions: executablePath ? { executablePath } : {},
  },
  // Tests run against the built site served by `astro preview`.
  webServer: {
    command: "node --experimental-strip-types scripts/serve-preview.mjs",
    url: "http://127.0.0.1:4321/",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
