// Vercel type-strips a root api/*.ts entry and does not bundle its relative .ts imports, so
// /api/site-events crashes with ERR_MODULE_NOT_FOUND (the same failure middleware had).
// On Vercel, fold the collector and the forwarder into one api/site-events.js and remove the
// .ts entry so the deployed function has no local .ts imports. Tests keep importing the .ts source.
// Do not rewrite .vercel/output/config.json here. A negative lookahead in a route src fails the
// deployment (Vercel rejects it). The beacon posts to /api/site-events/, which the function serves.
import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";

const onVercel = process.env.VERCEL === "1";
const check = process.argv.includes("--check");
if (!onVercel && !check) {
  console.log("bundle-vercel-functions: skipped");
  process.exit(0);
}

const outfile = check ? path.join(process.cwd(), ".vercel-bundle-check", "site-events.js") : path.join(process.cwd(), "api", "site-events.js");
fs.mkdirSync(path.dirname(outfile), { recursive: true });

await esbuild.build({
  entryPoints: ["api/site-events.ts"],
  outfile,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  legalComments: "none",
});

const js = fs.readFileSync(outfile, "utf8");
if (/\.ts["']/.test(js)) {
  console.error("bundle-vercel-functions: output still imports a .ts file");
  process.exit(1);
}

if (check) {
  const mod = await import(outfile);
  const res = await mod.handleSiteEvent(
    new Request("https://www.springfieldstamp.com/api/site-events", {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "Mozilla/5.0" },
      body: JSON.stringify({
        contractVersion: "ff-measure.v1",
        siteKey: "springfield-stamp-website",
        event: "page_view",
        eventId: "33333333-3333-4333-8333-333333333333",
        visitorId: "11111111-1111-4111-8111-111111111111",
        sessionId: "22222222-2222-4222-8222-222222222222",
        currentPath: "/",
        occurredAt: "2026-11-09T21:00:00.000Z",
        automation: true,
        engaged: false,
        environment: "test",
        device: "desktop",
      }),
    }),
    async () => new Response(null, { status: 204 }),
  );
  if (res.status !== 204) {
    console.error("bundle-vercel-functions: bundled handler status", res.status);
    process.exit(1);
  }
  fs.rmSync(path.dirname(outfile), { recursive: true, force: true });
  console.log("bundle-vercel-functions: check ok");
  process.exit(0);
}

fs.rmSync(path.join(process.cwd(), "api", "site-events.ts"));
console.log("bundle-vercel-functions: wrote api/site-events.js");
