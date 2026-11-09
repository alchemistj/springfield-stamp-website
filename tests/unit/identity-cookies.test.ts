import { describe, expect, it } from "vitest";
import {
  BOT_COOKIE,
  ENTRY_COOKIE,
  ENTRY_VALUE,
  SID_COOKIE,
  VID_COOKIE,
} from "../../src/lib/attribution/allowlist";
import { decideIdentity, isBotUserAgent, isTrackedPage, middleware, serializeCookie } from "../../middleware";

const VID = "11111111-1111-4111-8111-111111111111";
const SID = "22222222-2222-4222-8222-222222222222";
const NEXT = "33333333-3333-4333-8333-333333333333";

function ids() {
  const queue = [VID, SID, NEXT];
  return () => {
    const id = queue.shift();
    if (!id) throw new Error("test ran out of ids");
    return id;
  };
}

const page = (path: string, init?: { ua?: string; cookie?: string }) =>
  new Request(`https://www.springfieldstamp.com${path}`, {
    headers: {
      ...(init?.ua !== undefined ? { "user-agent": init.ua } : { "user-agent": "Mozilla/5.0 Chrome/120.0.0.0" }),
      ...(init?.cookie ? { cookie: init.cookie } : {}),
    },
  });

const cookieNamed = (cookies: string[], name: string) => cookies.find((c) => c.startsWith(`${name}=`));

describe("bot detection", () => {
  it("treats an empty user agent and known crawlers as bots", () => {
    expect(isBotUserAgent(null)).toBe(true);
    expect(isBotUserAgent("")).toBe(true);
    expect(isBotUserAgent("   ")).toBe(true);
    expect(isBotUserAgent("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(true);
    expect(isBotUserAgent("curl/8.0")).toBe(true);
  });
  it("does not treat a normal browser or HeadlessChrome as a middleware bot", () => {
    expect(isBotUserAgent("Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36")).toBe(false);
    expect(isBotUserAgent("Mozilla/5.0 HeadlessChrome/120.0.0.0 Safari/537.36")).toBe(false);
  });
});

describe("which requests get cookies", () => {
  it("tracks HTML pages only", () => {
    expect(isTrackedPage("/")).toBe(true);
    expect(isTrackedPage("/contact/")).toBe(true);
    expect(isTrackedPage("/Springfield")).toBe(true);
    expect(isTrackedPage("/_astro/app.js")).toBe(false);
    expect(isTrackedPage("/api/site-events")).toBe(false);
    expect(isTrackedPage("/api/preview-forms-lead/")).toBe(false);
    expect(isTrackedPage("/images/logo.png")).toBe(false);
    expect(isTrackedPage("/favicon.png")).toBe(false);
    expect(isTrackedPage("/robots.txt")).toBe(false);
    expect(isTrackedPage("/sitemap.xml")).toBe(false);
  });

  it("sets ff_vid for 180 days and ff_sid for 30 minutes on a page", () => {
    const decision = decideIdentity(page("/contact/"), ids());
    expect(decision.kind).toBe("next");
    if (decision.kind !== "next") return;
    expect(cookieNamed(decision.cookies, VID_COOKIE)).toBe(serializeCookie(VID_COOKIE, VID, 180 * 24 * 60 * 60));
    expect(cookieNamed(decision.cookies, SID_COOKIE)).toBe(serializeCookie(SID_COOKIE, SID, 30 * 60));
    expect(cookieNamed(decision.cookies, BOT_COOKIE)).toBeUndefined();
  });

  it("keeps an existing ff_vid and renews the same ff_sid", () => {
    const decision = decideIdentity(page("/", { cookie: `${VID_COOKIE}=${VID}; ${SID_COOKIE}=${SID}` }), ids());
    expect(decision.kind).toBe("next");
    if (decision.kind !== "next") return;
    expect(decision.cookies).toEqual([serializeCookie(SID_COOKIE, SID, 30 * 60)]);
  });

  it("gives bots ff_bot for 2 minutes and no identity cookies", () => {
    const decision = decideIdentity(page("/", { ua: "Mozilla/5.0 (compatible; Googlebot/2.1)" }), ids());
    expect(decision.kind).toBe("next");
    if (decision.kind !== "next") return;
    expect(decision.cookies).toEqual([serializeCookie(BOT_COOKIE, "1", 120)]);
  });

  it("sets no cookies on assets or api routes", () => {
    expect(decideIdentity(page("/_astro/app.js"), ids())).toEqual({ kind: "pass" });
    expect(decideIdentity(page("/api/site-events"), ids())).toEqual({ kind: "pass" });
    expect(decideIdentity(page("/favicon.png"), ids())).toEqual({ kind: "pass" });
  });
});

describe("/Springfield entry tag", () => {
  it("308s to / with the query string and sets ff_entry for a real visitor", () => {
    const decision = decideIdentity(page("/Springfield?utm_source=gbp&gclid=1"), ids());
    expect(decision.kind).toBe("redirect");
    if (decision.kind !== "redirect") return;
    expect(decision.location).toBe("/?utm_source=gbp&gclid=1");
    expect(cookieNamed(decision.cookies, ENTRY_COOKIE)).toBe(serializeCookie(ENTRY_COOKIE, ENTRY_VALUE, 30 * 60));
    expect(cookieNamed(decision.cookies, VID_COOKIE)).toContain(VID);
  });

  it("redirects bots without ff_entry", () => {
    const decision = decideIdentity(page("/Springfield/", { ua: "bingbot" }), ids());
    expect(decision.kind).toBe("redirect");
    if (decision.kind !== "redirect") return;
    expect(decision.location).toBe("/");
    expect(decision.cookies.map((c) => c.split("=")[0])).toEqual([BOT_COOKIE]);
  });

  it("does not treat the lowercase path as the vanity url", () => {
    const decision = decideIdentity(page("/springfield"), ids());
    expect(decision.kind).toBe("next");
  });
});

describe("middleware response headers", () => {
  it("continues a page without replacing its cache headers", () => {
    const res = middleware(page("/about/"));
    expect(res.headers.get("x-middleware-next")).toBe("1");
    expect(res.headers.get("cache-control")).toBeNull();
    expect(res.headers.getSetCookie().some((c) => c.startsWith(`${VID_COOKIE}=`))).toBe(true);
    expect(res.headers.getSetCookie().some((c) => c.startsWith(`${SID_COOKIE}=`))).toBe(true);
  });

  it("does not attach cookies when continuing an asset", () => {
    const res = middleware(page("/_astro/app.js"));
    expect(res.headers.get("x-middleware-next")).toBe("1");
    expect(res.headers.getSetCookie()).toEqual([]);
  });

  it("answers /Springfield with 308 and ff_entry", () => {
    const res = middleware(page("/Springfield?x=1"));
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe("/?x=1");
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(res.headers.getSetCookie().some((c) => c.startsWith(`${ENTRY_COOKIE}=${encodeURIComponent(ENTRY_VALUE)}`))).toBe(true);
  });
});
