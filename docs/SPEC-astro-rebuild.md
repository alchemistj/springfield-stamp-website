# Spec: Springfield Stamp WordPress → Astro rebuild

Status: v1, 2 Nov 2026. Approved direction from Josh (2 Nov): **the same website, on the Astro
system.** Same design (about 97% visually identical), same copy, same 6 URLs. Only basic cleanup.
The copy and design were made by people; keep them as they are.

## Reference material (read first)
- `docs/reference/current-site-audit.md`: all copy word for word, images, tags, forms, schema.
- `docs/reference/live/*-desktop.png` (1440 wide) and `*-mobile.png` (390 wide): full-page
  screenshots of the live site. **This is the design target.** `computed-styles.json` has fonts
  and colors. `scripts/reference/capture-live.mjs` re-captures them.
- `docs/reference/raw/*.html`: the live HTML. Get exact colors, font families, sizes, spacing,
  radii and image URLs from it, and from the Thrive CSS it links.
- `docs/sop/astro-full-build-rules.md`, `docs/sop/astro-first-frame-and-pagespeed.md`,
  `docs/sop/central-forms-contact-form.md`: the Fluid Frame Astro standard. **Where this spec
  differs, this spec wins** (see "Departures").

## Pages (keep these URLs exactly)
| URL | Source |
|---|---|
| `/` | home |
| `/custom-stamps/` | custom stamps |
| `/missouri-notary-stamp/` | notary stamps (4 priced products, "Buy now!" → `#buy` as today) |
| `/magnetic-name-tags/` | magnetic name tags |
| `/about/` | about |
| `/contact/` | contact (form, hours, map) |

Header nav, footer links, CTAs and button labels stay as they are on the live site.

## Stack
Astro 5, `output: "static"`, `@astrojs/vercel`, `trailingSlash: "always"`,
`build.inlineStylesheets: "always"`, Node 22, Tailwind CSS 4 via `@tailwindcss/vite`, TypeScript
strict. Scripts: `dev`, `build`, `preview`, `check`, `lint`, `test`. Commit the lockfile.
- All copy as data in `src/data/` (one file per page plus `site.ts` for shared header/footer/NAP).
- One business config `src/data/site.ts`: name, address, NAP phone `(417) 881-8828` /
  `tel:+14178818828`, email, hours, Facebook URL. Only this phone number appears anywhere.
- Route registry `src/lib/routes.ts` lists the 6 pages. Sitemap, robots, `llms.txt` and tests
  read from it.
- Every image downloaded from `wp-content/uploads` into `src/assets/`, optimized at build
  (`astro:assets`, AVIF/WebP), served from the site's own domain. No hot-linking the old site.
- Zero client JS by default. Mobile menu: `<details>` or ≤1 KB inline script. Testimonials: the
  live site shows them as a carousel on mobile only if that's what the screenshot shows;
  otherwise three static cards as on desktop.

## Copy: carry over word for word, with only these fixes
1. **Years in business = 50.** Change every "60 years", "over 60 years", "60+ years" to the 50
   equivalent ("50 years", "over 50 years", "50+ years"), including meta descriptions.
2. Typos: "avaailable" → "available".
3. Name-tag page product list says "We offer a wide variety of custom stamps": change "custom
   stamps" to "magnetic name tags" in that sentence only.
4. Custom Stamps "Portland, Maine or Portland, Oregon" sentence: keep it unless it is clearly a
   broken fragment; report the exact text and what you did.
5. Header banner "Spotfor MissouriNotary"-style line-break artifacts: render as the words the
   designer intended, with spaces.
6. NAP formatting: footer, header and contact all use `1416 S. Glenstone Ave., Springfield, MO
   65804` and `(417) 881-8828`.
7. The footer's icon-only `tel:4178818803` link points to the NAP number instead (looks the same).
Anything else that looks wrong: leave it and list it in the PR description for Josh.

## SEO cleanup (invisible, allowed)
- Exactly one H1 per page. Use the existing main headline text as the H1 (home: the red hero
  headline "Springfield Stamp: Your Trusted Partner for Custom Products"). Change the tag, not the look.
  Section titles that are styled as headings but are `<p>` today become H2/H3, same look.
- Keep every page's current `<title>` and meta description (with the 50-year fix). Contact has no
  meta description: use `Contact Springfield Stamp & Engraving at 1416 S. Glenstone Ave.,
  Springfield, MO. Call (417) 881-8828 or email orders@springfieldstamp.com.`
