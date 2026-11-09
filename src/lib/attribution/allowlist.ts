// Journey events this site is allowed to send. Names match FF Reports `ff-measure.v1`.
// There is no `text_click` (no sms: links) and no `scheduler_opened` (no booking widget).

export const SITE_KEY = "springfield-stamp-website";
export const CONTRACT_VERSION = "ff-measure.v1" as const;

/** Same-origin beacon. The server forwards it to FF Reports. */
export const COLLECT_PATH = "/api/site-events";

export const EVENTS = ["page_view", "click_to_call", "contact_click", "lead_form_success"] as const;
export type JourneyEventName = (typeof EVENTS)[number];

export const CTA_LOCATIONS = [
  "header",
  "mobile_menu",
  "hero",
  "trust_bar",
  "cta_band",
  "main",
  "footer",
  "sticky_bar",
] as const;
export type CtaLocation = (typeof CTA_LOCATIONS)[number];

export const ENVIRONMENTS = ["production", "preview", "development", "test"] as const;
export type MeasureEnvironment = (typeof ENVIRONMENTS)[number];

export const VID_COOKIE = "ff_vid";
export const SID_COOKIE = "ff_sid";
export const BOT_COOKIE = "ff_bot";
export const ENTRY_COOKIE = "ff_entry";

/** Google Business Profile vanity entry. Capital S, per the spec. */
export const ENTRY_VALUE = "gbp-springfield";
export const VANITY_PATH = "/Springfield";

export const VID_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;
export const SID_MAX_AGE_SECONDS = 30 * 60;
export const BOT_MAX_AGE_SECONDS = 2 * 60;
export const ENTRY_MAX_AGE_SECONDS = 30 * 60;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function isEventName(value: string): value is JourneyEventName {
  return (EVENTS as readonly string[]).includes(value);
}

export function isCtaLocation(value: string): value is CtaLocation {
  return (CTA_LOCATIONS as readonly string[]).includes(value);
}

export function isEnvironment(value: string): value is MeasureEnvironment {
  return (ENVIRONMENTS as readonly string[]).includes(value);
}
