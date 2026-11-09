# Spec: finish the Springfield Stamp Astro rebuild (Cursor card)

Status: v1, 2 Nov 2026. Builds on `docs/SPEC-astro-rebuild.md` (still in force) and the work on
PR #1 (`build/astro-rebuild`). This card works on branch `cursor/ss-finish` (PR #2, base
`build/astro-rebuild`).

All six pages are built, merged and close to the live site. The sticky mobile call bar and the
one-row mobile header are done. This card adds the trust bar and fixes the headline font flicker.

## 1. Trust bar (Rule 9 of `docs/sop/astro-full-build-rules.md`), on every page
Directly under each page's hero, full width, the same design on every page. Josh approved this
wording on 2 Nov. Put it in `src/data/site.ts` and place it word for word:

- Line 1: `Family-Owned for Over 50 Years` · `1-Day Service` · `Shipping Nationwide`
- Line 2: `Local Shop at 1416 S. Glenstone, Springfield, MO` · `Call (417) 881-8828`
  - "(417) 881-8828" is a `tel:+14178818828` link. It is the NAP number from the site config,
    shown as real text in the server HTML.

Design: it must look like it belongs to this site. Use only the site's existing palette and fonts
(red `--color-ss-red`, the yellow button colour, the dark footer colour, white, the light grey
section band), with small icons from the existing `Icon` component if they help. Two calm lines at
desktop. On mobile, stack the items neatly (no horizontal scroll, tap target ≥ 48px on the
phone link). No star ratings or review counts. Text meets WCAG AA contrast. No `transition: all`,
zero client JS, not inside the `.atf` block (it comes after the `.atf-ready` marker, so it
doesn't change the first-frame gate).

## 2. Headline font flicker (first frame)
`scripts/perf/first-frame-check.mjs` fails on `/` at mobile (5/5 FLICKER, MAE 8.5) and desktop
(MAE about 6–9), because the red display font (Hoarse Rough 02, 48 KB WOFF2) and Poppins 700 arrive
after first paint and the headline re-renders. Everything else in the first frame is stable.

Fix, per `docs/sop/astro-first-frame-and-pagespeed.md` §5 and the Greene test there:
- Subset the display font to exactly the glyphs the site uses in that font (collect them from
  `src/data/**` and any component text set in it, plus space and basic punctuation). Use
  `subset-font` or `fonttools` (pyftsubset) at build time or as a checked-in script; commit the
  subset WOFF2 and the script.
- Inline the subset display font and the Poppins weight(s) used above the fold as `data:` URIs in
  the inline `<style>` in `<head>`, with `font-display: block` for those inlined faces only.
  Keep Muli and any below-the-fold weights as normal self-hosted files with `swap`.
- No font preloads, no Google Fonts, no JS font loading, no hiding the page with timers.
- Report: display font bytes before/after, total inlined font bytes, document size per page.
  Keep the added HTML weight as small as you can (target ≤ 25 KB of inlined fonts).

Gate: `node scripts/perf/first-frame-check.mjs --controls` prints `CONTROLS OK`, then `RUNS=5`
on all six pages, mobile and desktop, against `npx astro preview` of the production build: every
run PASS. Save the JSON lines in the PR description (paste them into your final report).

## 3. Don't change
Copy, page layouts, the header, the sticky call bar, the contact form, the preview relay
(`api/`), `vercel.json`, the Google tag snippet, images. Desktop and mobile screenshots must stay
the same apart from the new trust bar and the font now being right from the first frame: run
`node scripts/reference/compare.mjs` and report the per-page height deltas (the trust bar adds
its own height; nothing else should move).

## 4. Checks (all must pass)
`npm run check`, `npm run lint`, `npm test` (add Playwright tests: trust bar present once under
the hero on all six pages with the exact wording and a working `tel:` link; no horizontal scroll at
390px), `npm run build`, `git diff --check`. Local Lighthouse mobile on `/` and `/custom-stamps/`
(3 runs, median): report all four scores and the tags-blocked performance score
(`--blocked-url-patterns='*googletagmanager.com*'`). Chromium:
`/opt/pw-browsers/chromium-1243/chrome-linux64/chrome` in Claude containers; use the droplet's
Chromium/Playwright otherwise.

## Out of scope (waiting on Josh or Postmark)
Postmark token and the contact-form email tests; Google tag timing; darker red for the two
remaining accessibility items (contact submit button, magnetic `.call-h`); launch/DNS.
