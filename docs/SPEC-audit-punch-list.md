# SPEC: audit punch list (Nov 20, 2026)

Source: the Sonnet audit of the preview at `a00de9f` ("Springfield Stamp rebuild: punch list before merge", Google Doc in the client's shared-drive folder). Item numbers below (H1-H9, M1-M28, L1-L22, D1-D7) are the audit's numbers, so QA can check each one off.

Branch: `fix/audit-punch-list` (off `cursor/ss-hero-layout` at `a00de9f`). Push fast-forward only. Never merge, never force-push, never touch `main`, DNS or the live site.

## Ground rules

- **Change no words except the ones in the COPY section at the bottom of this file.** That copy was written by Claude (Sonnet) and is placed word for word. Case fixes listed here (for example "Read Our STORY" to "Read Our Story") are exact strings too. Anything else that needs words: stop and report, don't write it.
- Keep from live (do not change toward the guide): logo, red slab-serif display headings, Poppins body, yellow pill buttons, deep red bands, dark footer, the designer homepage hero, the 900px column, the dark trust bar, the sticky Call/Email bar, the header hide-on-scroll, grey headings on Magnetic Name Tags, all URLs.
- Fix each thing once, in the shared component or global CSS, not per page (Checklist section 7). Measure computed values after a change; Astro scoped styles beat global CSS.
- Check every item at **390, 1280 and 1440** on your own Playwright run. Commit screenshots to `docs/astro-rules/punch-list/` as `<page>-<width>.png` (full page) for all six pages after the last change.

## Decisions (audit picks, applied)

- **D1** Homepage order goes back to live's order, then a real final CTA band: Hero, trust bar, How We Can Help, review (Sarah B.), Workflow (title, intro, outro paragraph), review (John D.), Why Do Business, review (Jane S.), About Us, final CTA band, footer.
- **D2** Grey/white boxed rows stay on the **homepage product rows only**. On Custom Stamps, Magnetic Name Tags and Notary the product rows become plain: white background, no card tone, photo beside the words, alternating sides. Short-item cards (Why Choose cards) stay cards but must fit their content (M17).
- **D3** Remove the yellow phone pill from the desktop header. Show the number as a plain text tel link in the header (`site.phone.display`, phone icon allowed, not a button).
- **D4** Phones (below 1024px): logo, a small Call button, hamburger, in one row. The Call button sits beside the hamburger, outside the menu. Label "Call" (no digits), at least 44px tall, same yellow pill style as other buttons, shrunk. Inside the hamburger menu add the phone as a plain text tel link under the page links (not a button).
- **D5** Keep the all-caps display headings and make them consistent: every H1, H2 and card title (H3) renders uppercase through CSS (`text-transform: uppercase`) in one shared rule, so the source text case no longer matters. Fix the source strings to Title Case where they are lowercase or mixed (exact strings in the case list below). Grey Magnetic headings stay grey (L11, keep as live).
- **D6** Notary product buttons read "Call to Order" (see COPY).
- **D7** Same copy at every width. About: show the desktop family story (`about.story`) at every width; the "Howdy" paragraph (`about.storyMobile`) also shows at every width, after the story. Notary: the circular stamp's "Available in multiple ink colors." line shows at every width. **Hold the Notary Journal** card exactly as it is now (client question); don't change it.

## High

- **H1** Staging copy: no change. The rebuild's homepage copy already comes from the client's homepage copy doc, the same source as the staging changes. Leave `src/data/home.ts` words alone except the COPY items.
- **H2** Done by D4.
- **H3 HELD** (client question). Leave "over 50 years" and "Shipping Nationwide" exactly as they are.
- **H4** Product photos fill their half. In `ProductRow.astro`: the photo fills the media cell edge to edge (`object-fit: cover`, `width: 100%`, `height: 100%`, no white padding, no white background showing). Desktop: photo and text halves are the same height, and the row height comes from the text (no fixed `minHeight`/`rowHeights`; remove the unused props). Phones: photo full column width, a fixed aspect ratio (4:3), cropped with cover, no white bands. Pick an `object-position` per photo only if a crop cuts the product (product still recognizable). Applies to Home, Custom Stamps, Magnetic Name Tags.
- **H5** Testimonials one at a time (D1 order). Each review is its own full-width band, centred, max 900px text column, quote then name and role, with the quote mark inside the band. One shared style for all three. Remove the three-card stack from the workflow band. L2: the band has readable contrast (dark text on a light band, or white text on the deep red; pick one and use it for all three). L3: Sarah B.'s quote has a stray leading straight `"` in the data with no closing mark; remove that one character so the quote renders with the same marks as the other two. No other change to the customers' words.
- **H6** Remove every forced `<br>` in headings site-wide: Home H1 (`<br class="mb" />`), Custom Stamps `findTitle`/`readyTitle` (`<br class="mbr" />`), Magnetic H1 (`<br class="db" />`), Magnetic "More Than Just Name Tags" H2 (`<br />`), Magnetic product card titles forced onto two lines, Notary "Buy Your Missouri Notary Supplies Today" (L12). Let `text-wrap: balance` do it. No single word alone on a last line at 390, 1280 or 1440 (the "OWN" orphan on Custom Stamps).
- **H7** Custom Stamps at 390: the "Premium Quality" image is centred under its centred heading; normal section spacing (no ~130px empty block above "Find the Perfect Stamp"); no white strip above the hero title.
- **H8** The footer fully clears the sticky call bar on phones: add bottom padding to the page (or footer) equal to the bar's height plus the safe-area inset, so the last footer line, the Facebook icon and the new copyright row are all visible above the bar when scrolled to the bottom.
- **H9** Every page ends with a final CTA band, last before the footer: deep red, headline, one or two sentences, a primary button and a secondary button, centred.
  - Home: new band, words in COPY 1.
  - Custom Stamps: move the existing "Ready to create your own custom stamp?" band to the end (after "Make your mark"). Keep its words. Its button stays primary; add a secondary "Email Us" (mailto) button beside it.
  - Magnetic Name Tags: the existing last band "Ready to give your team…" gets buttons: primary "Call Now" (tel) and secondary "Email Us" (mailto). Keep the existing sentence and its text phone link.
  - Notary: the existing last band "Buy Your Missouri Notary Supplies Today" already is the final band; just fix labels (COPY 4) and spacing (L12).
  - About: the closing section is the final band; style it as the same deep red band, button label from COPY 2, plus secondary "Email Us".
  - Contact: no band (the page is the contact form).

## Medium

- **M1 / M2** Hero photos: **no change** (the designer hero and the phone storefront were Josh's earlier calls). M2 only: the homepage H1 wraps to three lines at 1440 (widen the hero text column if needed; don't shrink the type below the current size).
- **M3** Done by D1.
- **M4** Name Tags button label: COPY 3.
- **M5** Settled: testimonial 1 and the company name come from the client's copy doc. No change.
- **M6** Done by D3/D4.
- **M7** Buttons: exactly two variants site-wide in the shared `Button.astro`: primary (yellow pill) and secondary (white outline pill on dark bands, the same shape). One font size, one weight (600), one letter spacing, no drop shadows anywhere (remove the `shadow` prop uses), every button at least 44px tall, label on one line at 390 and up (use the COPY labels; if a label still can't fit at 390, let it wrap neatly inside the pill rather than clip). Fixed per-page `width={…}` props go: buttons size to their label with consistent horizontal padding, and buttons in one row share a height. The header phone link, sticky bar buttons, Contact "Send Message" button and "View on Google Maps" button use the same two variants.
- **M8** Paragraphs fill their column: remove per-paragraph max-widths and forced splits so the text wraps naturally to the column. On Custom Stamps, product card text that was split into several short paragraphs where live runs one goes back to one paragraph (same words).
- **M9** Done by D5. Plus the case list below.
- **M10** Done by D2.
- **M11** Homepage About photo: crop/position so the whole "SPRINGFIELD STAMP & ENGRAVING" sign is visible at 1280 and 1440, and add alt text from COPY 5.
- **M12** Footer (Rule 4.4): add the description and service area (COPY 7), hours from `site.hours` (`Mon-Fri 8:00am - 4:30pm`), an "About" link in INFORMATION (between Notary Stamps and Contact Us), and a copyright row at the very bottom (COPY 7, year from `new Date().getFullYear()` at build). Remove the unused `phone.footer` entry from `site.ts`.
- **M13** Footer columns equal width (within 5px), headings aligned on one top line at 1280 and 1440 (SOCIAL currently ~24px low), logo aligned with the headings. The address never breaks inside "Springfield Stamp & Engraving, Inc." (non-breaking spaces or `white-space: nowrap` on the name).
- **M14** Settled (client's Facebook URL). No change.
- **M15** Alt text from COPY 5 on every content photo listed there. Decorative icons keep `alt=""`. The Home Name Tags and Name Plates photos must appear in the accessibility tree with their alt.
- **M16** gtag: load `gtag/js` and run the config on `window` load + 3 seconds, or on the first interaction (scroll, pointerdown, keydown, touchstart), whichever comes first, once (Rule 16). Keep the `dataLayer`/`gtag()` stub inline in the head so journey tracking and `lead_form_success` calls before load are queued, not lost.
- **M17** Why Choose cards on Custom Stamps and Magnetic Name Tags: cards size to their content, cards in one row are equal height with no more than about 24px of empty space at the bottom of the tallest, and both pages use the same card style (pick all grey, as Magnetic). Remove the fixed `rowHeights`.
- **M18** Magnetic "Design Your Own in Minutes": remove the full-width three-photo strip. Show the section as text with one photo beside it (the existing tag image, whole), and if the strip photos are worth keeping, place them at matching sizes beside the "More Than Just Name Tags" text instead, whole, none cut off. The three step text columns: equal widths, tops aligned.
- **M19** Magnetic at 390: one alignment pattern (left-aligned body, headings centred is fine if consistent page-wide), normal section spacing (no ~120px white above/below tag photos), and the "Give us a call today" call line is plain text with its button, not a grey card.
- **M20** Done by M7 (one-line button, 44px+).
- **M21** Notary H1: "ONE-STOP" never splits (use a non-breaking hyphen U+2011 in the render, or `white-space: nowrap` on that word) and the H1 is three lines at 1440.
- **M22** Notary band labels: COPY 4.
- **M23** Done by D6.
- **M24 HELD** (journal, client question). No change.
- **M25 HELD** (compliance wording and prices, client question). No change.
- **M26** Done by D7.
- **M27** About button label: COPY 2. No shadow (M7).
- **M28** Contact at 1280/1440: the details block and the map start on the same top line; the map runs the full height of the details column (or the columns are equal height). Keep the "View on Google Maps" button below the map, styled as the secondary variant.

## Low

- **L1** No change (Vercel toolbar on previews only). Confirm in your report that nothing in our code renders a round button at the right edge.
- **L4** `home.ts` Why "Customer Service": the bold covers the whole word: `{ strong: "build relationships" }, "."` (same words).
- **L5** One space where a space plus a non-breaking space sits: Home Notary row ("plus –  we" has a double space), About "every day.  Our customers". Grep `src/data` for `  ` and `  ` (double space) and fix all.
- **L6** `site.hours.days`: "Mon- Fri" becomes "Mon-Fri" (Contact page and llms.txt).
- **L7** Custom Stamps "Contact Our US-Based Team": remove the emoji character from the text; keep the `Icon` component phone icon.
- **L8** Titles and descriptions in `src/lib/routes.ts`: COPY 6. Update the comment at the top of the file.
- **L9** Homepage hero call button: on phones (below 768px) its label is "Call Now" (no digits); desktop unchanged. Trust bar: no change (Josh-approved wording).
- **L10** Hamburger: a real `<button aria-expanded aria-controls>` that toggles the menu (keep no-JS fallback if easy), announced as a button.
- **L12** Notary "Buy Your Missouri Notary Supplies Today": one line at 1440, even spacing (no ~80px gaps before the phone/email row and before the buttons).
- **L13** Notary product cards: one alignment inside each card (left, as live), buttons centred under the card is fine.
- **L14** Notary at 390: product photo at a modest height (max about 220px, cover), no ~60px white gap before the next product.
- **L15** Contact hero at 1280/1440: the "You can reach us at…" line and arrow stay clear of the stamps in the hero photo.
- **L16** One heading red site-wide: About "Why Choose Springfield Stamp?" and Contact "SEND US A MESSAGE" use the same dark red as every other H2.
- **L18** Custom Stamps: bold "custom logo stamps", "art stamps" and "notary stamp" in the Howdy paragraph, as live, and the Premium paragraph is one block (same words).
- **L19** Magnetic "…stick – literally!": the dash stays on the line with the word before it (non-breaking space before the dash).
- **L20** Custom Stamps hero title at 390: at least 24px side padding. H1 words unchanged.
- **L2, L3** Done by H5. **L11** keep as live. **L17, L21** no change. **L22** keep the typo fixes.

## Case list (exact strings, D5 / M9)

These are source-string case fixes only (CSS renders them uppercase anyway where they are headings):

- `home.ts` about cta: "Read Our STORY" becomes "Read Our Story"
- `home.ts` why titles: "FAST TURNAROUND" becomes "Fast Turnaround"; "QUALITY WORK" becomes "Quality Work"
- `custom-stamps.ts`: "why choose springfield stamp?" becomes "Why Choose Springfield Stamp?"; "NOTARY STAMPS" becomes "Notary Stamps"; "Attention to detail" becomes "Attention to Detail"; "Lightning-fast turnaround" becomes "Lightning-Fast Turnaround"; "Personalized customer service" becomes "Personalized Customer Service"; "Community focus" becomes "Community Focus"; "Ready to create your own custom stamp?" becomes "Ready to Create Your Own Custom Stamp?"; "Make your mark with Springfield Stamp" becomes "Make Your Mark with Springfield Stamp"
- `magnetic-name-tags.ts`: "BREAK THE ICE" becomes "Break the Ice"; "Community focus" becomes "Community Focus"; "CALL US" becomes "Call Us"
- Contact form heading "send us a message" / "SEND US A MESSAGE" and "CONTACT US" headings: Title Case in source ("Send Us a Message", "Contact Us")
- Button labels everywhere: Title Case in source, rendered as written (buttons are not uppercased by CSS)

## COPY (word for word)

Written by Claude (Sonnet), reviewed by Claude (Opus). Place exactly as written. "{year}" means the build year from code.

**COPY 1. Homepage final CTA band** (last before the footer, deep red, white text, centred)
- Headline: `Ready to Start Your Order?`
- Body: `Give us a call or send us an email, tell us what you need, and our friendly team will walk you through the rest. We're right here on S. Glenstone Ave. in Springfield.`
- Primary button (tel): `Call Now`
- Secondary button (mailto): `Email Us`
- The workflow band's old button "Click to Call (417) 881-8828" becomes `Call (417) 881-8828` (the outro paragraph stays, words unchanged).

**COPY 2. About closing button** (links to /contact/): `Get in Touch`. Secondary button beside it (mailto): `Email Us`.

**COPY 3. Homepage product row buttons**
- Name Tags row: `See Magnetic Name Tags`
- Custom Stamps row: `See Custom Stamps`
- Notary row: keep `Get Your Notary Stamp`

**COPY 4. Notary**
- The three product card buttons: `Call to Order`
- Final band buttons: `Call Us` (tel) and `Email Us` (mailto)

**COPY 5. Alt text** (decorative icons and the quote mark keep `alt=""`)
- Home Name Tags row (`springfield-logo-magnetic-tags-2.png`, add `imageAlt` in home.ts): `Black magnetic name tag reading Taylor Sloan, Vice President, Community Relations, with a university logo`
- Home Name Plates row (`desk-name-plate.webp`): `Black wedge desk name plate with a silver engraved plate reading Patrick Wisdom, on a wood desk`
- Home About photo (`springfield-stamp-about.jpeg`): `Springfield Stamp & Engraving storefront on S. Glenstone Ave. with red lettering, an open sign and a 1 Day Service sign`
- Custom Stamps premium (`springfield-stamps-premium.png`): `Round "Premium Quality" stamp mark with a smudged postmark across the top`
- Custom Stamps Self-Inking row (`springfield-stamp-ideal-line.jpg`): `Black Ideal 4931 self-inking stamp with a clear ink window at the base`
- Custom Stamps Signature row (`springfield-stamp-maxlight.jpg`): `Gray and black MaxLight by Trodat pre-inked stamp with a round base`
- Custom Stamps Logo row (`springfield-stamp-logo-stamp-2.png`): `Round black Ideal 500R self-inking stamp with its protective cap set beside it`
- Custom Stamps Daters & Inks row (`springfield-stamp-daters-inks.jpg`): `Trodat Professional 55510 band stamp with rows of turning number wheels`
- Custom Stamps Notary row (`springfield-stamp-4913.jpg`): `Gray Ideal 4913 rectangular self-inking stamp with a clear base`
- Custom Stamps Make Your Mark (`make-your-mark-2.jpg`): `Group of stamps: a dater, a Trodat COMPLETED stamp, a pink notary embosser, a slim black stamp and a red pocket stamp`
- Magnetic design image (`magnetic-tags-4.png`): `Two white name tags: a Humane Society tag for Mr. Poe Poe and a Missouri Master Gardener tag for Jerry Doughty`
- Magnetic photo strip (`springfield-prof-nametags2.png`), wherever it ends up: `Three photos of people wearing name tags: a man in a T-shirt, two coworkers in black suits with a clipboard, and a woman in a lab coat`
- Magnetic wall photo (`springfield-stamp-name-tags.jpg`): `Wall display of many sample name tags in different colors, shapes and materials, including wood, metal and photo ID badges`
- Magnetic Classic row (`springfield-magnetic-tags.jpg`): `Silver name tag reading Jennifer Linders with a Fresh Gallery logo`
- Magnetic Logo row (`springfield-logo-magnetic-tags.jpg`): `Black name tag reading Taylor Sloan, Vice President, Community Relations, with a university logo`
- Magnetic Engraved row (`springfield-engraved-magnetic-tags.jpg`): `Silver name tag with a black border reading Jeff Williams, Shift Manager, with a Sonic logo`
- Magnetic Full-Color row (`springfield-full-color-magnetic-tags3.jpg`): `White name tag with a red border and full-color Andy's Frozen Custard logo, reading John Brown, Springfield, Missouri`
- Magnetic Photo row (`photo-name-tags.png`): `Vertical white ID badge with a Solera Energy logo, a portrait photo and the name Bryan Thompson, Territory Director`
- Notary Rectangle card (`springfield-stamps-rectangular.jpg`): `Gray Ideal 4913 rectangular self-inking stamp`
- Notary Circular card (`springfield-stamps-circular.jpg`): `Round black Ideal 400R self-inking notary stamp with a Notary Public seal on top`
- Notary Embosser card (`springfield-stamps-notary-embosser.jpg`): `Black desk notary embosser with a chrome seal plate and a black handle`
- Notary Journal card (`springfield-stamps-mobile.jpg`, card itself is held): `Display of stamps, daters and name tags on a gold round table in front of the shop sign`

**COPY 6. Titles and meta descriptions** (`src/lib/routes.ts`)
- Home title: `Custom Stamps & Name Tags in Springfield, MO | Springfield Stamp`
- Home description: `Family-owned Springfield, MO shop for custom stamps, name tags, signs, name plates and awards. Friendly service and fast turnaround.`
- Custom Stamps title: `Custom Stamps in Springfield, MO | Springfield Stamp & Engraving`
- Custom Stamps description: `Self-inking, signature, logo and dater stamps, custom made in Springfield, MO. Friendly service and fast turnaround. Call (417) 881-8828 to get started.`
- Missouri Notary Stamp title: `Missouri Notary Stamps in Springfield, MO | Springfield Stamp`
- Missouri Notary Stamp description: `Missouri notary stamps and embossers from Springfield Stamp & Engraving in Springfield, MO. Call (417) 881-8828 or email to order.`
- Magnetic Name Tags title: `Magnetic Name Tags in Springfield, MO | Springfield Stamp`
- Magnetic Name Tags description: `Classic, logo, engraved, full-color and photo magnetic name tags in Springfield, MO. Friendly, fast service. Call (417) 881-8828 to start your order.`
- About title: `About Springfield Stamp | Family-Owned in Springfield, MO`
- About description: `Meet Adam and Bri, the family owners of Springfield Stamp & Engraving in Springfield, MO. Friendly service, careful work and quick turnaround.`
- Contact title: `Contact Springfield Stamp & Engraving | Springfield, MO`
- Contact description: `Visit Springfield Stamp & Engraving at 1416 S. Glenstone Ave., Springfield, MO. Open Monday through Friday, 8:00am to 4:30pm. Call (417) 881-8828.`
- The visible H1s don't change; og:title and og:description follow the new title and description.

**COPY 7. Footer**
- Description: `A family-owned shop in Springfield, MO making custom stamps, name tags, signs, name plates and awards. Friendly service and fast turnaround.`
- Service area: `Based in Springfield, MO. Call or email us to start an order.`
- Copyright row: `© {year} Springfield Stamp & Engraving, Inc. All rights reserved.`
- Hours line: `Mon-Fri 8:00am - 4:30pm` (from `site.hours`)

## Report

Report the head SHA, and for each item number above: what you changed, or "no change" with the reason. Re-run `check`, `lint`, `test`, `build`, `qa:paragraphs` (list any paragraph that moved or changed, with why) and the first-frame check (`RUNS=5`) on all six pages, plus a Playwright pass at 390 and 1440 that measures: sideways scroll, buttons under 44px or clipped, tel links that wrap, single last-line words in headings, unequal side-by-side boxes, white gaps between sections, and a grouped inventory of button computed styles (expect 2 variants). Put the numbers in the report.
