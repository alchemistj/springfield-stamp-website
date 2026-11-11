#!/usr/bin/env python3
"""Seat Option 4 on the original glossy gold table and write the hero photos.

Option 4 is the one Josh picked: Robert Muse and Shryer name bars, the Regency
desk sign, the red Casper tumbler, and the blue Trodat Printy 4913.

The photographic table (highlights and the front rim) is kept. Only the old
products are painted out, using the table's own gold and the wall beside them.
Nothing here is a newly drawn ellipse.
"""

from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from rembg import new_session

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_options import cut, cut_tumbler, scale_to_height  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
HERO = ROOT / "src" / "assets" / "springfield-stamps4.jpg"
OUT = ROOT / "docs" / "header-options" / "option-4"
DESKTOP_ASSET = ROOT / "src" / "assets" / "home-hero.jpg"
MOBILE_ASSET = ROOT / "src" / "assets" / "home-hero-mobile.jpg"


def clean_plate(src: np.ndarray) -> np.ndarray:
    """Remove the old hero products. Keep the photographed gold table."""
    h, w = src.shape[:2]
    r, g, b = [src[:, :, i].astype(np.int16) for i in range(3)]
    yy, xx = np.indices((h, w))
    gold = (
        (r > 150) & (g > 125) & (b < 165) & (r > b + 28) & (g > b + 18)
        & (np.abs(r - g) < 36) & (yy > 500) & (xx > 860)
    )
    letters = (r > 80) & (r > g + 18) & (r > b + 18) & (yy < 250) & (g < 120)

    # Tight boxes around each old product. Padding is background, which the
    # fill below replaces from the real pixels next to the box.
    rects = [
        (860, 290, 340, 250),
        (850, 455, 420, 200),
        (1090, 225, 240, 360),
        (1330, 280, 230, 250),
        (1490, 185, 184, 460),
        (1105, 515, 300, 150),
        (1300, 525, 220, 145),
        (1450, 485, 224, 185),
    ]
    hole = np.zeros((h, w), bool)
    for x, y, ww, hh in rects:
        hole[y : y + hh, x : x + ww] = True
    hole[gold] = False
    hole[letters] = False
    hole[:175, :] = False
    # Leave the photographed front rim alone.
    hole[yy > 635] = False

    out = src.copy()
    # Above the table, continue the wall from the clear column just left of
    # the products, plus the light leak that is already on the right.
    wall_hole = hole & (yy < 500)
    leak_c = np.array([60.0, 58.0, 56.0])
    for y in np.flatnonzero(wall_hole.any(1)):
        holes = np.flatnonzero(wall_hole[y])
        base = src[y, 860:910].mean(axis=0).astype(np.float32)
        lk = np.clip((holes.astype(np.float32) - 1200) / 480.0, 0, 1)
        out[y, holes] = np.clip(base * (1 - lk)[:, None] + leak_c * lk[:, None], 0, 255).astype(np.uint8)

    trusted = gold & ~hole & (xx < 1200)
    med = np.full((h, 3), 180, np.float32)
    has = np.zeros(h, bool)
    for y in range(h):
        xs = np.flatnonzero(trusted[y])
        if xs.size >= 6:
            med[y] = np.median(src[y, xs], axis=0)
            has[y] = True
    known_y = np.flatnonzero(has)
    for y in range(h):
        if not has[y] and known_y.size:
            med[y] = med[known_y[np.argmin(np.abs(known_y - y))]]
    table_hole = hole & (yy >= 500)
    ys, xs = np.where(table_hole)
    right = np.clip((xs.astype(np.float32) - 1050) / 620.0, 0, 1)
    gold_c = med[ys] + right[:, None] * np.array([14.0, 12.0, 6.0])
    # Soften the back edge of the table into the wall instead of a hard cut.
    fade = np.clip((ys.astype(np.float32) - 498) / 48.0, 0, 1)
    wall_c = np.stack([src[y, 860:910].mean(axis=0) for y in ys]).astype(np.float32)
    out[ys, xs] = np.clip(wall_c * (1 - fade)[:, None] + gold_c * fade[:, None], 0, 255).astype(np.uint8)

    blur = cv2.GaussianBlur(out, (0, 0), 1.6)
    out[hole] = (out[hole].astype(np.float32) * 0.35 + blur[hole].astype(np.float32) * 0.65).astype(np.uint8)
    out[gold] = src[gold]
    out[letters] = src[letters]
    return out


def shadow_for(sprite: Image.Image) -> Image.Image:
    sw = max(8, int(sprite.width * 0.7))
    sh = max(6, int(sprite.width * 0.12))
    ell = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    ImageDraw.Draw(ell).ellipse((0, 0, sw - 1, sh - 1), fill=(0, 0, 0, 110))
    return ell.filter(ImageFilter.GaussianBlur(radius=max(2, sw // 16)))


def paste(plate: Image.Image, sprite: Image.Image, cx: int, bottom: int) -> None:
    """Put the sprite's base on the table, with a soft contact shadow."""
    sh = shadow_for(sprite)
    sx = cx - sh.width // 2
    sy = bottom - int(sh.height * 0.35)
    plate.alpha_composite(sh, (sx, sy))
    plate.alpha_composite(sprite, (cx - sprite.width // 2, bottom - sprite.height))


def layout(plate: Image.Image, sprites: dict[str, Image.Image]) -> Image.Image:
    """Desktop arrangement. Bottoms sit on the photographed table surface."""
    canvas = plate.convert("RGBA")
    # Back row, bases on the gold surface (around y=600). Front bars lower, on the near rim.
    items = [
        ("blue", 1165, 608, 220),
        ("sign", 1375, 612, 138),
        ("tumbler", 1535, 606, 245),
        ("muse", 1245, 652, 50),
        ("shryer", 1455, 656, 44),
    ]
    for key, cx, bottom, height in items:
        paste(canvas, scale_to_height(sprites[key], height), cx, bottom)
    return canvas.convert("RGB")


def mobile_from(scene: Image.Image) -> Image.Image:
    """A short, wide frame of the same table. All four products stay in the middle,
    which is what the live hero shows at object-position 32%."""
    # 794×330, the same aspect as the 748×311 mobile hero.
    crop = scene.crop((880, 328, 1674, 658))
    return crop.resize((748, 311), Image.Resampling.LANCZOS)


def main() -> None:
    print("cutting products…", flush=True)
    session = new_session("u2net")
    sprites = {
        "blue": cut(session, "stamp-blue-4913.jpg", erode=1),
        "sign": cut(session, "signs-standoff-printed-2.jpg", erode=1),
        "tumbler": cut_tumbler(session, 2),
        "muse": cut(session, "nametags-police.jpg", (280, 560, 780, 780), erode=1),
        "shryer": cut(session, "nametags-police.jpg", (300, 760, 880, 1000), erode=1),
    }
    for k, im in sprites.items():
        print(f"  {k} {im.size}", flush=True)
    print("clearing the old products…", flush=True)
    plate = Image.fromarray(clean_plate(np.array(Image.open(HERO).convert("RGB"))))
    scene = layout(plate, sprites)
    OUT.mkdir(parents=True, exist_ok=True)
    scene.save(OUT / "final-scene-desktop.jpg", quality=92, optimize=True)
    mobile_from(scene).save(OUT / "final-scene-mobile.jpg", quality=92, optimize=True)
    scene.save(DESKTOP_ASSET, quality=92, optimize=True)
    mobile_from(scene).save(MOBILE_ASSET, quality=92, optimize=True)
    print("wrote", DESKTOP_ASSET.name, MOBILE_ASSET.name, flush=True)


if __name__ == "__main__":
    main()
