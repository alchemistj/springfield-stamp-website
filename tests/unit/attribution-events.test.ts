import { describe, expect, it } from "vitest";
import {
  buildClick,
  buildEngaged,
  buildLeadSuccess,
  buildPageView,
  classifyAnchor,
  ctaLocationFromTokens,
  detectAutomation,
  environmentForHost,
  normalizeClientPayload,
  type MeasureContext,
} from "../../src/lib/attribution/collector";
import { attributionEnvelope, readIdentity } from "../../src/lib/attribution/storage";
import { buildBody, submitLead, SubmissionAttempt, type FormValues } from "../../src/lib/forms";

const VID = "11111111-1111-4111-8111-111111111111";
const SID = "22222222-2222-4222-8222-222222222222";
const EID = "33333333-3333-4333-8333-333333333333";

const ctx: MeasureContext = {
  ffVid: VID,
  ffSid: SID,
  path: "/contact/",
  now: "2026-11-09T21:00:00.000Z",
  automation: false,
  environment: "production",
  device: "mobile",
  entry: "gbp-springfield",
  referrer: "https://www.google.com/",
};

describe("event payloads", () => {
  it("builds a page_view carrying both cookie ids, the path and the entry tag", () => {
    const event = buildPageView(EID, ctx);
    expect(event).toMatchObject({
      contractVersion: "ff-measure.v1",
      siteKey: "springfield-stamp-website",
      event: "page_view",
      eventId: EID,
      ff_vid: VID,
      ff_sid: SID,
      visitorId: VID,
      sessionId: SID,
      currentPath: "/contact/",
      engaged: false,
      entry: "gbp-springfield",
      automation: false,
    });
  });

  it("sends engaged as a second page_view with the same eventId", () => {
    const first = buildPageView(EID, ctx);
    const follow = buildEngaged(first, "2026-11-09T21:00:10.000Z");
    expect(follow.event).toBe("page_view");
    expect(follow.eventId).toBe(first.eventId);
    expect(follow.engaged).toBe(true);
    expect(follow.ff_sid).toBe(SID);
    expect(follow.occurredAt).not.toBe(first.occurredAt);
  });

  it("puts ctaLocation on click events and the submission id on a lead", () => {
    expect(buildClick("click_to_call", EID, ctx, "header").ctaLocation).toBe("header");
    expect(buildClick("contact_click", EID, ctx, "footer").event).toBe("contact_click");
    expect(buildLeadSuccess(EID, ctx, "3f2b8c1e-5d4a-4b6f-9a7c-1e2d3c4b5a69").submissionId).toBe("3f2b8c1e-5d4a-4b6f-9a7c-1e2d3c4b5a69");
  });

  it("drops the cookie-key aliases before forwarding upstream", () => {
    const upstream = normalizeClientPayload(buildPageView(EID, ctx));
    expect(upstream).not.toBeNull();
    expect(upstream).not.toHaveProperty("ff_vid");
    expect(upstream).not.toHaveProperty("ff_sid");
    expect(upstream).toMatchObject({ visitorId: VID, sessionId: SID, currentPath: "/contact/", entry: "gbp-springfield" });
  });

  it("rejects an unknown event and a click with no location", () => {
    const page = buildPageView(EID, ctx);
    expect(normalizeClientPayload({ ...page, event: "scheduler_opened" })).toBeNull();
    expect(normalizeClientPayload({ ...page, event: "click_to_call" })).toBeNull();
    expect(normalizeClientPayload({ ...buildClick("click_to_call", EID, ctx, "trust_bar") })).toMatchObject({ ctaLocation: "trust_bar" });
  });
});

describe("automation", () => {
  it("is true for webdriver, HeadlessChrome, no languages, or the bot cookie", () => {
    const off = { webdriver: false, userAgent: "Mozilla/5.0 Chrome", languagesLength: 1, botCookie: false };
    expect(detectAutomation(off)).toBe(false);
    expect(detectAutomation({ ...off, webdriver: true })).toBe(true);
    expect(detectAutomation({ ...off, userAgent: "HeadlessChrome" })).toBe(true);
    expect(detectAutomation({ ...off, languagesLength: 0 })).toBe(true);
    expect(detectAutomation({ ...off, botCookie: true })).toBe(true);
  });
});

