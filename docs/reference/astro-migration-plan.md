# Springfield Stamp: WordPress → Astro migration plan

Status: draft v0.1, 2 Nov 2026, for Josh's review. Nothing built yet.

Inputs:
- Current-site audit: `docs/clients/springfield-stamp/current-site-audit.md` (live GETs, 2 Nov 2026).
- Astro SOPs in PR #408 (draft): `docs/sop/astro-full-build-rules.md`,
  `docs/sop/astro-first-frame-and-pagespeed.md`, `scripts/perf/first-frame-check.mjs`.
- Contact form SOP in PR #423 (draft): `docs/sop/central-forms-contact-form.md`.

## 1. What exists today
- https://www.springfieldstamp.com — WordPress, Thrive Theme/Architect, Gravity Forms, Yoast,
  WP Rocket. Mobile Lighthouse (home): Perf 90, A11y 91, BP 100, SEO 92.
- 6 pages, no blog, no cart: `/`, `/custom-stamps/`, `/missouri-notary-stamp/`,
  `/magnetic-name-tags/`, `/about/`, `/contact/`.
- One location: Springfield Stamp & Engraving, Inc., 1416 S. Glenstone Ave., Springfield, MO
  65804, (417) 881-8828, orders@springfieldstamp.com, Mon–Fri 8:00am–4:30pm.
- Orders are by phone or email. The notary page shows 4 priced items with a "Buy now!" button
  that only jumps to an in-page anchor.
- Tags: Google tag `GT-WK5CGGGZ`. Google Maps embed and reCAPTCHA v3 on Contact. Google Fonts.

## 2. How the SOPs fit this client
The full build rules were written for multi-city service businesses. Springfield Stamp is one
storefront selling products. Proposed adaptations (Josh decides):

| SOP rule | Proposal for Springfield Stamp |
|---|---|
| Rule 2 city-first URLs (`/[city]/[service]/`) | **Keep today's 6 URLs exactly.** One location, no other cities. Same URLs means no ranking risk and almost no redirects. `cityConfig.ts` still holds the single NAP. |
| Rule 5 header city switcher | Drop the switcher. Top bar: hours + About, Contact. Main bar: logo, 3 quick links (Custom Stamps, Notary Stamps, Name Tags), phone, primary CTA. |
| Rule 7 NAP / DNI | NAP = (417) 881-8828. No call tracking found, so no DNI. The icon-only `tel:4178818803` footer link is dropped (Rule 7.2: one visible number) unless Josh says it matters. |
| Rule 8 hero | Photo-first inline AVIF hero, 35–60 KB, `.atf-ready` gate. Need real product/shop photos (see §5). |
| Rule 10 embeds | Contact map behind a static facade, loaded on interaction. |
| Rule 11 templates | Home, product page (custom stamps, notary, name tags), About, Contact. Product page replaces the "service page" order. |
| Rule 13 SEO | Add LocalBusiness JSON-LD with full NAP and hours (missing today). One H1 per page (Home, About, Custom Stamps have none today). Meta description for Contact. |
| Rule 14 form | Central Forms (`forms.fluidframemarketing.com/api/lead`) per PR #423. Replaces Gravity Forms and reCAPTCHA. Fields: name, email, phone, message (+ optional "Product" select). |
| Rule 15 redirects | Same URLs, so only: http→https and apex→www in one hop each (today http goes apex then www, two hops), plus no-slash→slash. Pull Search Console Pages export to catch any old URLs with impressions. |
| Rule 16 perf | PSI mobile 95+ / 100 / 100 / 100 before merge. Google tag on Window Loaded + 3 s (Ads manager's call, not ours). |

Open product question: home lists 7 product lines (custom, self-inking, address stamps, desk
name plates, acrylic awards, notary, name tags) but only 3 have pages. Keep the 3 pages and list
the rest as plain text (current behavior), or add pages for awards/name plates/self-inking?
Adding pages needs copy.

## 3. Stack
Astro 5 static, `@astrojs/vercel`, `trailingSlash: "always"`, `inlineStylesheets: "always"`,
Node 22, Tailwind 4, TypeScript strict, copy as data in `src/data/`, every image local and
optimized at build. Code patterns from `greene-planet-website` (route registry, forms lead,
redirect test), not its design.

## 4. Build steps
1. **Josh:** create the repo `alchemistj/springfield-stamp-website` (this session can't create
   repos) and a Vercel project linked to it (preview builds only).
2. **Copy file** `src/data/copy/*.json`: current copy carried over, with the fixes listed in
   §5, for Josh to approve before the build card.
3. **Assets:** download originals from `wp-content/uploads` (list in the audit §3), re-encode at
   build time. Logo to inline SVG if a vector exists; otherwise a ≤4 KB inline image.
4. **Cursor card via FF Architect** (feature work, needs a preview): scaffold + all 6 pages on
   one branch with an open PR, prompt per `docs/josh-working-rules.md` (step 0, worktree,
   checks, push only to the branch).
5. **Central Forms registration** (needs Josh's yes on each DB write): client
   `springfield-stamp`, site `springfield-stamp-website`, form `main-contact`, preview
   destination first, production destination inactive, origin `https://www.springfieldstamp.com`.
6. **Gates:** SOP §8 / Rule 16–17 on the Vercel preview, first-frame check 5 runs mobile and
   desktop, PSI 3 runs per template.
7. **Launch (Josh):** merge, DNS to Vercel, activate the production form destination, Search
   Console sitemap, watch 404s for two weeks. Keep WordPress up until the new site is
   verified, then take a full backup before anyone turns it off.

## 5. Questions for Josh before copy and build
1. **Years in business:** home says "over 60 years", About says "over 50 years" / "half a
   century". Which is right (or the founding year)?
2. **Testimonials:** "Sarah B. / Business Owner", "John D. / Marketing Manager", "Jane S. / HR
   Manager" read like template placeholders. Rule 0.2 forbids invented reviews. Are these real?
   If not, can we use real Google reviews (first name + last initial)?
3. **Copy:** carry the current copy over (fixing typos: "avaailable", the "custom stamps" line on
   the name-tag page, the "Portland, Maine or Portland, Oregon" line), or have Claude rewrite it
   for your approval?
4. **URLs:** OK to keep the 6 current URLs instead of city-first?
5. **Claims** to keep or drop: "1-Day Service!", "Fast shipping and full compliance
   guaranteed", "unparalleled in the world", "legendary for our turnaround time".
6. **Notary prices** ($22, $30, $32, $19.95): still current? Should "Buy now!" become call/email,
   or do they want online ordering (that would be a bigger scope: Stripe/Square checkout)?
7. **Second number** 417-881-8803 (footer icon link, not shown): fax or old line? Drop it?
8. **Photos:** are there real photos of the shop, team (Adam and Bri) and products, or do we
   reuse what's on the WordPress site?
9. **Tags:** who manages `GT-WK5CGGGZ`? It must move to Window Loaded + 3 s for the 95+ score.
10. **DNS / hosting:** who holds the domain's DNS?
