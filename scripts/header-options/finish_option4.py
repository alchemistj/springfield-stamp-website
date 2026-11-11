#!/usr/bin/env python3
"""Seat Option 4 on the original glossy gold table and write the desktop hero.

Option 4 is the one Josh picked: Robert Muse and Shryer name bars, the Regency
desk sign, the red Casper tumbler, and the blue Trodat Printy 4913.

The photographed table and the storefront stay. Old products are removed by
continuing the real wall and the real gold into the holes they covered. Nothing
here is a newly drawn ellipse. The mobile hero was approved separately and this
script does not rewrite it.
"""

from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from rembg import new_session, remove
from scipy.ndimage import distance_transform_edt, gaussian_filter1d, maximum_filter1d

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_options import cut, cut_tumbler, scale_to_height  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
HERO = ROOT / "src" / "assets" / "springfield-stamps4.jpg"
OUT = ROOT / "docs" / "header-options" / "option-4"
DESKTOP_ASSET = ROOT / "src" / "assets" / "home-hero.jpg"


def _channels(src: np.ndarray):
    r, g, b = [src[:, :, i].astype(np.int16) for i in range(3)]
    yy, xx = np.indices(src.shape[:2])
    lum = src.astype(np.float32).mean(2)
    return r, g, b, yy, xx, lum


def _gold_mask(src: np.ndarray) -> np.ndarray:
    """The photographed table only. Cream name tags and white stamps are not gold."""
    r, g, b, yy, xx, lum = _channels(src)
    gold = (
        (r > 140) & (g > 110) & (b < 155) & (r > b + 40) & (g > b + 25)
        & (np.abs(r - g) < 40) & (yy > 470) & (xx > 860) & (lum > 90) & (lum < 235)
    )
    n, labels, stats, _ = cv2.connectedComponentsWithStats(gold.astype(np.uint8), 8)
    if n <= 1:
        return gold
    main = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    return labels == main


def _rim_bottom(gold: np.ndarray) -> np.ndarray:
    """Smooth lower edge of the real table, ignoring dips where a product covers the rim."""
    h, w = gold.shape
    ymax = np.full(w, np.nan)
    for x in range(w):
        ys = np.flatnonzero(gold[:, x])
        if ys.size >= 8:
            ymax[x] = float(ys.max())
    known = np.flatnonzero(~np.isnan(ymax))
    curve = np.interp(np.arange(w), known, ymax[known])
    return gaussian_filter1d(maximum_filter1d(curve, 90), 14)


def _product_mask(src: np.ndarray, alpha: np.ndarray, gold: np.ndarray, env: np.ndarray) -> np.ndarray:
    """Old products only. Sign letters, the yellow word, and the gold table stay."""
    r, g, b, yy, xx, lum = _channels(src)
    h, w = gold.shape
    # Dark maroon channel letters. Bright red product caps are a higher red and sit lower.
    sign = (
        (r > g + 4) & (r > b + 4) & (r > 14) & (r < 110) & (g < 70)
        & (yy > 145) & (yy < 308) & (xx > 480)
    )
    yellow = (r > 160) & (g > 120) & (b < 95) & (g > b + 30) & (yy > 255) & (yy < 365) & (xx < 1280)

    raw = ((alpha > 12) & (xx > 860) & (yy > 145)).astype(np.uint8)
    closed = cv2.morphologyEx(raw, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19)))
    n, labels, stats, _ = cv2.connectedComponentsWithStats(closed, 8)
    mask = np.zeros((h, w), bool)
    for i in range(1, n):
        x, y, ww, hh, area = stats[i]
        if area < 400 or (y < 175 and x > 1500 and hh < 65):
            continue
        mask[labels == i] = True
    # The open frame of the big stamp is thin and dark, so the cutout misses it.
    near = cv2.dilate(mask.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13))).astype(bool)
    mask |= near & (lum < 36) & (yy > 165) & (yy < 430) & (xx > 1180) & ~sign
    cap = (yy > 155) & (yy < 300) & (xx > 1480) & (xx < 1665)
    wallish = (np.abs(r - g) < 12) & (np.abs(g.astype(int) - b) < 14) & (lum > 40) & (lum < 88)
    mask |= cap & ~wallish & ~sign
    dist = distance_transform_edt(~gold)
    # Name tags and the other pieces sitting on the gold, just above the visible metal.
    mask |= (dist < 58) & (yy <= env[xx] + 2) & (yy > 488) & (xx > 870) & ~gold & (lum > 22)
    mask[sign | yellow | gold] = False
    mask[:140, :] = False
    mask[:, :860] = False
    return mask, sign, yellow, dist


