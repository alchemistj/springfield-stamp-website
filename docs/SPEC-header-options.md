# Spec: 5 header photo options (client request), Springfield Stamp

Status: v1, 11 Nov 2026. Branch `cursor/ss-header`, PR base `build/astro-rebuild`.

## What the client asked
The homepage hero shows a group of stamps on a round gold table (right side on desktop, top on
mobile; source images in `src/assets/`, used by `src/pages/index.astro` / the hero component).
The client says: keep the **name tags**, but the other stamps in that picture are ones they
**don't sell**. Replace them with products they do sell, picking a few from: a dater, the blue
Trodat 4913, other self-inking stamps, engraved plates, plaques, a cup/tumbler, a glass or crystal
award, embossers, signs.

## Source photos (the client's own, already in the repo)
`docs/header-candidates/source/*.jpg` (39 files, names describe the product: `stamp-*`,
`nametags-*`, `embosser-*`, `plates-*`, `plaque-*`, `awards-*`, `engraved-*`, `signs-*`). Look at
them all first (make a contact sheet). Use only these photos plus the existing hero background:
no stock images, no AI-generated products, nothing the client doesn't sell.

## Deliverable: 5 options, NOT wired into the site
Make **5 different hero product compositions**, each a single image in the same style and
footprint as the current hero product picture (products cut out from their backgrounds and
arranged together, e.g. on the same gold table or a clean surface that suits the dark hero).
Every option must include **name tags**. Vary the mix across the five, for example:
1. Name tags + Colop dater + blue 4913 + one other self-inking stamp
2. Name tags + stamps + an engraved metal plate + a plaque
3. Name tags + stamps + a crystal/glass award + an embosser
4. Name tags + a desk name plate / sign + a tumbler + a stamp
5. Your best "everything we do" mix (stamps, tags, award, plate), still uncluttered

Cut-outs must be clean (no halos, no leftover background, sensible shadows), products at
believable relative sizes, nothing cropped awkwardly, and readable text on tags/plates where the
source allows. A Python background remover such as `rembg` is fine on the build machine; commit
only the outputs, not model files.

For each option commit, under `docs/header-options/option-N/`:
- `hero-product.png` (transparent, ~1400 px wide) and a flattened `hero-product.jpg`
- `mock-desktop.png` (1440×900) and `mock-mobile.png` (390×844): the real homepage hero with this
  option swapped in (render the built site with the option temporarily swapped, then revert),
  so Josh sees exactly how it would look
Plus `docs/header-options/contact-sheet.png` showing all 5 desktop mocks labelled 1–5, and
`docs/header-options/README.md` listing which source photos each option uses.

## Must not change
The live code: after making the mocks, the site's source must be identical to the base branch
(only `docs/` and any helper script under `scripts/header-options/` added). Josh/the client pick
one option first; wiring it in (inline AVIF ≤70 KB, first-frame check) is a later step.

## Checks
`npm ci`, `npm run check`, `npm run lint`, `npm test`, `npm run build`, `git diff --check`
(docs-only change, but run them). `git diff --stat origin/build/astro-rebuild -- src/` must be
empty.
