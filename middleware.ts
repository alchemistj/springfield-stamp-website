// Vercel Routing Middleware. Sets ff_vid (180 days) and ff_sid (30 min, renewed every HTML
// page) for real visitors. Bots get ff_bot=1 for 2 minutes and no identity cookies.
// HTML pages only: assets, /_astro/*, images and api/* are passed through with no cookies.
//
// `next()` adds Set-Cookie and does not set Cache-Control, so the static HTML keeps the
// public cache headers from vercel.json and Vercel can keep serving it from the CDN
// (`x-vercel-cache: HIT`). The vanity redirect is `private, no-store` so one visitor's
// ff_entry cookie is never cached for the next visitor.
import { next } from "@vercel/functions";

// Inlined on purpose. Vercel type-strips this file to middleware.js and does not bundle
// relative .ts imports, so a `./src/.../*.ts` import crashes the deployed function
// (ERR_MODULE_NOT_FOUND). These values match src/lib/attribution/allowlist.ts.
// identity-cookies.test.ts fails if the two copies drift.
export const VID_COOKIE = "ff_vid";
export const SID_COOKIE = "ff_sid";
export const BOT_COOKIE = "ff_bot";
export const ENTRY_COOKIE = "ff_entry";
export const ENTRY_VALUE = "gbp-springfield";
export const VANITY_PATH = "/Springfield";
export const VID_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;
export const SID_MAX_AGE_SECONDS = 30 * 60;
export const BOT_MAX_AGE_SECONDS = 2 * 60;
export const ENTRY_MAX_AGE_SECONDS = 30 * 60;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/** One cookie value from a `Cookie` request header. Same parser as storage.ts. */
function readCookie(header: string, name: string): string | null {
  const prefix = `${name}=`;
  for (const part of header.split(/; */)) {
    if (!part.startsWith(prefix)) continue;
    const raw = part.slice(prefix.length);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}

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
