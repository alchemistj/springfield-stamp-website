// Generates the favicon set in public/ from src/assets/cropped-springfield-stamp-favicon.png.
// Usage: node scripts/reference/make-icons.mjs
import sharp from "sharp";
const src = "src/assets/cropped-springfield-stamp-favicon.png";
await sharp(src).resize(48, 48).png({ compressionLevel: 9 }).toFile("public/favicon.png");
await sharp(src).resize(192, 192).png({ compressionLevel: 9 }).toFile("public/favicon-192.png");
await sharp(src).resize(180, 180).png({ compressionLevel: 9 }).toFile("public/apple-touch-icon.png");
await sharp(src).resize(512, 512).png({ compressionLevel: 9 }).toFile("public/favicon-512.png");
