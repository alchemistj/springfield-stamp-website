// Browser wiring. Loaded once per page from BaseLayout. Never throws into the page.
import { BOT_COOKIE, COLLECT_PATH, ENTRY_COOKIE, SID_COOKIE, VID_COOKIE } from "./allowlist.ts";
import {
  buildClick,
  buildEngaged,
  buildLeadSuccess,
  buildPageView,
  classifyAnchor,
  ctaLocationFromTokens,
  detectAutomation,
  deviceForWidth,
  environmentForHost,
  type ClientEvent,
  type MeasureContext,
} from "./collector.ts";
import { readCookie } from "./storage.ts";

const ENGAGED_VISIBLE_MS = 10_000;

function send(event: ClientEvent): void {
  const body = JSON.stringify(event);
  try {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(COLLECT_PATH, blob)) return;
  } catch {
    /* sendBeacon can throw on a detached document; fall through to fetch */
  }
  void fetch(COLLECT_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body,
    keepalive: true,
    credentials: "omit",
  }).catch(() => undefined);
}

function context(now: string): MeasureContext | null {
  const header = document.cookie;
  if (readCookie(header, BOT_COOKIE) === "1") return null;
  const ffVid = readCookie(header, VID_COOKIE);
  const ffSid = readCookie(header, SID_COOKIE);
  if (!ffVid || !ffSid) return null;
  const entry = readCookie(header, ENTRY_COOKIE);
  const ctx: MeasureContext = {
    ffVid,
    ffSid,
    path: location.pathname,
    now,
    automation: detectAutomation({
      webdriver: navigator.webdriver === true,
      userAgent: navigator.userAgent,
      languagesLength: navigator.languages.length,
      botCookie: false,
    }),
    environment: environmentForHost(location.hostname),
    device: deviceForWidth(window.innerWidth),
  };
  if (entry) ctx.entry = entry;
  if (document.referrer) ctx.referrer = document.referrer;
  return ctx;
}

function tokensFor(el: Element): string[] {
  const tokens: string[] = [];
  let node: Element | null = el;
  while (node) {
    tokens.push(node.tagName.toLowerCase());
    for (const cls of node.classList) tokens.push(cls);
    node = node.parentElement;
  }
  return tokens;
}

function watchEngaged(pageView: ClientEvent): void {
  let sent = false;
  const fire = () => {
    if (sent) return;
    sent = true;
    send(buildEngaged(pageView, new Date().toISOString()));
  };
  const onInteract = () => fire();
  document.addEventListener("scroll", onInteract, { passive: true, capture: true, once: true });
  document.addEventListener("pointerdown", onInteract, { passive: true, capture: true, once: true });
  document.addEventListener("keydown", onInteract, { capture: true, once: true });
  let visibleMs = 0;
  let last = performance.now();
  const tick = () => {
    if (sent) return;
    const now = performance.now();
    if (document.visibilityState === "visible") visibleMs += now - last;
    last = now;
    if (visibleMs >= ENGAGED_VISIBLE_MS) {
      fire();
      return;
    }
    window.setTimeout(tick, 1000);
  };
  window.setTimeout(tick, 1000);
}

let booted = false;

export function bootJourney(): void {
  if (booted) return;
  booted = true;
  try {
    const ctx = context(new Date().toISOString());
    if (!ctx) return;
    const pageView = buildPageView(crypto.randomUUID(), ctx);
    send(pageView);
    watchEngaged(pageView);
    document.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const anchor = target.closest("a");
        if (!anchor) return;
        const href = anchor.getAttribute("href");
        if (!href) return;
        const kind = classifyAnchor(href, location.href);
        if (!kind) return;
        const live = context(new Date().toISOString());
        if (!live) return;
        send(buildClick(kind, crypto.randomUUID(), live, ctaLocationFromTokens(tokensFor(anchor))));
      },
      true,
    );
  } catch {
    /* tracking must not break the page */
  }
}

/** Called from the form's success path, next to fireConversion. One event per accepted lead. */
export function trackLeadFormSuccess(submissionId: string): void {
  try {
    const ctx = context(new Date().toISOString());
    if (!ctx) return;
    send(buildLeadSuccess(crypto.randomUUID(), ctx, submissionId));
  } catch {
    /* tracking must not break the form */
  }
}
