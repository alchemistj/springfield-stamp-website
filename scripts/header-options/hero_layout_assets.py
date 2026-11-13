#!/usr/bin/env python3
"""Homepage hero layers: storefront with the products removed, and the product group."""

from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "src/assets/home-hero.jpg"
PREVIEW = Path("/tmp/hero-preview")

# Photographed disc, extended past the right edge of the frame.
CX, CY, RX, RY = 1290, 598, 500, 108


def gold_mask(src: np.ndarray) -> np.ndarray:
    r, g, b = [src[:, :, i].astype(np.int16) for i in range(3)]
    lum = src.astype(np.float32).mean(2)
    yy, xx = np.indices(src.shape[:2])
    gold = (
        (r > 120)
        & (g > 90)
        & (b < 210)
        & (r > b + 15)
        & (g > b + 4)
        & (np.abs(r - g) < 80)
        & (yy > 450)
        & (xx > 800)
        & (lum > 65)
    )
    u8 = gold.astype(np.uint8) * 255
    n, labels, stats, _ = cv2.connectedComponentsWithStats(u8, 8)
    if n <= 1:
        return gold
    main = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    return labels == main


def product_mask(src: np.ndarray) -> np.ndarray:
    r, g, b = [src[:, :, i].astype(np.int16) for i in range(3)]
    lum = src.astype(np.float32).mean(2)
    sat = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
    yy, xx = np.indices(src.shape[:2])
    zone = (xx >= 1060) & (xx <= 1655) & (yy >= 340) & (yy <= 700)
    # The pale facade on the far right is not a product.
    wall = ((lum < 80) & (sat < 30)) | ((sat < 18) & (xx > 1580) & (yy < 560))
    fg = (zone & ~wall).astype(np.uint8) * 255
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    contours, _ = cv2.findContours(fg, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    filled = np.zeros_like(fg)
    for c in contours:
        if cv2.contourArea(c) > 700:
            cv2.drawContours(filled, [c], -1, 255, -1)
    return filled.astype(bool)


def ellipse(h: int, w: int) -> np.ndarray:
    yy, xx = np.indices((h, w))
    return ((xx - CX) / RX) ** 2 + ((yy - CY) / RY) ** 2 <= 1


def checker(im: Image.Image) -> Image.Image:
    tile = Image.new("RGB", (24, 24), (200, 200, 200))
    d = Image.new("RGB", (12, 12), (60, 60, 60))
    tile.paste(d, (0, 0))
    tile.paste(d, (12, 12))
    board = Image.new("RGB", im.size)
    for y in range(0, im.size[1], 24):
        for x in range(0, im.size[0], 24):
            board.paste(tile, (x, y))
    out = board.convert("RGBA")
    out.alpha_composite(im)
    return out.convert("RGB")


def main() -> None:
    PREVIEW.mkdir(parents=True, exist_ok=True)
    src = np.array(Image.open(SRC).convert("RGB"))
    h, w = src.shape[:2]
    gold = gold_mask(src)
    products = product_mask(src)
    yy, xx = np.indices((h, w))

    canvas_w = CX + RX + 8
    canvas = np.zeros((h, canvas_w, 4), np.uint8)
    oval = ellipse(h, canvas_w)

    # Gold texture: spread the real gold colour, then keep the real pixels on top.
    texture = src.astype(np.float32)
    # Pad texture to the canvas by clamping the rightmost column.
    tex = np.zeros((h, canvas_w, 3), np.float32)
    tex[:, :w] = texture
    tex[:, w:] = texture[:, w - 1 : w]
    gold_pad = np.zeros((h, canvas_w), bool)
    gold_pad[:, :w] = gold
    for _ in range(10):
        blurred = cv2.GaussianBlur(tex, (0, 0), 7)
        tex = np.where(gold_pad[:, :, None], tex, blurred)
    tex = np.clip(tex, 0, 255)

    # Disc alpha follows the oval only where the real table is, plus a short
    # cap past the frame so the right side is round instead of sliced.
    dist = cv2.distanceTransform((~gold_pad).astype(np.uint8), cv2.DIST_L2, 5)
    cap = oval & (np.arange(canvas_w)[None, :] >= w - 8)
    table = oval & ((dist <= 28) | cap)
    canvas[:, :, :3] = tex.astype(np.uint8)
    canvas[:, :, 3] = np.where(table, 255, 0).astype(np.uint8)
    real = table[:, :w] & gold
    canvas[:, :w, :3][real] = src[real]

    # Products sit on top of the disc, including the parts that rise above it.
    canvas[:, :w, :3][products] = src[products]
    canvas[:, :w, 3][products] = 255

    hard = canvas[:, :, 3] == 255
    soft = np.array(Image.fromarray(canvas[:, :, 3], "L").filter(ImageFilter.GaussianBlur(radius=1.1)))
    core = cv2.erode(hard.astype(np.uint8) * 255, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))).astype(bool)
    canvas[:, :, 3] = np.where(core, 255, soft).astype(np.uint8)

    ys, xs = np.where(canvas[:, :, 3] > 20)
    pad = 2
    crop = canvas[max(0, ys.min() - pad) : ys.max() + 1 + pad, max(0, xs.min() - pad) : xs.max() + 1 + pad]
    cut = Image.fromarray(crop, "RGBA")
    cut.save(PREVIEW / "cutout.png")
    checker(cut).save(PREVIEW / "cutout-checker.jpg", quality=90)
    print("cutout", cut.size)

    # Background: lift the products and the gold off, and fill with the dark wall.
    r, g, b = [src[:, :, i].astype(np.int16) for i in range(3)]
    lum = src.astype(np.float32).mean(2)
    glow = (r > 150) & (g > 120) & (b < 150) & (r > b + 30) & (lum > 90) & (yy > 470) & (xx > 860)
    remove = (gold | products) | glow
    # One smooth stage, not a silhouette of each product.
    pts = cv2.findNonZero(remove.astype(np.uint8) * 255)
    hull = cv2.convexHull(pts)
    stage = np.zeros(remove.shape, np.uint8)
    cv2.fillConvexPoly(stage, hull, 255)
    remove = cv2.dilate(stage, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (21, 15))).astype(bool)
    # Keep the OPEN neon. The gold glow in front of it still has to go.
    red_neon = (r > g + 25) & (r > b + 25) & (yy < 510) & (xx < 1100)
    left_glow = (xx > 860) & (xx < 1120) & (yy > 465) & (yy < 660) & ~red_neon
    remove |= left_glow
    open_sign = (xx < 1040) & (yy < 470) & ~gold & ~glow
    remove &= ~open_sign & (yy > 330)

    # Continue each column's own wall colour down through the hole, then blur.
    painted = src.copy()
    for x in range(w):
        ys_m = np.flatnonzero(remove[:, x])
        if ys_m.size == 0:
            continue
        src_y = int(ys_m.min()) - 4
        while src_y > 0 and remove[src_y, x]:
            src_y -= 1
        painted[ys_m, x] = src[max(0, src_y), x]
    blurred = cv2.GaussianBlur(painted, (0, 0), 6)
    feather = np.clip(cv2.GaussianBlur(remove.astype(np.float32), (0, 0), 8), 0, 1)[..., None]
    out = np.clip(src.astype(np.float32) * (1 - feather) + blurred.astype(np.float32) * feather, 0, 255).astype(np.uint8)
    Image.fromarray(out).save(PREVIEW / "bg.jpg", quality=92)
    Image.fromarray(out).save(ROOT / "src/assets/home-hero-bg.jpg", quality=90)
    cut.save(ROOT / "src/assets/home-hero-products.png")

    plate = Image.fromarray(out).convert("RGBA")
    px = min(w - 20, max(0, (w - cut.size[0]) // 2 + 200))
    py = max(0, (h - cut.size[1]) // 2 - 20)
    plate.alpha_composite(cut, (px, py))
    plate.convert("RGB").save(PREVIEW / "composite.jpg", quality=90)
    print("canvas", canvas_w, "remove", int(remove.sum()))


if __name__ == "__main__":
    main()
