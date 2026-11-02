import { describe, expect, it, vi } from "vitest";
import { handlePreviewLead } from "../../api/preview-forms-lead.js";

const TARGET = "https://forms-preview.example.test/api/lead";
const HOST = "springfield-stamp-git-build-x.vercel.app";
const req = (init: { method?: string; origin?: string | null; host?: string; type?: string; body?: string } = {}) =>
  new Request(`https://${init.host ?? HOST}/api/preview-forms-lead`, {
    method: init.method ?? "POST",
    headers: {
      "content-type": init.type ?? "application/json",
      host: init.host ?? HOST,
      ...(init.origin === null ? {} : { origin: init.origin ?? `https://${HOST}` }),
    },
    body: (init.method ?? "POST") === "POST" ? (init.body ?? JSON.stringify({ siteKey: "springfield-stamp-website" })) : undefined,
  });
const upstream = () => vi.fn(async () => new Response(JSON.stringify({ ok: true, id: "3f2b8c1e-5d4a-4b6f-9a7c-1e2d3c4b5a69" }), { status: 200 })) as unknown as typeof fetch;

describe("preview relay", () => {
  it("returns 404 in production, even when configured", async () => {
    const f = upstream();
    const r = await handlePreviewLead(req(), { VERCEL_ENV: "production", FORMS_PREVIEW_LEAD_URL: TARGET }, f);
    expect(r.status).toBe(404);
    expect(f).not.toHaveBeenCalled();
  });
  it("returns 404 when FORMS_PREVIEW_LEAD_URL is unset or blank", async () => {
    const f = upstream();
    expect((await handlePreviewLead(req(), { VERCEL_ENV: "preview" }, f)).status).toBe(404);
    expect((await handlePreviewLead(req(), { VERCEL_ENV: "preview", FORMS_PREVIEW_LEAD_URL: "  " }, f)).status).toBe(404);
    expect(f).not.toHaveBeenCalled();
  });
  it("forwards the JSON body to the configured URL with Origin set to its own origin", async () => {
    const f = upstream();
    const body = JSON.stringify({ siteKey: "springfield-stamp-website", name: "Test" });
    const r = await handlePreviewLead(req({ body }), { VERCEL_ENV: "preview", FORMS_PREVIEW_LEAD_URL: TARGET }, f);
    expect(r.status).toBe(200);
    expect(((await r.json()) as { ok: boolean }).ok).toBe(true);
    const [url, init] = (f as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toBe(TARGET);
    expect(init.body).toBe(body);
    expect((init.headers as Record<string, string>)["Origin"]).toBe(`https://${HOST}`);
  });
  it("sets Origin from the host even when the browser sent none", async () => {
    const f = upstream();
    await handlePreviewLead(req({ origin: null }), { VERCEL_ENV: "preview", FORMS_PREVIEW_LEAD_URL: TARGET }, f);
    const [, init] = (f as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)["Origin"]).toBe(`https://${HOST}`);
  });
  it("refuses a foreign Origin, non-vercel hosts, non-POST and non-JSON", async () => {
    const f = upstream();
    const env = { VERCEL_ENV: "preview", FORMS_PREVIEW_LEAD_URL: TARGET };
    expect((await handlePreviewLead(req({ origin: "https://evil.test" }), env, f)).status).toBe(403);
    expect((await handlePreviewLead(req({ host: "www.springfieldstamp.com", origin: "https://www.springfieldstamp.com" }), env, f)).status).toBe(403);
    expect((await handlePreviewLead(req({ method: "GET" }), env, f)).status).toBe(405);
    expect((await handlePreviewLead(req({ type: "text/plain" }), env, f)).status).toBe(415);
    expect((await handlePreviewLead(req({ body: "{nope" }), env, f)).status).toBe(400);
    expect(f).not.toHaveBeenCalled();
  });
  it("passes the upstream status through, and reports an unreachable upstream as 502", async () => {
    const env = { VERCEL_ENV: "preview", FORMS_PREVIEW_LEAD_URL: TARGET };
    const f403 = vi.fn(async () => new Response(JSON.stringify({ ok: false, error: "origin not allowed" }), { status: 403 })) as unknown as typeof fetch;
    expect((await handlePreviewLead(req(), env, f403)).status).toBe(403);
    const fail = vi.fn(async () => {
      throw new Error("down");
    }) as unknown as typeof fetch;
    expect((await handlePreviewLead(req(), env, fail)).status).toBe(502);
  });
  it("contains no production endpoint and no secrets", async () => {
    const { readFile } = await import("node:fs/promises");
    const src = await readFile("api/preview-forms-lead.js", "utf8");
    expect(src).not.toContain("forms.fluidframemarketing.com");
    expect(src).not.toMatch(/Bearer|apikey|secret/i);
  });
});
