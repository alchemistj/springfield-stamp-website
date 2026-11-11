# Header photo options

Five mockups for the homepage hero. Each one keeps name tags and replaces the stamps the shop does not sell with products from the client's own photos in `docs/header-candidates/source/`.

Josh picked option 4. That one is wired into the homepage hero (`src/assets/home-hero.jpg` and `home-hero-mobile.jpg`): the Robert Muse and Shryer name bars, the Regency desk sign, the red Casper tumbler, and the blue Trodat Printy 4913, sitting on the original gold table. The fresh homepage screenshots are `option-4/final-desktop.png` and `option-4/final-mobile.png`.

The other four options stay here as the choices that were not picked. The contact page still uses `springfield-stamps4.jpg`, and the notary page still uses `springfield-stamps-mobile.jpg` for the journal photo.

`scripts/header-options/build_options.py` cuts the products out and composites them. `scripts/header-options/shoot_mocks.mjs` temporarily swaps each scene into the built homepage, screenshots it, and restores `src/`.

## How to read an option

- `hero-product.png` is the product cluster with a transparent background, 1400 px wide.
- `hero-product.jpg` is the same cluster on the gold table.
- `mock-desktop.png` is the real homepage at 1440×900 with this option in the hero.
- `mock-mobile.png` is the real homepage at 390×844.
- `scene-desktop.jpg` and `scene-mobile.jpg` are the full hero photos those mocks were shot from. They are the same size as the live hero files (1674×712 and 748×311).

`contact-sheet.png` shows the five desktop mocks, labelled 1–5.

## Option 1 — Name tags, Colop dater, blue Trodat 4913, and an Ideal 4926

The three self-inkers the shop sells, with the two name tags from the current hero in front.

- `nametags-updated.jpg` — Jerry Doughty and Humane Society (Mr. Poe Poe) badges
- `stamp-colop-dater.jpg` — Colop 2360
- `stamp-blue-4913.jpg` — blue Trodat Printy 4913
- `stamp-4926.jpg` — Trodat Ideal 4926

## Option 2 — Name tags, a self-inker, an engraved plate, and a plaque

A self-inker plus the engraving side of the shop: a brass plate in front of a full-size plaque.

- `nametags-updated.jpg` — Molly Hackenwerth and Taylor Sloan badges
- `stamp-4911.jpg` — Trodat 4911
- `plates-3.jpg` — Flat Out Speed brass plate
- `plaque-6531.jpg` — Don Evans American Legion plaque

## Option 3 — Name tags, a self-inker, a glass award, and an embosser

A glass award and a seal embosser with a self-inking stamp and name tags.

- `nametags-updated.jpg` — Jerry Doughty and Taylor Sloan badges
- `stamp-4926.jpg` — Trodat Ideal 4926
- `awards-8539.jpg` — Shanna Cass glass award (the opaque blue-and-gold award; the clear crystal in that photo shows the wood behind it and was not used)
- `embosser-basic.jpg`

## Option 4 — Name tags, a desk sign, an engraved tumbler, and a stamp

Metal name bars, a desk sign, an engraved tumbler, and a blue 4913.

- `nametags-police.jpg` — Robert Muse and Shryer bars
- `signs-standoff-printed-2.jpg` — Regency Business Management desk sign
- `engraved-tumblers.jpg` — red Casper Building Co. tumbler
- `stamp-blue-4913.jpg` — blue Trodat Printy 4913

## Option 5 — Stamps, name tags, a glass award, and an engraved plate

One of each, still a single cluster.

- `nametags-updated.jpg` — Jerry Doughty and Humane Society (Mr. Poe Poe) badges
- `stamp-blue-4913.jpg` — blue Trodat Printy 4913
- `awards-8539.jpg` — Shanna Cass glass award
- `plates-1.jpg` — Nathanael Greene brass plate
