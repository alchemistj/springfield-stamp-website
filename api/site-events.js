// Committed bundle of server/lib/siteEventHandler.ts. Vercel runs this file and does not bundle .ts imports.

// src/lib/attribution/allowlist.ts
var SITE_KEY = "springfield-stamp-website";
var CONTRACT_VERSION = "ff-measure.v1";
var EVENTS = ["page_view", "click_to_call", "contact_click", "lead_form_success"];
var CTA_LOCATIONS = [
  "header",
  "mobile_menu",
  "hero",
  "trust_bar",
  "cta_band",
  "main",
  "footer",
  "sticky_bar"
];
var ENVIRONMENTS = ["production", "preview", "development", "test"];
var VID_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;
var SID_MAX_AGE_SECONDS = 30 * 60;
var BOT_MAX_AGE_SECONDS = 2 * 60;
var ENTRY_MAX_AGE_SECONDS = 30 * 60;
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isUuid(value) {
  return UUID_RE.test(value);
}
function isEventName(value) {
  return EVENTS.includes(value);
}
function isCtaLocation(value) {
  return CTA_LOCATIONS.includes(value);
}
function isEnvironment(value) {
  return ENVIRONMENTS.includes(value);
}

// src/lib/attribution/collector.ts
function toUpstreamPayload(event) {
  const payload = {
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
    device: event.device
  };
  if (event.entry) payload["entry"] = event.entry;
  if (event.referrer) payload["referrer"] = event.referrer;
  if (event.ctaLocation) payload["ctaLocation"] = event.ctaLocation;
  if (event.submissionId) payload["submissionId"] = event.submissionId;
  return payload;
}
function str(value) {
  return typeof value === "string" ? value : null;
}
function normalizeClientPayload(input) {
  if (!input || typeof input !== "object") return null;
  const raw = input;
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
  const eventDraft = {
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
    device
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

// server/lib/forwardMeasurementCollect.ts
var MEASUREMENT_COLLECT_URL = "https://ff-reports-analytics.vercel.app/api/measurement/collect";
var CLIENT_UA_HEADER = "x-ff-client-user-agent";
async function forwardMeasurementCollect(body, userAgent, origin, fetchImpl = fetch) {
  const headers = new Headers();
  headers.set("content-type", "application/json");
  headers.set("accept", "application/json");
  headers.set(CLIENT_UA_HEADER, userAgent);
  if (origin) headers.set("origin", origin);
  return fetchImpl(MEASUREMENT_COLLECT_URL, {
    method: "POST",
    redirect: "error",
    headers,
    body
  });
}

// server/lib/siteEventHandler.ts
var MAX_BODY_BYTES = 2e4;
var json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow"
  }
});
async function handleSiteEvent(request, fetchImpl = fetch) {
  if (request.method !== "POST") return json(405, { ok: false, error: "Method not allowed" });
  const type = request.headers.get("content-type") ?? "";
  if (!type.toLowerCase().includes("application/json") && !type.toLowerCase().includes("text/plain")) {
    return json(415, { ok: false, error: "Expected JSON" });
  }
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength > MAX_BODY_BYTES) return json(413, { ok: false, error: "Body too large" });
  let parsed;
  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return json(400, { ok: false, error: "Invalid JSON" });
  }
  const payload = normalizeClientPayload(parsed);
  if (!payload) return json(400, { ok: false, error: "Invalid event" });
  const origin = request.headers.get("origin");
  try {
    const upstream = await forwardMeasurementCollect(JSON.stringify(payload), request.headers.get("user-agent") ?? "", origin, fetchImpl);
    if (!upstream.ok) console.error(`FF Reports collect responded ${upstream.status}`);
    return new Response(null, { status: 204, headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return json(502, { ok: false, error: "Unable to reach FF Reports" });
  }
}
function nodeHeaders(source) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) headers.set(key, value.join(", "));
    else if (typeof value === "string") headers.set(key, value);
  }
  return headers;
}
var config = { api: { bodyParser: false } };
async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return new Uint8Array(Buffer.concat(chunks));
}
async function handler(req, res) {
  const host = typeof req.headers.host === "string" ? req.headers.host : "invalid";
  const method = req.method ?? "GET";
  const raw = method === "GET" || method === "HEAD" ? void 0 : await readBody(req);
  const request = new Request(`https://${host}${req.url ?? "/api/site-events/"}`, {
    method,
    headers: nodeHeaders(req.headers),
    body: raw && raw.byteLength > 0 ? new TextDecoder().decode(raw) : void 0
  });
  const response = await handleSiteEvent(request);
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.end(Buffer.from(await response.arrayBuffer()));
}
export {
  MAX_BODY_BYTES,
  config,
  handler as default,
  handleSiteEvent
};
