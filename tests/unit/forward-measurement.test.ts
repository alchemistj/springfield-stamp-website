import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import * as esbuild from "esbuild";
import { CLIENT_UA_HEADER, MEASUREMENT_COLLECT_URL, forwardMeasurementCollect } from "../../server/lib/forwardMeasurementCollect";
import { handleSiteEvent } from "../../api/site-events.js";

const VID = "11111111-1111-4111-8111-111111111111";
const SID = "22222222-2222-4222-8222-222222222222";

const event = {
  contractVersion: "ff-measure.v1",
  siteKey: "springfield-stamp-website",
  event: "page_view",
  eventId: "33333333-3333-4333-8333-333333333333",
  ff_vid: VID,
  ff_sid: SID,
  visitorId: VID,
  sessionId: SID,
  currentPath: "/",
  occurredAt: "2026-11-09T21:00:00.000Z",
  automation: false,
  engaged: false,
  environment: "production",
  device: "desktop",
};

describe("forwardMeasurementCollect", () => {
  it("posts to the FF Reports collector with the visitor user agent", async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 204 })) as unknown as typeof fetch;
    await forwardMeasurementCollect(JSON.stringify({ ok: true }), "Mozilla/5.0 Test", "https://www.springfieldstamp.com", fetchImpl);
    const [url, init] = (fetchImpl as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0]!;
    expect(url).toBe(MEASUREMENT_COLLECT_URL);
    expect(url).toBe("https://ff-reports-analytics.vercel.app/api/measurement/collect");
    const headers = init.headers as Headers;
    expect(headers.get(CLIENT_UA_HEADER)).toBe("Mozilla/5.0 Test");
    expect(headers.get("origin")).toBe("https://www.springfieldstamp.com");
    expect(init.method).toBe("POST");
  });
});

describe("api/site-events", () => {
  it("ships the bundled handler, with no local imports Vercel would leave unresolved", async () => {
    const shipped = readFileSync(new URL("../../api/site-events.js", import.meta.url), "utf8");
    expect(shipped).not.toMatch(/from\s+["']/);
    const result = await esbuild.build({
      entryPoints: ["server/lib/siteEventHandler.ts"],
      bundle: true,
      platform: "node",
      format: "esm",
      target: "node22",
      legalComments: "none",
      banner: {
        js: "// Committed bundle of server/lib/siteEventHandler.ts. Vercel runs this file and does not bundle .ts imports.",
      },
      write: false,
    });
    const built = result.outputFiles[0]?.text;
    expect(built).toBeTruthy();
    expect(shipped).toBe(built);
  });

  it("forwards a valid event and strips the cookie-key aliases", async () => {
    const seen: string[] = [];
    const fetchImpl = (async (_url: string, init?: RequestInit) => {
      seen.push(String(init?.body));
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as unknown as typeof fetch;
    const res = await handleSiteEvent(
      new Request("https://www.springfieldstamp.com/api/site-events", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "https://www.springfieldstamp.com", "user-agent": "Mozilla/5.0" },
        body: JSON.stringify(event),
      }),
      fetchImpl,
    );
    expect(res.status).toBe(204);
    const forwarded = JSON.parse(seen[0]!) as Record<string, unknown>;
    expect(forwarded["visitorId"]).toBe(VID);
    expect(forwarded["sessionId"]).toBe(SID);
    expect(forwarded).not.toHaveProperty("ff_vid");
    expect(forwarded).not.toHaveProperty("ff_sid");
  });

  it("still answers 204 when FF Reports rejects the site key", async () => {
    const fetchImpl = (async () => new Response(JSON.stringify({ error: "Unknown site" }), { status: 403 })) as unknown as typeof fetch;
    const res = await handleSiteEvent(
      new Request("https://www.springfieldstamp.com/api/site-events", {
        method: "POST",
        headers: { "content-type": "application/json", "user-agent": "Mozilla/5.0" },
        body: JSON.stringify(event),
      }),
      fetchImpl,
    );
    expect(res.status).toBe(204);
  });

  it("does not forward an invalid event and sets no identity cookie", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    const res = await handleSiteEvent(
      new Request("https://www.springfieldstamp.com/api/site-events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ event: "nope" }),
      }),
      fetchImpl,
    );
    expect(res.status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("rejects a GET with no cookies", async () => {
    const res = await handleSiteEvent(new Request("https://www.springfieldstamp.com/api/site-events"));
    expect(res.status).toBe(405);
    expect(res.headers.get("set-cookie")).toBeNull();
  });
});
