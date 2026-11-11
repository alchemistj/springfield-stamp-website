#!/usr/bin/env python3
"""Build five homepage hero options from the client's own product photos.

Reads:
  docs/header-candidates/source/*.jpg
  src/assets/springfield-stamps4.jpg   (existing hero background only)

Writes:
  docs/header-options/option-N/hero-product.png
  docs/header-options/option-N/hero-product.jpg
  docs/header-options/option-N/scene-desktop.jpg   (swap source for the desktop hero)
  docs/header-options/option-N/scene-mobile.jpg    (swap source for the mobile hero)

Does not modify anything under src/. Background removal uses rembg; the model
stays in the user cache and is not written into the repo.

Mock screenshots (mock-desktop.png, mock-mobile.png) and the contact sheet are
produced by scripts/header-options/shoot_mocks.mjs after a temporary swap.
"""

from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "docs" / "header-candidates" / "source"
HERO_BG = ROOT / "src" / "assets" / "springfield-stamps4.jpg"
OUT = ROOT / "docs" / "header-options"

# Stage mapped onto the right side of the 1674×712 hero, over the gold table.
# Kept inside the band the live hero actually shows, including the mobile crop.
STAGE = (900, 200, 640, 410)  # x, y, w, h
PRODUCT_W = 1400


def largest_sprite(im: Image.Image, erode: int = 0) -> Image.Image:
    """Keep the largest foreground blob and trim to it."""
    im = im.convert("RGBA")
    arr = np.array(im)
    alpha = arr[:, :, 3]
    bw = (alpha > 40).astype(np.uint8) * 255
    cnts, _ = cv2.findContours(bw, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not cnts:
        return im
    mask = np.zeros(alpha.shape, np.uint8)
    cv2.drawContours(mask, [max(cnts, key=cv2.contourArea)], -1, 255, -1)
    if erode:
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (erode * 2 + 1, erode * 2 + 1))
        mask = cv2.erode(mask, k)
    mask = cv2.GaussianBlur(mask, (3, 3), 0)
    arr[:, :, 3] = (arr[:, :, 3].astype(np.float32) * (mask.astype(np.float32) / 255)).astype(np.uint8)
    ys, xs = np.where(arr[:, :, 3] > 12)
    if len(xs) == 0:
        return Image.fromarray(arr)
    pad = 2
    arr = arr[max(0, ys.min() - pad) : ys.max() + 1 + pad, max(0, xs.min() - pad) : xs.max() + 1 + pad]
    return Image.fromarray(arr)


def cut(session, name: str, box: tuple[int, int, int, int] | None = None, erode: int = 0) -> Image.Image:
    im = Image.open(SOURCE / name).convert("RGB")
    if box:
        im = im.crop(box)
    return largest_sprite(remove(im, session=session), erode=erode)