describe("ctaLocation", () => {
  it("maps each region, with the nearer ancestor winning", () => {
    expect(ctaLocationFromTokens(["a", "phone-btn", "site-header"])).toBe("header");
    expect(ctaLocationFromTokens(["a", "nav-mobile", "site-header"])).toBe("mobile_menu");
    expect(ctaLocationFromTokens(["a", "btn", "hero"])).toBe("hero");
    expect(ctaLocationFromTokens(["a", "trust-bar"])).toBe("trust_bar");
    expect(ctaLocationFromTokens(["a", "tone-maroon", "main"])).toBe("cta_band");
    expect(ctaLocationFromTokens(["a", "closing", "main"])).toBe("cta_band");
    expect(ctaLocationFromTokens(["a", "details", "main"])).toBe("main");
    expect(ctaLocationFromTokens(["a", "site-footer"])).toBe("footer");
    expect(ctaLocationFromTokens(["a", "call-bar"])).toBe("sticky_bar");
  });

  it("classifies tel, mailto and /contact/ links", () => {
    const here = "https://www.springfieldstamp.com/contact/";
    expect(classifyAnchor("tel:+14178818828", here)).toBe("click_to_call");
    expect(classifyAnchor("mailto:orders@springfieldstamp.com", here)).toBe("contact_click");
    expect(classifyAnchor("/contact/", here)).toBe("contact_click");
    expect(classifyAnchor("/about/", here)).toBeNull();
    expect(classifyAnchor("https://example.com/contact/", here)).toBeNull();
  });
});

describe("environment", () => {
  it("matches the host the form already uses", () => {
    expect(environmentForHost("www.springfieldstamp.com")).toBe("production");
    expect(environmentForHost("WWW.SpringfieldStamp.com")).toBe("production");
    expect(environmentForHost("springfield-stamp-git-cursor-ss-journey.vercel.app")).toBe("preview");
    expect(environmentForHost("127.0.0.1")).toBe("development");
  });
});

describe("cookie reads", () => {
  it("reads the ids and the entry tag, and ignores a non-uuid", () => {
    const header = `ff_vid=${VID}; ff_sid=${SID}; ff_entry=gbp-springfield`;
    expect(readIdentity(header)).toEqual({ ff_vid: VID, ff_sid: SID, entry: "gbp-springfield", bot: false });
    expect(attributionEnvelope(header)).toEqual({ ff_vid: VID, ff_sid: SID });
    expect(attributionEnvelope("ff_vid=nope; ff_sid=" + SID)).toBeNull();
    expect(readIdentity("ff_bot=1").bot).toBe(true);
  });
});

describe("Central Forms attribution", () => {
  const values: FormValues = { first: "Test", last: "Visitor", email: "test@example.com", phone: "", message: "Hello", honeypot: "" };
  const leadCtx = {
    clientSubmissionId: "3f2b8c1e-5d4a-4b6f-9a7c-1e2d3c4b5a69",
    formStartedAt: Date.parse("2026-11-02T12:00:00Z"),
    now: Date.parse("2026-11-02T12:00:30Z"),
    pageUrl: "https://www.springfieldstamp.com/contact/",
    search: "",
    referrer: "",
  };

  it("adds the envelope only when both cookies are present", () => {
    expect(buildBody(values, leadCtx).attribution).toBeUndefined();
    expect(buildBody(values, { ...leadCtx, attribution: { ff_vid: VID, ff_sid: SID } }).attribution).toEqual({ ff_vid: VID, ff_sid: SID });
  });

  it("tells the journey hook when Central Forms accepts the lead, and not when it does not", async () => {
    const accepted: string[] = [];
    const ok = new Response(JSON.stringify({ ok: true, id: leadCtx.clientSubmissionId, conversionEligible: true }), { status: 200 });
    const bad = new Response(JSON.stringify({ ok: false }), { status: 400 });
    const fetchImpl = (async () => ok) as unknown as typeof fetch;
    const deps = {
      hostname: "www.springfieldstamp.com",
      fetchImpl,
      attempt: new SubmissionAttempt(() => leadCtx.clientSubmissionId),
      ctx: leadCtx,
      onLeadAccepted: (id: string) => accepted.push(id),
    };
    await submitLead(values, deps);
    expect(accepted).toEqual([leadCtx.clientSubmissionId]);
    await submitLead(values, { ...deps, fetchImpl: (async () => bad) as unknown as typeof fetch, attempt: new SubmissionAttempt(() => leadCtx.clientSubmissionId) });
    expect(accepted).toEqual([leadCtx.clientSubmissionId]);
  });
});