def _continue_rows(src: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """Fill each hole from the real pixels to its left and right on the same row."""
    out = src.copy()
    for y in np.flatnonzero(mask.any(1)):
        hole = mask[y]
        known = np.flatnonzero(~hole)
        if known.size == 0:
            continue
        xs = np.flatnonzero(hole)
        idx = np.searchsorted(known, xs)
        left = known[np.clip(idx - 1, 0, known.size - 1)]
        right = known[np.clip(idx, 0, known.size - 1)]
        dl = (xs - left).astype(np.float32)
        dr = (right - xs).astype(np.float32)
        both = (dl < 1100) & (dr < 1100)
        out[y, xs] = src[y, np.where(dl <= dr, left, right)]
        if both.any():
            t = (dl[both] / np.maximum(dl[both] + dr[both], 1))[:, None]
            mixed = src[y, left[both]].astype(np.float32) * (1 - t) + src[y, right[both]].astype(np.float32) * t
            out[y, xs[both]] = np.clip(mixed, 0, 255).astype(np.uint8)
    return out


def clean_plate(src: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    """Remove the old hero products. Keep the photographed gold and the storefront."""
    gold = _gold_mask(src)
    env = _rim_bottom(gold)
    mask, sign, yellow, dist = _product_mask(src, alpha, gold, env)
    wall = _continue_rows(src, mask)
    # Soften row steps in the repaired wall. Letters and gold are put back after.
    vert = cv2.GaussianBlur(wall, (1, 35), 0)
    wall[mask] = (wall[mask].astype(np.float32) * 0.22 + vert[mask].astype(np.float32) * 0.78).astype(np.uint8)
    keep = gold | sign | yellow
    wall[keep] = src[keep]

    _, inds = distance_transform_edt(~gold, return_indices=True)
    field = src[inds[0], inds[1]].astype(np.float32)
    for _ in range(2):
        field = cv2.GaussianBlur(field, (0, 0), 1.8)
        field[gold] = src[gold]
    yy = np.indices(gold.shape)[0]
    on = mask & (dist < 64) & (yy <= env[np.arange(gold.shape[1])] + 2) & (yy > 485)
    band = np.clip(cv2.GaussianBlur(on.astype(np.float32), (0, 0), 11) * 1.8, 0, 1)
    band[yy > env[np.arange(gold.shape[1])]] = 0
    band[keep] = 0
    out = np.clip(wall.astype(np.float32) * (1 - band[..., None]) + field * band[..., None], 0, 255).astype(np.uint8)
    out[keep] = src[keep]
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


def main() -> None:
    print("cutting products…", flush=True)
    session = new_session("u2net")
    src = np.array(Image.open(HERO).convert("RGB"))
    alpha = np.array(remove(Image.fromarray(src), session=session))[:, :, 3]
    sprites = {
        "blue": cut(session, "stamp-blue-4913.jpg", erode=1),
        "sign": cut(session, "signs-standoff-printed-2.jpg", erode=1),
        "tumbler": cut_tumbler(session, 2),
        "muse": cut(session, "nametags-police.jpg", (280, 560, 780, 780), erode=1),
        "shryer": cut(session, "nametags-police.jpg", (300, 760, 880, 1000), erode=1),
    }
    for key, im in sprites.items():
        print(f"  {key} {im.size}", flush=True)
    print("clearing the old products…", flush=True)
    scene = layout(Image.fromarray(clean_plate(src, alpha)), sprites)
    OUT.mkdir(parents=True, exist_ok=True)
    scene.save(OUT / "final-scene-desktop.jpg", quality=92, optimize=True)
    scene.save(DESKTOP_ASSET, quality=92, optimize=True)
    print("wrote", DESKTOP_ASSET.name, flush=True)


if __name__ == "__main__":
    main()
