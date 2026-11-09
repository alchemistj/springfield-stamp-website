// Builds journey events. Pure: no document, no network. The browser wiring is bootstrap.ts.
import {
  CONTRACT_VERSION,
  SITE_KEY,
  type CtaLocation,
  type JourneyEventName,
  type MeasureEnvironment,
  isCtaLocation,
  isEnvironment,
  isEventName,
  isUuid,
} from "./allowlist.ts";

export interface ClientEvent {
  contractVersion: typeof CONTRACT_VERSION;
  siteKey: typeof SITE_KEY;
  event: JourneyEventName;
  eventId: string;
  /** Cookie value. FF Reports receives this as `visitorId` (ff-measure.v1 rejects the `ff_vid` key). */
  ff_vid: string;
  /** Cookie value. FF Reports receives this as `sessionId`. */
  ff_sid: string;
  visitorId: string;
  sessionId: string;
  /** Page path, including the trailing slash the site uses. */
  currentPath: string;
  occurredAt: string;
  automation: boolean;
  engaged: boolean;
  environment: MeasureEnvironment;
  device: "mobile" | "desktop";
  entry?: string;
  referrer?: string;
  ctaLocation?: CtaLocation;
  submissionId?: string;
}

export interface MeasureContext {
  ffVid: string;
  ffSid: string;
  path: string;
  now: string;
  automation: boolean;
  environment: MeasureEnvironment;
  device: "mobile" | "desktop";
  entry?: string;
  referrer?: string;
}

/** `automation: true` for webdriver, HeadlessChrome, an empty language list, or the ff_bot cookie. */
export function detectAutomation(input: {
  webdriver: boolean;
  userAgent: string;
  languagesLength: number;
  botCookie: boolean;
}): boolean {
  return input.webdriver || input.userAgent.includes("HeadlessChrome") || input.languagesLength === 0 || input.botCookie;
}

export function environmentForHost(hostname: string): MeasureEnvironment {
  const host = hostname.trim().toLowerCase();
  if (host === "www.springfieldstamp.com") return "production";
  if (host.endsWith(".vercel.app")) return "preview";
  return "development";
}

export function deviceForWidth(width: number): "mobile" | "desktop" {
  return width >= 1024 ? "desktop" : "mobile";
}

/**
 * Nearest ancestor wins. `tokens` is the element's own classes and tag, then each parent's.
 * Maroon bands and the About closing band are the CTA bands. Everything else in `<main>` is main.
 */
export function ctaLocationFromTokens(tokens: readonly string[]): CtaLocation {
  for (const token of tokens) {
    if (token === "call-bar") return "sticky_bar";
    if (token === "site-footer" || token === "footer") return "footer";
    if (token === "trust-bar") return "trust_bar";
    if (token === "nav-mobile") return "mobile_menu";
    if (token === "site-header" || token === "header") return "header";
    if (token === "hero") return "hero";
    if (token === "tone-maroon" || token === "closing") return "cta_band";
    if (token === "main") return "main";
  }
  return "main";
}

export function classifyAnchor(href: string, pageUrl: string): "click_to_call" | "contact_click" | null {
  const raw = href.trim();
  if (raw.toLowerCase().startsWith("tel:")) return "click_to_call";
  if (raw.toLowerCase().startsWith("mailto:")) return "contact_click";
  try {
    const target = new URL(raw, pageUrl);
    const here = new URL(pageUrl);
    if (target.origin !== here.origin) return null;
    const path = target.pathname.length > 1 && target.pathname.endsWith("/") ? target.pathname.slice(0, -1) : target.pathname;
    return path === "/contact" ? "contact_click" : null;
  } catch {
    return null;
  }
}

function base(event: JourneyEventName, eventId: string, ctx: MeasureContext, engaged: boolean): ClientEvent {
  const out: ClientEvent = {
    contractVersion: CONTRACT_VERSION,
    siteKey: SITE_KEY,
    event,
    eventId,
    ff_vid: ctx.ffVid,
    ff_sid: ctx.ffSid,
    visitorId: ctx.ffVid,
    sessionId: ctx.ffSid,
    currentPath: ctx.path,
    occurredAt: ctx.now,
    automation: ctx.automation,
    engaged,
    environment: ctx.environment,
    device: ctx.device,
  };
  if (ctx.entry) out.entry = ctx.entry;
  if (ctx.referrer) out.referrer = ctx.referrer;
  return out;
}

