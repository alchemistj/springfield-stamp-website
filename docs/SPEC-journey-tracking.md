# Spec: journey tracking (Rule 14.1), Springfield Stamp

Status: v1, 9 Nov 2026. Branch `cursor/ss-journey`, PR base `build/astro-rebuild`.

Implement Rule 14.1 of ff-architect `docs/sop/astro-full-build-rules.md` (read the whole rule on
ff-architect `main`; a copy of the older rules is in `docs/sop/`, so fetch the current text:
https://github.com/alchemistj/ff-architect/blob/main/docs/sop/astro-full-build-rules.md). Copy the
Window Dudes implementation (`alchemistj/window-dudes`): `middleware.js` (write ours as
`middleware.ts`), `src/lib/attribution/` (bootstrap, collector, storage, allowlist),
`api/site-events.ts`, `server/lib/forwardMeasurementCollect.ts` (forwards to
`https://ff-reports-analytics.vercel.app/api/measurement/collect` with the
`x-ff-client-user-agent` header), and its tests. Identity cookies follow
`alchemistj/ff-split-testing` `docs/client-site-integration.md`.

## What it must do
- `ff_vid` (180 days) and `ff_sid` (30 min, renewed each page load) set server-side by Vercel
  middleware on HTML page requests only, never assets, `/_astro/*`, images or `api/*`, and never
  for bots (bots get the 2-minute `ff_bot=1` marker instead). No sessionStorage session IDs.
- Middleware must not slow pages: pages stay cache-served by Vercel; confirm with response headers.
- Events, each with `ff_vid`, `ff_sid`, page path, and `entry` when the `ff_entry` cookie exists:
  `page_view` on every page; `click_to_call` on every `tel:` link with `ctaLocation`
  (`header`, `mobile_menu`, `hero`, `trust_bar`, `cta_band`, `main`, `footer`, `sticky_bar`);
  `contact_click` on every link to `/contact/` and on `mailto:` CTAs with `ctaLocation`;
  `lead_form_success` after Central Forms accepts the lead (hook into `src/lib/forms.ts` success
  path, alongside the existing `fireConversion` hook; don't change form behaviour). No
  `text_click` (the site has no `sms:` links) and no `scheduler_opened` (no booking widget).
- `engaged` signal once per page view (first scroll, tap, key press, or 10 s visible), sent as a
  follow-up `page_view` reusing the same `eventId`.
- `automation: true` when `navigator.webdriver`, `HeadlessChrome` in the UA, empty
  `navigator.languages`, or the `ff_bot=1` cookie.
- Entry tag: vanity path `/Springfield` (capital S) sets `ff_entry=gbp-springfield` (30 min,
  Path=/, SameSite=Lax, Secure, not HttpOnly) for real visitors, then 308 to `/` keeping the
  query string. Format per FF Reports spec 56; SRA (`alchemistj/sra-roofing-website`) is the
  reference.
- The site key in events: `springfield-stamp-website` (same as Central Forms).
- Send the `ff_sid`/`ff_vid` in the Central Forms submission's attribution envelope too (Rule 14).

## Must not change
Copy, layouts, visuals, fonts, the trust bar, the sticky call bar, form behaviour, the preview
relay, the Google tag snippet. Zero visible change: compare.mjs desktop/mobile screenshots must
be pixel-identical to `docs/reference/build/` except dynamic map tiles.

## Also (small)
- Trust bar on phones: "Local Shop at 1416 S. Glenstone, Springfield, MO" wraps leaving "MO"
  alone on a line at 390px. Keep "Springfield, MO" together (non-breaking space or nowrap).

## Checks
`npm ci`, `npm run check`, `npm run lint`, `npm test` (unit tests for cookies, bot detection,
event payloads and ctaLocation mapping; Playwright: page_view fires once per page with the same
ff_sid across two pages, a tel: click and a contact click each send one event with the right
ctaLocation, no cookies on `/_astro/*` or `api/*`, the `/Springfield` 308 sets ff_entry),
`npm run build`, `git diff --check`, first-frame `--controls` then `RUNS=5` on `/` and
`/contact/` mobile+desktop all PASS, local Lighthouse mobile on `/` (3 runs, median) before and
after the change. Report what FF Reports must do to accept `springfield-stamp-website` events, if
anything (check how Window Dudes' site key is registered in `alchemistj/ff-reports-analytics`).
