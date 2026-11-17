# Spec: the Astro rules win over the old WordPress layout (all 6 pages)

Status: v1, 13 Nov 2026. Branch `cursor/ss-hero-layout` (PR #5), base `build/astro-rebuild`.

## Josh (13 Nov)
"Whenever an Astro rule is different than an exact rebuild, I want the Astro rule to trump what
the current site does." He saw: the About page's above-the-fold "About Springfield Stamp" sits
outside the 900 width; the Magnetic Name Tags page looks the same; the Missouri Notary Stamp page
has a wider margin too. "We have mixed margin widths all over, and I want a consistent one like
the Astro guide says."

## The rule (ff-architect `docs/sop/astro-full-build-rules.md` on main; read all of it)
- Rule 0.4: a rebuild keeps the words, photos, brand colours, fonts and the look of each section;
  **everything structural comes from the rules, never from the old code**: widths (Rule 4, the
  900px column), header and menu (Rule 5), mobile bar (6), phone (7), hero (8), trust bar (9),
  CTAs (10), page templates (11), footer (4.4), forms (14), SEO (13), performance (16). Where the
  old code conflicts, the rule wins. Don't copy old widths, spacing or components to "match".
- Rule 4: one CSS variable `--content-max: 900px` with `--content-pad: 24px`. Every readable
  section uses it. No section-level `max-w-*` or pixel overrides. Full-width bands only for
  backgrounds; their content stays at 900px.
- Rule 4.2: no full-width body images below the hero; photos sit beside the words in two-column
  sections (photo about 40–45%), alternating sides. Reviews are full-width bands.
- Rule 4.3: related services and the final CTA are their own full-width bands; the final CTA is
  the last section before the footer.

## Do
1. Audit all 6 pages (`/`, `/custom-stamps/`, `/missouri-notary-stamp/`, `/magnetic-name-tags/`,
   `/about/`, `/contact/`) against Rules 4, 4.2, 4.3, 4.4, 5, 8, 9, 10 and 11. List every place
   the build follows the old site instead of the rule (widths, section max-widths, image layout,
   header/menu behaviour, band order, footer columns).
2. Fix them all: one `--content-max: 900px` / `--content-pad: 24px` shared width for every
   readable section, including the hero text on About, Magnetic Name Tags and Missouri Notary
   Stamp (the hero background may stay full-bleed; its text column aligns to the same 900px
   column as the page). Remove every section-level width override.
3. Keep: every word (word for word, `src/data/` unchanged except structure), photos, colours,
   fonts, the homepage hero from PR #5, the trust bar, the sticky call bar, journey tracking,
   the contact form.
4. Anything the old site has that the rules don't cover: keep it only if it serves the visitor,
   and list it in the report as a possible new rule.

## Report
A table: page, what was off (old-site behaviour), rule, fix. Screenshots in
`docs/astro-rules/` for every page at 1440 and 390.

## Checks
`npm ci`, check, lint, test, build, `git diff --check`, `npm run qa:paragraphs` clean (re-split
only between sentences if the 900px column changes line counts; no word changes), first-frame
`--controls` then `RUNS=5` on all 6 pages at mobile and desktop, all PASS. Lighthouse mobile on
`/` and `/about/`. A word check: the visible text of every page is identical before and after.
