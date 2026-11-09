// Vercel Routing Middleware. Sets ff_vid (180 days) and ff_sid (30 min, renewed every HTML
// page) for real visitors. Bots get ff_bot=1 for 2 minutes and no identity cookies.
// HTML pages only: assets, /_astro/*, images and api/* are passed through with no cookies.
//
// `next()` adds Set-Cookie and does not set Cache-Control, so the static HTML keeps the
// public cache headers from vercel.json and Vercel can keep serving it from the CDN
// (`x-vercel-cache: HIT`). The vanity redirect is `private, no-store` so one visitor's
// ff_entry cookie is never cached for the next visitor.
import { next } from "@vercel/functions";
import {
  BOT_COOKIE,
  BOT_MAX_AGE_SECONDS,
  ENTRY_COOKIE,
  ENTRY_MAX_AGE_SECONDS,
  ENTRY_VALUE,
  SID_COOKIE,
  SID_MAX_AGE_SECONDS,
  VANITY_PATH,
  VID_COOKIE,
  VID_MAX_AGE_SECONDS,
  isUuid,
} from "./src/lib/attribution/allowlist.ts";
import { readCookie } from "./src/lib/attribution/storage.ts";

/** Crawlers only. HeadlessChrome is not included: Playwright and Lighthouse still get cookies,
 *  and the browser flags those runs with `automation: true`. */
const BOT_UA = /bot|crawl|spider|slurp|archiver|wget|curl\/|facebookexternalhit|embedly|ahrefs|semrush|mj12|dotbot|bytespider|gptbot|claudebot|amazonbot|applebot|yandex|baidu|duckduck|pingdom|lighthouse|pagespeed|gtmetrix/i;

export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua || ua.trim() === "") return true;
  return BOT_UA.test(ua);
}

/** HTML navigations. Anything with a file extension, and the asset and API prefixes, are not pages. */
export function isTrackedPage(pathname: string): boolean {
  if (pathname.startsWith("/_astro/") || pathname === "/_astro") return false;
  if (pathname === "/api" || pathname.startsWith("/api/")) return false;
  if (pathname === "/images" || pathname.startsWith("/images/")) return false;
  const last = pathname.split("/").pop() ?? "";
  if (last.includes(".")) return false;
  return true;
}

export function isVanityPath(pathname: string): boolean {
  return pathname === VANITY_PATH || pathname === `${VANITY_PATH}/`;
}

export function serializeCookie(name: string, value: string, maxAge: number): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`;
}

export type IdentityDecision =
  | { kind: "pass" }
  | { kind: "next"; cookies: string[] }
  | { kind: "redirect"; location: string; cookies: string[] };

function identityCookies(header: string, newId: () => string): string[] {
  const cookies: string[] = [];
  const vid = readCookie(header, VID_COOKIE);
  if (vid === null || !isUuid(vid)) cookies.push(serializeCookie(VID_COOKIE, newId(), VID_MAX_AGE_SECONDS));
  const sid = readCookie(header, SID_COOKIE);
  const sidValue = sid !== null && isUuid(sid) ? sid : newId();
  cookies.push(serializeCookie(SID_COOKIE, sidValue, SID_MAX_AGE_SECONDS));
  return cookies;
}

export function decideIdentity(request: Request, newId: () => string = () => crypto.randomUUID()): IdentityDecision {
  const url = new URL(request.url);
  if (!isTrackedPage(url.pathname)) return { kind: "pass" };
  const bot = isBotUserAgent(request.headers.get("user-agent"));
  const header = request.headers.get("cookie") ?? "";
  if (isVanityPath(url.pathname)) {
    const cookies = bot
      ? [serializeCookie(BOT_COOKIE, "1", BOT_MAX_AGE_SECONDS)]
      : [serializeCookie(ENTRY_COOKIE, ENTRY_VALUE, ENTRY_MAX_AGE_SECONDS), ...identityCookies(header, newId)];
    return { kind: "redirect", location: `/${url.search}`, cookies };
  }
  if (bot) return { kind: "next", cookies: [serializeCookie(BOT_COOKIE, "1", BOT_MAX_AGE_SECONDS)] };
  return { kind: "next", cookies: identityCookies(header, newId) };
}

export function middleware(request: Request): Response {
  const decision = decideIdentity(request);
  if (decision.kind === "pass") return next();
  if (decision.kind === "redirect") {
    const headers = new Headers();
    headers.set("location", decision.location);
    headers.set("cache-control", "private, no-store");
    for (const cookie of decision.cookies) headers.append("set-cookie", cookie);
    return new Response(null, { status: 308, headers });
  }
  const headers = new Headers();
  for (const cookie of decision.cookies) headers.append("set-cookie", cookie);
  return next({ headers });
}

export default middleware;

export const config = {
  // Skip the middleware entirely for assets and APIs so those responses stay cache-served
  // with no function invocation. Pages (and /Springfield) still run it.
  matcher: ["/((?!_astro/|api/|images/|.*\\..*).*)"],
};
