# Spec: paragraph parity and length check, Springfield Stamp

Status: v1, 13 Nov 2026 (overnight, Josh's go via FF Architect). Branch `cursor/ss-paragraphs`,
PR base `build/astro-rebuild`. Nothing merges to production.

## Why
On the Springfield Warrior Sports rebuild, two WordPress-rebuild mistakes reached Josh:
paragraphs from the live site merged into one, and paragraphs over 4 lines. The SWS architect
built `scripts/qa/paragraphs.mjs` in `alchemistj/springfield-warrior-sports-website` (PR #9).

## Do
1. Port that script to this repo as `scripts/qa/paragraphs.mjs` (copy it from SWS PR #9's head
   branch; adapt only paths, page list and selectors). If you cannot read that repo, implement
   the same three rules yourself and say so in the report:
   - **Parity:** every paragraph on the live page (https://www.springfieldstamp.com, the 6 URLs
     `/`, `/custom-stamps/`, `/missouri-notary-stamp/`, `/magnetic-name-tags/`, `/about/`,
     `/contact/`) is its own paragraph on the rebuild. Compare normalised text; report any live
     paragraph that is merged into another or missing.
   - **Length:** no paragraph renders over 4 lines at 1440px wide (Playwright, measured from the
     rendered line boxes).
   - **Splits:** fixes split only at sentence ends, and the next part can't start lowercase.
   Add `npm run qa:paragraphs`.
2. Run it on every page. Fix every hit in `src/data/` by splitting paragraphs **only between
   sentences, with no word changes** (copy is human-written and must stay word for word; see
   `CLAUDE.md`). Restoring a live-site paragraph break counts as a split.
3. Re-run until clean.

## Report (also put it in the PR description)
A before/after table: page, paragraph (first few words), problem (merged / N lines), fix.
For each changed page, its preview URL on this branch's Vercel preview.

## Must not change
Words, layout, styles, components other than what a split needs, first-frame behaviour.

## Checks
`npm ci`, `npm run check`, `npm run lint`, `npm test`, `npm run build`, `git diff --check`,
`npm run qa:paragraphs` clean. First-frame `--controls` then `RUNS=5` on `/` mobile+desktop PASS.
Text diff check: the concatenated words of every page are identical before and after.