def cut_tumbler(session, index: int) -> Image.Image:
    """Pull one tumbler out of the white-background grid (row-major)."""
    im = Image.open(SOURCE / "engraved-tumblers.jpg").convert("RGB")
    arr = np.array(im)
    white = (arr[:, :, 0] > 245) & (arr[:, :, 1] > 245) & (arr[:, :, 2] > 245)
    bw = (~white).astype(np.uint8) * 255
    bw = cv2.morphologyEx(bw, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    cnts, _ = cv2.findContours(bw, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    boxes = []
    for c in cnts:
        x, y, w, h = cv2.boundingRect(c)
        if h > 200 and 80 < w < 280 and h > w:
            boxes.append((x, y, w, h))
    boxes.sort(key=lambda b: (b[1] // 300, b[0]))
    x, y, w, h = boxes[index]
    crop = im.crop((max(0, x - 6), max(0, y - 6), x + w + 6, y + h + 6))
    return largest_sprite(remove(crop, session=session), erode=0)


def load_sprites(session) -> dict[str, Image.Image]:
    nt = "nametags-updated.jpg"
    sprites = {
        "blue": cut(session, "stamp-blue-4913.jpg"),
        "colop": cut(session, "stamp-colop-dater.jpg"),
        "s4911": cut(session, "stamp-4911.jpg"),
        "s4926": cut(session, "stamp-4926.jpg"),
        "embosser": cut(session, "embosser-basic.jpg"),
        "jerry": cut(session, nt, (350, 215, 860, 560), erode=1),
        "humane": cut(session, nt, (720, 845, 1110, 1055), erode=1),
        "taylor": cut(session, nt, (150, 1100, 480, 1380), erode=1),
        "molly": cut(session, nt, (20, 280, 450, 560), erode=1),
        "muse": cut(session, "nametags-police.jpg", (280, 560, 780, 780)),
        "shryer": cut(session, "nametags-police.jpg", (300, 760, 880, 1000)),
        "speed": cut(session, "plates-3.jpg", (140, 300, 1020, 640), erode=1),
        "greene": cut(session, "plates-1.jpg", (500, 980, 1200, 1320), erode=1),
        "plaque": cut(session, "plaque-6531.jpg", erode=1),
        "award": cut(session, "awards-8539.jpg", (1080, 540, 1465, 1300), erode=1),
        "sign": cut(session, "signs-standoff-printed-2.jpg", erode=1),
        "tumbler": cut_tumbler(session, 2),  # red Casper Building Co. tumbler
    }
    return sprites


def build_plate() -> np.ndarray:
    """Hero background with the old (unsold) stamps removed and the gold table redrawn."""
    src = np.array(Image.open(HERO_BG).convert("RGB"))
    h, w = src.shape[:2]
    im = src.astype(np.int16)
    r, g, b = im[:, :, 0], im[:, :, 1], im[:, :, 2]
    luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
    yy, xx = np.indices((h, w))
    gold = (r > 145) & (g > 115) & (b < 185) & (r > b + 28) & (g > b + 12) & (np.abs(r - g) < 80) & (yy > 480) & (xx > 850)
    bright = (luma > 105) & (~gold) & (xx > 900) & (yy > 200) & (yy < 650)
    pts = np.column_stack(np.where(bright)[::-1]).astype(np.int32)
    hull = cv2.convexHull(pts)
    mask = np.zeros((h, w), np.uint8)
    cv2.fillConvexPoly(mask, hull, 255)
    mask = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (22, 22)))
    # Stay below the storefront letters. Stamp tops that poke into the sign are
    # removed separately, as small inpaints, so the word ENGRAVING stays intact.
    mask[:292, :] = 0
    mask[:, :900] = 0

    tops = np.zeros((h, w), np.uint8)
    # Upper bodies of the old stamps, which sit above the main cleared region.
    # These boxes stay under the red storefront letters.
    tops[230:310, 1088:1310] = 255
    tops[255:310, 1310:1505] = 255
    tops[195:310, 1488:1674] = 255
    tops[yy < 190] = 0
    src_bgr = cv2.cvtColor(src, cv2.COLOR_RGB2BGR)
    cleaned = cv2.cvtColor(cv2.inpaint(src_bgr, tops, 8, cv2.INPAINT_TELEA), cv2.COLOR_BGR2RGB)

    out = cleaned.astype(np.float32)
    # Fill the cleared cluster with the same gray the light-leak already puts on
    # the right side of the photo, darker toward the left, so it reads as wall.
    yf0, xf0 = np.mgrid[0:h, 0:w].astype(np.float32)
    leak = np.clip((xf0 - 980) / 680.0, 0, 1)
    lift = np.clip((360 - yf0) / 220.0, 0, 1)
    left_c = np.array([12, 11, 11], np.float32)
    right_c = np.array([56, 54, 53], np.float32)
    fill = left_c * (1 - leak)[..., None] + right_c * leak[..., None]
    fill = fill + lift[..., None] * np.array([8, 8, 8], np.float32)
    rng = np.random.default_rng(4)
    fill = fill + rng.normal(0, 1.5, (h, w, 1)).astype(np.float32)
    m = mask > 0
    out[m] = fill[m]
    # Fade the left edge of the cleared wall into the real wall just beside it,
    # so the cut doesn't read as a gray shape pasted on the storefront.
    band = 56
    for y in range(h):
        xs = np.flatnonzero(mask[y])
        if xs.size == 0:
            continue
        left = int(xs[0])
        sample_x = max(0, left - 12)
        if mask[y, sample_x]:
            continue
        col = cleaned[y, sample_x].astype(np.float32)
        x1 = min(w, left + band)
        span = np.arange(left, x1)
        t = ((span - left) / band).astype(np.float32)
        out[y, span] = col * (1 - t)[:, None] + out[y, span] * t[:, None]

    # Gold table. Outer disc plus a flatter top surface, colors sampled from the
    # original rim (antique gold, not a neon disc).
    yf, xf = np.mgrid[0:h, 0:w].astype(np.float32)
    cx, cy, rx, ry = 1345.0, 608.0, 500.0, 108.0
    e = ((xf - cx) / rx) ** 2 + ((yf - cy) / ry) ** 2
    outer = e <= 1.0
    e2 = ((xf - cx) / (rx - 18)) ** 2 + ((yf - (cy - 36)) / 58.0) ** 2
    top = (e2 <= 1.0) & (yf < cy + 8)
    ny = (yf - cy) / ry
    nx = (xf - cx) / rx
    t = np.clip((ny + 0.15) / 1.05, 0, 1)
    c_back = np.array([150, 128, 78], np.float32)
    c_front = np.array([196, 164, 96], np.float32)
    surf = c_back * (1 - t)[..., None] + c_front * t[..., None]
    highlight = np.exp(-((ny - 0.05) ** 2) / 0.18) * np.exp(-(nx ** 2) / 1.4)
    surf = surf + highlight[..., None] * np.array([22, 18, 8], np.float32)
    surf = surf * (0.90 + 0.12 * np.clip(-nx + 0.2, 0, 1))[..., None]
    rt = np.clip((np.sqrt(np.maximum(e, 0)) - 0.72) / 0.28, 0, 1)
    rim = np.array([206, 170, 88], np.float32) * (1 - rt)[..., None] + np.array([112, 78, 32], np.float32) * rt[..., None]
    lip = np.exp(-((ny - 0.62) ** 2) / 0.01) * np.exp(-(nx ** 2) / 0.8)
    rim = rim + lip[..., None] * np.array([36, 32, 8], np.float32)
    rim = rim * (0.82 + 0.22 * np.clip(-nx, 0, 1))[..., None]
    layer = np.where(top[..., None], surf, rim)
    alpha = np.clip((1 - e) * 8, 0, 1) * outer
    # Soft contact shadow just under the disc.
    shadow = np.exp(-((yf - (cy + ry * 0.95)) ** 2) / (2 * 9 ** 2)) * np.exp(-(nx ** 2) / 0.65)
    shadow = np.clip(shadow, 0, 0.5) * (xf > 960) * (yf > cy)
    out = out * (1 - shadow[..., None] * 0.7)
    out = out * (1 - alpha[..., None]) + np.clip(layer, 0, 255) * alpha[..., None]

    # Soften only the seam where the new wall meets the photo. The old products
    # are already gone, so this blur cannot bring them back.
    hard = np.clip(out, 0, 255).astype(np.uint8)
    soft = cv2.GaussianBlur(hard, (0, 0), 6)
    ring_k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17, 17))
    outer_ring = cv2.dilate(mask, ring_k) > 0
    inner = cv2.erode(mask, ring_k) > 0
    seam = outer_ring & (~inner) & (alpha < 0.25)
    hard[seam] = soft[seam]
    return hard