- Canonical `https://www.springfieldstamp.com/...` with trailing slash. Open Graph tags.
- JSON-LD: LocalBusiness (name, address, telephone, email, openingHours Mo-Fr 08:00-16:30, geo
  37.1883738,-93.2618564, url, logo, sameAs Facebook), BreadcrumbList. No ratings or review markup.
- `sitemap.xml`, `robots.txt`, `llms.txt` from the route registry.
- `vercel.json`: apex → www (one 301), no-slash → slash for each page, cache headers per SOP §6.

## Departures from the Astro SOP (Josh-approved: parity first)
- No city-first URLs, no city switcher, no two-bar header. Header and footer match the live site.
- Layout widths, section styling, product cards, the red workflow band, icons: match the live
  site, not SOP Rule 4.
- Fonts: self-host the live site's fonts (Poppins, Muli/Mulish, and whatever the red display
  headings use; find it in the CSS) as WOFF2 Latin subsets, only the weights actually used,
  `font-display: swap`, **no preload, no Google Fonts link**. List the fonts and bytes in the PR.
- Testimonials stay exactly as written, names and titles as shown (Josh confirmed they are real).

## SOP rules that still apply
- Hero: photo-first in `<body>` and inlined as a data URI, AVIF, plain `position:absolute`, the
  `.atf-ready` gate, no fade/blur/swap, no hero preload (SOP §2–3). Budget: keep the inline hero
  image(s) ≤ 70 KB total per page. If the hero needs two layers (background + product cut-out),
  you may inline both inside that budget. Report bytes.
- Logo inline (SVG if you can make a faithful one; otherwise a ≤4 KB inline image at 2×). Report which.
- No `transition: all` above the fold.
- Map on Contact: static facade (screenshot-like image + "View on Google Maps" link) that loads
  the iframe on first interaction or when visible, with reserved height. No `src` in server HTML.
- Google tag `GT-WK5CGGGZ`: add it the standard way in `<head>` (gtag snippet). Do not change
  its timing. That's the Ads manager's call.
- Contact form: Central Forms per `docs/sop/central-forms-contact-form.md` §4. Fields as on the
  live form (Name, Email, Phone, Message) + hidden honeypot. `siteKey: "springfield-stamp-website"`,
  `formKey: "main-contact"`. **Gate on the exact production host `www.springfieldstamp.com`.**
  Everywhere else (localhost, previews) the submit shows a clear "Preview: form not sent" message
  and posts nothing. No reCAPTCHA. The form is not registered in Central Forms yet. Josh approves that
  separately, so it is expected not to work in production until then.
- No Supabase, no external image hosts. Grep `dist` for `wp-content`, `springfieldstamp.com/wp-`,
  `supabase.co`, `fonts.googleapis`: zero hits.

## Done means
1. `npm run check`, `npm run lint`, `npm test`, `npm run build`, `git diff --check` all pass.
2. Tests (Vitest and/or Playwright against `dist` via `astro preview`):
   - every page in the registry builds, has one H1, unique title/description, canonical, valid JSON-LD;
   - the only phone in `dist` is 417-881-8828 (any format);
   - no "60 years"/"60+" anywhere in `dist`;
   - copy test: key strings from `src/data/` appear in the built HTML;
   - no forbidden hosts (list above) in `dist`;
   - Playwright at 1440 and 390: no horizontal scroll, mobile menu opens and has the same links as desktop nav.
3. **Visual parity:** `scripts/reference/compare.mjs` (write it): screenshots `dist` pages at
   1440 and 390 full-page and saves them beside the live references in `docs/reference/build/`.
   Look at each pair yourself and fix differences until they match closely (same layout, order,
   colors, fonts, image crops, spacing within a few px). Report what still differs.
4. First-frame check: `node scripts/perf/first-frame-check.mjs --controls` → `CONTROLS OK`, then
   `RUNS=5` on `/` and one product page via `astro preview`, mobile and desktop. Report results.
5. Local Lighthouse mobile on `/` and `/custom-stamps/` (3 runs, median): report all four scores.
   Chromium for the cloud container: `/opt/pw-browsers/chromium-1243/chrome-linux/chrome`
   (check with `ls /opt/pw-browsers`).
6. Stop every server you started before finishing.
