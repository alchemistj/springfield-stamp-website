import { describe, expect, it, vi } from "vitest";
import {
  FORM_KEY,
  LEAD_URL,
  PREVIEW_RELAY_URL,
  SITE_KEY,
  SubmissionAttempt,
  buildBody,
  classifyResponse,
  hasContactMethod,
  resolveEndpoint,
  submitLead,
  type FormValues,
} from "../../src/lib/forms";

const UUID = "3f2b8c1e-5d4a-4b6f-9a7c-1e2d3c4b5a69";
const values: FormValues = { first: " Test ", last: "Visitor ", email: "test@example.com", phone: "(417) 555-0142", message: "Test: stamp order, please ignore", honeypot: "" };
const ctx = {
  clientSubmissionId: UUID,
  formStartedAt: Date.parse("2026-11-02T12:00:00Z"),
  now: Date.parse("2026-11-02T12:00:30Z"),
  pageUrl: "https://www.springfieldstamp.com/contact/?utm_source=google&utm_medium=cpc",
  search: "?utm_source=google&utm_medium=cpc",
  referrer: "",
};

describe("request body (SOP 4a/4b)", () => {
  const body = buildBody(values, ctx);
  it("uses the registered keys and one submission id", () => {
    expect(body.siteKey).toBe("springfield-stamp-website");
    expect(body.formKey).toBe("main-contact");
    expect([SITE_KEY, FORM_KEY]).toEqual(["springfield-stamp-website", "main-contact"]);
    expect(body.clientSubmissionId).toBe(UUID);
  });
  it("joins first and last name, trims, and maps the other fields", () => {
    expect(body.name).toBe("Test Visitor");
    expect(body.email).toBe("test@example.com");
    expect(body.phone).toBe("(417) 555-0142");
    expect(body.message).toBe("Test: stamp order, please ignore");
    expect(body.honeypot).toBe("");
  });
  it("sends ISO timestamps, page url, null referrer and utm", () => {
    expect(body.formStartedAt).toBe("2026-11-02T12:00:00.000Z");
    expect(body.submittedAt).toBe("2026-11-02T12:00:30.000Z");
    expect(body.pageUrl).toBe(ctx.pageUrl);
    expect(body.referrer).toBeNull();
    expect(body.utm).toEqual({ source: "google", medium: "cpc", campaign: "", term: "", content: "" });
  });
  it("custom fields, if any, carry human labels and no technical keys", () => {
    for (const [key, field] of Object.entries(body.customFields)) {
      expect(field.label).toMatch(/^[A-Z][A-Za-z ]+$/);
      expect(["formSource", "clientSubmissionId"]).not.toContain(key);
    }
    expect(Object.keys(body)).not.toContain("recaptcha");
  });
  it("passes the honeypot value and clips long input to the Central Forms limits", () => {
    const b = buildBody({ ...values, honeypot: "http://spam.example", message: "x".repeat(6000) }, ctx);
    expect(b.honeypot).toBe("http://spam.example");
    expect(b.message).toHaveLength(5000);
  });
  it("requires a phone or an email", () => {
    expect(hasContactMethod({ email: "", phone: "" })).toBe(false);
    expect(hasContactMethod({ email: "a@b.co", phone: "" })).toBe(true);
    expect(hasContactMethod({ email: "", phone: "417" })).toBe(true);
  });
});

describe("host routing", () => {
  it("posts directly to Central Forms only from exactly www.springfieldstamp.com", () => {
    expect(resolveEndpoint("www.springfieldstamp.com")).toEqual({ kind: "direct", url: "https://forms.fluidframemarketing.com/api/lead" });
    expect(LEAD_URL).toBe("https://forms.fluidframemarketing.com/api/lead");
  });
  it("uses the same-origin relay on *.vercel.app", () => {
    expect(resolveEndpoint("springfield-stamp-git-build-about-contact-x.vercel.app")).toEqual({ kind: "relay", url: PREVIEW_RELAY_URL });
    expect(PREVIEW_RELAY_URL).toBe("/api/preview-forms-lead/");
  });
  it.each(["localhost", "127.0.0.1", "springfieldstamp.com", "www.springfieldstamp.com.evil.test", "evilspringfieldstamp.com", "vercel.app.evil.test", ""])(
    "posts nothing from %j",
    (host) => {
      expect(resolveEndpoint(host)).toEqual({ kind: "none" });
    },
  );
  it("is case-insensitive about the production host", () => {
    expect(resolveEndpoint("WWW.SpringfieldStamp.com").kind).toBe("direct");
  });
});

