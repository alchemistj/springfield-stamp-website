// Build-time helpers that turn a file in src/assets into a data URI (used for the inline hero
// photo and the inline header logo, per the first-frame SOP). Runs in Node during `astro build` only.
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const cache = new Map<string, Promise<InlineImage>>();

export interface InlineImage {
  uri: string;
  bytes: number;
  width: number;
  height: number;
  mime: string;
}

const assetPath = (file: string): string =>
  file.startsWith("docs/") ? path.resolve(process.cwd(), file) : path.resolve(process.cwd(), "src/assets", file);

export interface HeroOptions {
  /** Output width in CSS px x1 (the file is never upscaled). */
  width: number;
  /** AVIF quality 1-100. */
  quality?: number;
  /** Crop to this aspect ratio (w/h) from the centre before resizing; keeps bytes down for fixed-height bands. */
  cropAspect?: number;
  /** Vertical position of the crop window when `cropAspect` is set: 0 = top, 1 = bottom (default 0.5). */
  cropY?: number;
  /** Horizontal position of the crop window when `cropAspect` is narrower than the source: 0 = left, 1 = right (default 0.5). */
  cropX?: number;
  /** Keep the transparent pixels and skip chroma subsampling. Used for the product cut-out. */
  alpha?: boolean;
}

/** AVIF data URI for a hero photo. One format only (AVIF), no fallback, per the SOP. */
export function heroImage(file: string, opts: HeroOptions): Promise<InlineImage> {
  const key = `hero:${file}:${JSON.stringify(opts)}`;
  let hit = cache.get(key);
  if (!hit) {
    hit = (async () => {
      const input = await readFile(assetPath(file));
      let img = sharp(input);
      const meta = await img.metadata();
      const srcW = meta.width ?? opts.width;
      const srcH = meta.height ?? opts.width;
      if (opts.cropAspect) {
        const wantH = Math.round(srcW / opts.cropAspect);
        if (wantH < srcH) {
          const top = Math.round((srcH - wantH) * (opts.cropY ?? 0.5));
          img = img.extract({ left: 0, top, width: srcW, height: wantH });
        } else if (wantH > srcH) {
          const wantW = Math.round(srcH * opts.cropAspect);
          const left = Math.round((srcW - wantW) * (opts.cropX ?? 0.5));
          img = img.extract({ left, top: 0, width: wantW, height: srcH });
        }
      }
      const out = await img
        .resize({ width: Math.min(opts.width, srcW), withoutEnlargement: true })
        .avif({ quality: opts.quality ?? 45, effort: 9, chromaSubsampling: opts.alpha ? "4:4:4" : "4:2:0" })
        .toBuffer({ resolveWithObject: true });
      return {
        uri: `data:image/avif;base64,${out.data.toString("base64")}`,
        bytes: out.data.length,
        width: out.info.width,
        height: out.info.height,
        mime: "image/avif",
      };
    })();
    cache.set(key, hit);
  }
  return hit;
}

/** Palette PNG data URI for a small logo (kept at or under about 4 KB). Transparent background preserved. */
export function logoImage(file: string, width: number, colors = 6): Promise<InlineImage> {
  const key = `logo:${file}:${width}:${colors}`;
  let hit = cache.get(key);
  if (!hit) {
    hit = (async () => {
      const input = await readFile(assetPath(file));
      const out = await sharp(input)
        .resize({ width })
        .png({ palette: true, colors, compressionLevel: 9, effort: 10 })
        .toBuffer({ resolveWithObject: true });
      return {
        uri: `data:image/png;base64,${out.data.toString("base64")}`,
        bytes: out.data.length,
        width: out.info.width,
        height: out.info.height,
        mime: "image/png",
      };
    })();
    cache.set(key, hit);
  }
  return hit;
}
