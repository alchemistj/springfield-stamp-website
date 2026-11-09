// Above-the-fold faces, inlined as data URIs so the first frame does not wait on a font file.
// Hoarse Rough is the subset from `scripts/fonts/subset-display.mjs`. Poppins 400–700 are the
// weights used in the header and hero. Muli stays a separate file (see global.css).
import { readFileSync } from "node:fs";
import path from "node:path";

const fontsDir = path.join(process.cwd(), "src/assets/fonts");

function face(family: string, weight: number, file: string): string {
  const bytes = readFileSync(path.join(fontsDir, file));
  const uri = `data:font/woff2;base64,${bytes.toString("base64")}`;
  return `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};font-display:block;src:url("${uri}") format("woff2");}`;
}

/** CSS for the inlined above-the-fold faces. `font-display: block` on these faces only. */
export function atfFontCss(): string {
  return [
    face("Hoarse Rough 02", 400, "hoarse-rough-02-subset.woff2"),
    face("Poppins", 400, "poppins-400.woff2"),
    face("Poppins", 500, "poppins-500.woff2"),
    face("Poppins", 600, "poppins-600.woff2"),
    face("Poppins", 700, "poppins-700.woff2"),
  ].join("\n");
}