describe("response classification (SOP 4d)", () => {
  it("success needs ok:true and a real UUID id", () => {
    expect(classifyResponse(200, { ok: true, id: UUID, conversionEligible: true })).toEqual({ kind: "success", id: UUID, conversion: true });
    expect(classifyResponse(200, { ok: true })).toEqual({ kind: "unconfirmed" });
    expect(classifyResponse(200, { ok: true, id: "not-a-uuid" })).toEqual({ kind: "unconfirmed" });
    expect(classifyResponse(200, { ok: false, id: UUID })).toEqual({ kind: "unconfirmed" });
  });
  it("a duplicate is success with no conversion", () => {
    expect(classifyResponse(200, { ok: true, id: UUID, duplicate: true, conversionEligible: true })).toEqual({ kind: "success", id: UUID, conversion: false });
  });
  it("a quarantined lead is success with no conversion", () => {
    expect(classifyResponse(200, { ok: true, id: UUID, conversionEligible: false })).toEqual({ kind: "success", id: UUID, conversion: false });
  });
  it("400 not saved is invalid; 400 saved is unconfirmed", () => {
    expect(classifyResponse(400, { ok: false, reason: "validation" })).toEqual({ kind: "invalid" });
    expect(classifyResponse(400, { ok: false, saved: true })).toEqual({ kind: "unconfirmed" });
  });
  it("429 is rate limited; 403, 503 and junk are unconfirmed", () => {
    expect(classifyResponse(429, { ok: false })).toEqual({ kind: "rate_limited" });
    expect(classifyResponse(403, { ok: false })).toEqual({ kind: "unconfirmed" });
    expect(classifyResponse(503, { ok: false })).toEqual({ kind: "unconfirmed" });
    expect(classifyResponse(200, null)).toEqual({ kind: "unconfirmed" });
    expect(classifyResponse(500, "nope")).toEqual({ kind: "unconfirmed" });
  });
});

describe("submitLead", () => {
  const mk = (responses: Array<Response | Error>) => {
    const calls: Array<{ url: string; body: Record<string, unknown> }> = [];
    const fetchImpl = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), body: JSON.parse(String(init?.body)) as Record<string, unknown> });
      const next = responses.shift()!;
      if (next instanceof Error) throw next;
      return next;
    }) as unknown as typeof fetch;
    return { calls, fetchImpl };
  };
  const res = (status: number, json: unknown) => new Response(JSON.stringify(json), { status, headers: { "Content-Type": "application/json" } });
  const deps = (hostname: string, fetchImpl: typeof fetch, attempt: SubmissionAttempt) => ({
    hostname,
    fetchImpl,
    attempt,
    ctx: { formStartedAt: ctx.formStartedAt, now: ctx.now, pageUrl: ctx.pageUrl, search: ctx.search, referrer: "" },
  });

  it("posts nothing on localhost", async () => {
    const { fetchImpl, calls } = mk([]);
    const out = await submitLead(values, deps("localhost", fetchImpl, new SubmissionAttempt(() => UUID)));
    expect(out).toEqual({ kind: "not_sent" });
    expect(calls).toHaveLength(0);
  });

  it("posts to the literal production URL from the production host", async () => {
    const { fetchImpl, calls } = mk([res(200, { ok: true, id: UUID })]);
    await submitLead(values, deps("www.springfieldstamp.com", fetchImpl, new SubmissionAttempt(() => UUID)));
    expect(calls[0]!.url).toBe("https://forms.fluidframemarketing.com/api/lead");
  });

  it("posts to the relay on a preview host", async () => {
    const { fetchImpl, calls } = mk([res(200, { ok: true, id: UUID })]);
    await submitLead(values, deps("x-y.vercel.app", fetchImpl, new SubmissionAttempt(() => UUID)));
    expect(calls[0]!.url).toBe("/api/preview-forms-lead/");
  });

  it("keeps the same clientSubmissionId across retries until it succeeds, then makes a new one", async () => {
    let n = 0;
    const attempt = new SubmissionAttempt(() => `00000000-0000-4000-8000-00000000000${++n}`);
    const { fetchImpl, calls } = mk([res(503, { ok: false }), new Error("network"), res(429, { ok: false }), res(200, { ok: true, id: UUID, conversionEligible: true }), res(200, { ok: true, id: UUID })]);
    const outs = [];
    for (let i = 0; i < 5; i++) outs.push((await submitLead(values, deps("www.springfieldstamp.com", fetchImpl, attempt))).kind);
    expect(outs).toEqual(["unconfirmed", "unconfirmed", "rate_limited", "success", "success"]);
    const ids = calls.map((c) => c.body["clientSubmissionId"]);
    expect(ids.slice(0, 4)).toEqual(Array(4).fill("00000000-0000-4000-8000-000000000001"));
    expect(ids[4]).toBe("00000000-0000-4000-8000-000000000002");
  });

  it("a 400 (nothing stored) starts a new inquiry next time", async () => {
    let n = 0;
    const attempt = new SubmissionAttempt(() => `id-${++n}`);
    const { fetchImpl, calls } = mk([res(400, { ok: false }), res(503, { ok: false })]);
    expect((await submitLead(values, deps("www.springfieldstamp.com", fetchImpl, attempt))).kind).toBe("invalid");
    await submitLead(values, deps("www.springfieldstamp.com", fetchImpl, attempt));
    expect(calls.map((c) => c.body["clientSubmissionId"])).toEqual(["id-1", "id-2"]);
  });

  it("treats an unparseable body as unconfirmed", async () => {
    const { fetchImpl } = mk([new Response("<html>", { status: 200 })]);
    expect((await submitLead(values, deps("www.springfieldstamp.com", fetchImpl, new SubmissionAttempt(() => UUID)))).kind).toBe("unconfirmed");
  });

  it("sends JSON with only the allowed headers and no credentials", async () => {
    const seen: RequestInit[] = [];
    const fetchImpl = (async (_u: unknown, init?: RequestInit) => {
      seen.push(init!);
      return res(200, { ok: true, id: UUID });
    }) as unknown as typeof fetch;
    await submitLead(values, deps("www.springfieldstamp.com", fetchImpl, new SubmissionAttempt(() => UUID)));
    expect(seen[0]!.credentials).toBe("omit");
    expect(Object.keys(seen[0]!.headers as Record<string, string>).sort()).toEqual(["Accept", "Content-Type"]);
  });
});
