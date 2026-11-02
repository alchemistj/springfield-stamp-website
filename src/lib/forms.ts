// Contact form transport: Central Forms intake per docs/sop/central-forms-contact-form.md section 4.
// Pure functions with injected dependencies, so Vitest can cover them; the browser wiring lives in
// src/components/ContactForm.astro.

/** The production endpoint. Keep this as ONE literal string: the Central Forms watchdog greps the shipped JS for it. */
export const LEAD_URL = "https://forms.fluidframemarketing.com/api/lead";
/** Preview-only same-origin relay (src/pages/api/preview-forms-lead.ts). */
export const PREVIEW_RELAY_URL = "/api/preview-forms-lead";
/** The only host that posts straight to Central Forms. The apex redirects to www (vercel.json). */
export const PRODUCTION_HOST = "www.springfieldstamp.com";
export const SITE_KEY = "springfield-stamp-website";
export const FORM_KEY = "main-contact";
/** Central Forms has a 35 s request deadline; the client timeout stays above it. */
export const TIMEOUT_MS = 45_000;

export type Endpoint = { kind: "direct"; url: string } | { kind: "relay"; url: string } | { kind: "none" };

/** Host gate. Exactly the production host posts directly, `*.vercel.app` uses the relay, everything else posts nothing. */
export function resolveEndpoint(hostname: string): Endpoint {
  const host = hostname.trim().toLowerCase();
  if (host === PRODUCTION_HOST) return { kind: "direct", url: LEAD_URL };
  if (host.endsWith(".vercel.app")) return { kind: "relay", url: PREVIEW_RELAY_URL };
  return { kind: "none" };
}

export interface FormValues {
  first: string;
  last: string;
  email: string;
  phone: string;
  message: string;
  /** The hidden honeypot field. Filled in by bots only. */
  honeypot: string;
}

export interface LeadContext {
  clientSubmissionId: string;
  formStartedAt: number;
  now: number;
  pageUrl: string;
  search: string;
  referrer: string;
}

export interface LeadBody {
  siteKey: string;
  formKey: string;
  clientSubmissionId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  honeypot: string;
  formStartedAt: string;
  submittedAt: string;
  pageUrl: string;
  referrer: string | null;
  utm: { source: string; medium: string; campaign: string; term: string; content: string };
  customFields: Record<string, { label: string; value: string; type: "text" }>;
}

const clip = (s: string, max: number) => s.trim().slice(0, max);

/** Request body per SOP 4a. The live form has no fields beyond Name, Email, Phone and Message, so `customFields` is empty. */
export function buildBody(v: FormValues, ctx: LeadContext): LeadBody {
  const q = new URLSearchParams(ctx.search);
  const utm = (k: string) => q.get(`utm_${k}`) ?? "";
  return {
    siteKey: SITE_KEY,
    formKey: FORM_KEY,
    clientSubmissionId: ctx.clientSubmissionId,
    name: clip(`${v.first.trim()} ${v.last.trim()}`, 200),
    email: clip(v.email, 320),
    phone: clip(v.phone, 50),
    message: clip(v.message, 5000),
    honeypot: v.honeypot.trim(),
    formStartedAt: new Date(ctx.formStartedAt).toISOString(),
    submittedAt: new Date(ctx.now).toISOString(),
    pageUrl: ctx.pageUrl.slice(0, 2000),
    referrer: ctx.referrer ? ctx.referrer.slice(0, 2000) : null,
    utm: { source: utm("source"), medium: utm("medium"), campaign: utm("campaign"), term: utm("term"), content: utm("content") },
    customFields: {},
  };
}

/** Central Forms needs a phone or an email. */
export function hasContactMethod(v: Pick<FormValues, "email" | "phone">): boolean {
  return v.email.trim() !== "" || v.phone.trim() !== "";
}

export type Outcome =
  | { kind: "success"; id: string; conversion: boolean }
  | { kind: "invalid" }
  | { kind: "rate_limited" }
  | { kind: "unconfirmed" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** SOP 4d. Success only on `ok === true` AND a real UUID `id`. Conversion only when new and eligible. */
export function classifyResponse(status: number, json: unknown): Outcome {
  const j = json && typeof json === "object" ? (json as Record<string, unknown>) : null;
  if (status >= 200 && status < 300 && j && j["ok"] === true && typeof j["id"] === "string" && UUID_RE.test(j["id"])) {
    return { kind: "success", id: j["id"], conversion: j["duplicate"] !== true && j["conversionEligible"] === true };
  }
  if (status === 400 && j && j["ok"] === false && !j["saved"]) return { kind: "invalid" };
  if (status === 429) return { kind: "rate_limited" };
  // 403, 5xx, saved-but-not-delivered, unparseable: stored state unknown, keep the id and the input.
  return { kind: "unconfirmed" };
}

/**
 * One id per logical inquiry. `current()` makes it on first use and keeps it for every retry;
 * `reset()` is called after a success or a 400 (nothing stored), so the next inquiry is new.
 */
export class SubmissionAttempt {
  private id: string | null = null;
  constructor(private readonly makeId: () => string = () => crypto.randomUUID()) {}
  current(): string {
    this.id ??= this.makeId();
    return this.id;
  }
  reset(): void {
    this.id = null;
  }
}

/** Conversion hook. No conversion tag exists beyond gtag today, so this does nothing on purpose.
 *  When the Google Ads manager supplies the event, fire it here once per id with `transaction_id: id`.
 *  Never change GTM or tag timing from the website (SOP section 10). */
export function fireConversion(id: string): void {
  void id;
}

export type SubmitResult = Outcome | { kind: "not_sent" };

export interface SubmitDeps {
  hostname: string;
  fetchImpl: typeof fetch;
  attempt: SubmissionAttempt;
  ctx: Omit<LeadContext, "clientSubmissionId">;
  timeoutMs?: number;
}

/** Posts one inquiry. Never throws. */
export async function submitLead(values: FormValues, deps: SubmitDeps): Promise<SubmitResult> {
  const endpoint = resolveEndpoint(deps.hostname);
  if (endpoint.kind === "none") return { kind: "not_sent" };
  const body = buildBody(values, { ...deps.ctx, clientSubmissionId: deps.attempt.current() });
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), deps.timeoutMs ?? TIMEOUT_MS);
  try {
    const res = await deps.fetchImpl(endpoint.url, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: ctl.signal,
    });
    const json: unknown = await res.json().catch(() => null);
    const outcome = classifyResponse(res.status, json);
    if (outcome.kind === "success") {
      deps.attempt.reset();
      if (outcome.conversion) fireConversion(outcome.id);
    } else if (outcome.kind === "invalid") {
      deps.attempt.reset(); // nothing was stored; the next attempt is a new inquiry
    }
    return outcome;
  } catch {
    return { kind: "unconfirmed" };
  } finally {
    clearTimeout(timer);
  }
}