export function buildPageView(eventId: string, ctx: MeasureContext): ClientEvent {
  return base("page_view", eventId, ctx, false);
}

/** The engaged signal: a second page_view that reuses the original eventId. */
export function buildEngaged(pageView: ClientEvent, occurredAt: string): ClientEvent {
  return { ...pageView, event: "page_view", engaged: true, occurredAt };
}

export function buildClick(event: "click_to_call" | "contact_click", eventId: string, ctx: MeasureContext, ctaLocation: CtaLocation): ClientEvent {
  return { ...base(event, eventId, ctx, false), ctaLocation };
}

export function buildLeadSuccess(eventId: string, ctx: MeasureContext, submissionId: string): ClientEvent {
  return { ...base("lead_form_success", eventId, ctx, false), submissionId };
}

/** Body FF Reports accepts. Drops `ff_vid` / `ff_sid`, which the collector rejects as unknown fields. */
export function toUpstreamPayload(event: ClientEvent): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    contractVersion: event.contractVersion,
    siteKey: event.siteKey,
    event: event.event,
    eventId: event.eventId,
    visitorId: event.visitorId,
    sessionId: event.sessionId,
    currentPath: event.currentPath,
    occurredAt: event.occurredAt,
    automation: event.automation,
    engaged: event.engaged,
    environment: event.environment,
    device: event.device,
  };
  if (event.entry) payload["entry"] = event.entry;
  if (event.referrer) payload["referrer"] = event.referrer;
  if (event.ctaLocation) payload["ctaLocation"] = event.ctaLocation;
  if (event.submissionId) payload["submissionId"] = event.submissionId;
  return payload;
}

function str(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/** Validates a beacon body and returns the upstream payload, or null when it must not be forwarded. */
export function normalizeClientPayload(input: unknown): Record<string, unknown> | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const event = str(raw["event"]);
  const eventId = str(raw["eventId"]);
  const visitorId = str(raw["visitorId"]) ?? str(raw["ff_vid"]);
  const sessionId = str(raw["sessionId"]) ?? str(raw["ff_sid"]);
  const currentPath = str(raw["currentPath"]);
  const occurredAt = str(raw["occurredAt"]);
  const environment = str(raw["environment"]);
  const device = str(raw["device"]);
  if (raw["contractVersion"] !== CONTRACT_VERSION) return null;
  if (raw["siteKey"] !== SITE_KEY) return null;
  if (!event || !isEventName(event)) return null;
  if (!eventId || !isUuid(eventId)) return null;
  if (!visitorId || !isUuid(visitorId) || !sessionId || !isUuid(sessionId)) return null;
  if (!currentPath || !currentPath.startsWith("/")) return null;
  if (!occurredAt) return null;
  if (typeof raw["automation"] !== "boolean" || typeof raw["engaged"] !== "boolean") return null;
  if (!environment || !isEnvironment(environment)) return null;
  if (device !== "mobile" && device !== "desktop") return null;
  const eventDraft: ClientEvent = {
    contractVersion: CONTRACT_VERSION,
    siteKey: SITE_KEY,
    event,
    eventId,
    ff_vid: visitorId,
    ff_sid: sessionId,
    visitorId,
    sessionId,
    currentPath,
    occurredAt,
    automation: raw["automation"],
    engaged: raw["engaged"],
    environment,
    device,
  };
  const entry = str(raw["entry"]);
  if (entry) eventDraft.entry = entry;
  const referrer = str(raw["referrer"]);
  if (referrer) eventDraft.referrer = referrer;
  const cta = str(raw["ctaLocation"]);
  if (cta) {
    if (!isCtaLocation(cta)) return null;
    if (event !== "click_to_call" && event !== "contact_click") return null;
    eventDraft.ctaLocation = cta;
  } else if (event === "click_to_call" || event === "contact_click") {
    return null;
  }
  const submissionId = str(raw["submissionId"]);
  if (submissionId) {
    if (!isUuid(submissionId)) return null;
    eventDraft.submissionId = submissionId;
  }
  return toUpstreamPayload(eventDraft);
}