def scale_to_height(im: Image.Image, height: int) -> Image.Image:
    height = max(1, int(height))
    width = max(1, int(round(im.width * (height / im.height))))
    return im.resize((width, height), Image.Resampling.LANCZOS)


def render_stage(sprites: dict[str, Image.Image], items: list[tuple], size: tuple[int, int]) -> Image.Image:
    """items: (sprite key, x_frac, y_bottom_frac, h_frac) in stage space."""
    width, height = size
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    shadows = Image.new("RGBA", size, (0, 0, 0, 0))
    placed: list[tuple[Image.Image, int, int]] = []
    for key, xf, yf, hf in items:
        sprite = scale_to_height(sprites[key], hf * height)
        x = int(xf * width - sprite.width / 2)
        y = int(yf * height - sprite.height)
        # Contact shadow, wider than the object and soft.
        sw = int(sprite.width * 0.72)
        sh = max(10, int(sprite.width * 0.14))
        ell = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
        ImageDraw.Draw(ell).ellipse((0, 0, sw - 1, sh - 1), fill=(0, 0, 0, 120))
        ell = ell.filter(ImageFilter.GaussianBlur(radius=max(2, sw // 18)))
        shadows.alpha_composite(ell, (x + (sprite.width - sw) // 2, int(yf * height - sh * 0.45)))
        placed.append((sprite, x, y))
    canvas.alpha_composite(shadows)
    for sprite, x, y in placed:
        canvas.alpha_composite(sprite, (x, y))
    return canvas


def paste_stage(plate: Image.Image, stage: Image.Image) -> Image.Image:
    out = plate.convert("RGBA")
    x, y, w, h = STAGE
    scaled = stage.resize((w, h), Image.Resampling.LANCZOS)
    out.alpha_composite(scaled, (x, y))
    return out.convert("RGB")


def mobile_from_desktop(scene: Image.Image) -> Image.Image:
    """A wide, short crop of the product cluster, matching the live mobile hero frame."""
    # 1674×712 scene. Products sit on the right; mobile is 748×311 (aspect 2.405).
    crop = scene.crop((760, 250, 1640, 616))
    return crop.resize((748, 311), Image.Resampling.LANCZOS)


def flattened(stage: Image.Image, plate: Image.Image) -> Image.Image:
    """The same arrangement, on the gold table, at the product-file width."""
    x, y, w, h = STAGE
    crop = plate.crop((x - 40, y - 10, x + w + 20, min(plate.height, y + h + 70)))
    canvas = Image.new("RGBA", stage.size, (0, 0, 0, 0))
    bg = crop.resize(stage.size, Image.Resampling.LANCZOS).convert("RGBA")
    canvas.alpha_composite(bg)
    canvas.alpha_composite(stage)
    rgb = canvas.convert("RGB")
    if rgb.width != PRODUCT_W:
        rgb = rgb.resize((PRODUCT_W, int(rgb.height * PRODUCT_W / rgb.width)), Image.Resampling.LANCZOS)
    return rgb


# Each item is (sprite, x, bottom-y, height) as fractions of the stage.
OPTIONS: list[dict] = [
    {
        "n": 1,
        "title": "Name tags, Colop dater, blue Trodat 4913, and an Ideal 4926",
        "blurb": "The three self-inkers the shop actually sells, with the two name tags from the current hero kept in front.",
        "sources": [
            "nametags-updated.jpg (Jerry Doughty and Humane Society badges)",
            "stamp-colop-dater.jpg",
            "stamp-blue-4913.jpg",
            "stamp-4926.jpg",
        ],
        "items": [
            ("blue", 0.16, 0.74, 0.50),
            ("s4926", 0.74, 0.72, 0.48),
            ("colop", 0.48, 0.80, 0.68),
            ("jerry", 0.30, 0.97, 0.26),
            ("humane", 0.66, 0.95, 0.24),
        ],
    },
    {
        "n": 2,
        "title": "Name tags, a self-inker, an engraved plate, and a plaque",
        "blurb": "Stamps plus the engraving side of the shop: a brass plate in front of a full-size award plaque.",
        "sources": [
            "nametags-updated.jpg (Molly Hackenwerth and Taylor Sloan badges)",
            "stamp-4911.jpg",
            "plates-3.jpg (Flat Out Speed plate)",
            "plaque-6531.jpg (Don Evans plaque)",
        ],
        "items": [
            ("s4911", 0.15, 0.74, 0.50),
            ("plaque", 0.62, 0.84, 0.58),
            ("molly", 0.22, 0.96, 0.20),
            ("taylor", 0.80, 0.90, 0.18),
            ("speed", 0.46, 0.99, 0.11),
        ],
    },
    {
        "n": 3,
        "title": "Name tags, a self-inker, a glass award, and an embosser",
        "blurb": "A glass award and a seal embosser with a self-inking stamp and name tags.",
        "sources": [
            "nametags-updated.jpg (Jerry Doughty and Taylor Sloan badges)",
            "stamp-4926.jpg",
            "awards-8539.jpg (Shanna Cass glass award)",
            "embosser-basic.jpg",
        ],
        "items": [
            ("s4926", 0.18, 0.74, 0.50),
            ("award", 0.58, 0.82, 0.60),
            ("jerry", 0.30, 0.97, 0.24),
            ("embosser", 0.76, 0.96, 0.26),
            ("taylor", 0.48, 0.96, 0.20),
        ],
    },
    {
        "n": 4,
        "title": "Name tags, a desk sign, an engraved tumbler, and a stamp",
        "blurb": "Metal name bars, the Regency desk sign, a red engraved tumbler, and a blue 4913.",
        "sources": [
            "nametags-police.jpg (Robert Muse and Shryer bars)",
            "signs-standoff-printed-2.jpg (Regency Business Management)",
            "engraved-tumblers.jpg (red Casper Building Co. tumbler)",
            "stamp-blue-4913.jpg",
        ],
        "items": [
            ("blue", 0.14, 0.74, 0.48),
            ("sign", 0.48, 0.78, 0.32),
            ("tumbler", 0.78, 0.80, 0.56),
            ("muse", 0.22, 0.97, 0.13),
            ("shryer", 0.56, 0.98, 0.12),
        ],
    },
    {
        "n": 5,
        "title": "Stamps, name tags, a glass award, and an engraved plate",
        "blurb": "One of everything, still a single cluster: blue 4913, both hero name tags, the glass award, and a brass plate.",
        "sources": [
            "nametags-updated.jpg (Jerry Doughty and Humane Society badges)",
            "stamp-blue-4913.jpg",
            "awards-8539.jpg (Shanna Cass glass award)",
            "plates-1.jpg (Nathanael Greene brass plate)",
        ],
        "items": [
            ("blue", 0.15, 0.74, 0.48),
            ("award", 0.46, 0.80, 0.56),
            ("jerry", 0.28, 0.97, 0.24),
            ("humane", 0.50, 0.95, 0.20),
            ("greene", 0.76, 0.92, 0.22),
        ],
    },
]


def main() -> None:
    print("removing backgrounds…", flush=True)
    session = new_session("u2net")
    sprites = load_sprites(session)
    print("painting the table…", flush=True)
    plate = Image.fromarray(build_plate())
    stage_w, stage_h = PRODUCT_W, int(PRODUCT_W * STAGE[3] / STAGE[2])

    for opt in OPTIONS:
        n = opt["n"]
        dest = OUT / f"option-{n}"
        dest.mkdir(parents=True, exist_ok=True)
        stage = render_stage(sprites, opt["items"], (stage_w, stage_h))
        # Trim fully transparent margins on the sides but keep the ground line.
        stage.save(dest / "hero-product.png")
        flat = flattened(stage, plate)
        flat.save(dest / "hero-product.jpg", quality=90, optimize=True)
        scene = paste_stage(plate, stage)
        scene.save(dest / "scene-desktop.jpg", quality=90, optimize=True)
        mobile_from_desktop(scene).save(dest / "scene-mobile.jpg", quality=90, optimize=True)
        print(f"option {n}: {dest.relative_to(ROOT)}", flush=True)


if __name__ == "__main__":
    sys.exit(main())
