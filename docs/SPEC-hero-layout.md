# Spec: homepage desktop hero layout and real trust bar, Springfield Stamp

Status: v1, 11 Nov 2026. Branch `cursor/ss-hero-layout`, PR base `build/astro-rebuild`.

## What Josh said (11 Nov, on a ~1860px-wide desktop screenshot)
- "I don't like this layout on desktop." "I don't like that it's not centered in the section."
- "We don't have a trust bar. We have trust words with no bottom line, and it's the same color as
  the next background section."

## 1. Desktop hero: centred two-column composition (homepage `/`, ≥ 1024px)
Today the hero photo is one full-bleed background (`src/assets/home-hero.jpg` via `HeroPhoto`)
with the products baked into the right edge. On wide screens the products are pushed to the far
right and cut off (the name tags disappear), while the text sits left: nothing is centred.

Fix:
- Put the hero content in one centred container (the site's existing content max-width, about
  1200px, `margin-inline: auto`). Left column: kicker, H1, sub, both buttons (unchanged copy and
  styles). Right column: the Option 4 product group (name bars, Regency sign, red tumbler, blue
  Trodat 4913) **shown whole** on the gold table, never cropped at any width from 1024px to 2560px.
- Both columns vertically centred in the hero; the pair visually centred in the section.
- Background: keep the dark storefront look behind everything, but as a background only (no
  products in it). Make a products-only cut-out image (transparent/table-on-dark, from
  `scripts/header-options/finish_option4.py` sources) for the right column.
- First frame stays photo-first: the product image is an inline AVIF in the `.atf` block; the
  background may be a small inline AVIF. Total inline hero bytes ≤ 70 KB. No preloads.
- Mobile (< 1024px) stays as it is now: products photo on top, text below.
- Check at 1280, 1440, 1920 and 2560 wide: centred, nothing cropped, no horizontal scroll.

## 2. Trust bar: a real bar (all six pages, `src/components/TrustBar.astro`)
- Wording unchanged (from `src/data/site.ts`).
- Give it its own band so it can't be confused with the light grey section below: use the site's
  dark footer colour background with white text (yellow or white phone link meeting WCAG AA), or
  red `--color-ss-red` with white text — pick whichever looks best against the red hero rule above
  it and the grey section below; report which.
- Clear top and bottom edges (a solid border/rule on the bottom at minimum), comfortable padding,
  icons from `Icon` allowed. Mobile: stacked, tap target ≥ 48px, no horizontal scroll.
- Still after the `.atf-ready` marker; zero client JS.

## Must not change
Copy, other sections, header, sticky call bar, contact form, `api/`, `middleware.ts`, fonts,
journey tracking, Google tag snippet, mobile hero.

## Checks
`npm ci`, `npm run check`, `npm run lint`, `npm test` (update tests for the trust bar if needed),
`npm run build`, `git diff --check`. First-frame `--controls` → `CONTROLS OK`, then `RUNS=5` on
`/` and `/contact/` at mobile and desktop, every run PASS. Lighthouse mobile on `/` (3 runs,
median). Screenshots committed to `docs/hero-layout/`: desktop at 1440 and 1920, mobile at 390,
plus `/contact/` desktop showing the trust bar.
