// Pictures used only by the home page (live desktop mapping, used at every width).
import customStamps from "../assets/custom-stamps-2026.jpg";
import magneticNameTags from "../assets/springfield-stamp-name-tags.jpg";
import deskNamePlates from "../assets/desk-name-plate.webp";
import signs from "../assets/signs.jpg";
import awardsPlaques from "../assets/awards-plaques.jpg";
import notaryEmbosser from "../assets/notary-embosser.jpg";
import breakTheIce from "../assets/break-the-ice.png";
import enhance from "../assets/enhance.png";
import boostBrand from "../assets/boost-brand.png";
import aboutStorefront from "../assets/springfield-stamp-about.jpeg";

export const homeProductImages = {
  customStamps,
  magneticNameTags,
  signs,
  deskNamePlates,
  awardsPlaques,
  notaryEmbosser,
} as const;

export const homeIcons = { breakTheIce, enhance, boostBrand } as const;

export { aboutStorefront };
