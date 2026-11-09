// Pictures used only by the home page (live desktop mapping, used at every width).
import customStamps from "../assets/self-inking-stamps.jpg";
import magneticNameTags from "../assets/springfield-logo-magnetic-tags-2.png";
import deskNamePlates from "../assets/desk-name-plate.webp";
import acrylicAwards from "../assets/acrylic-awards.webp";
import notaryStamps from "../assets/springfield-stamp-4913.jpg";
import breakTheIce from "../assets/break-the-ice.png";
import enhance from "../assets/enhance.png";
import boostBrand from "../assets/boost-brand.png";
import aboutStorefront from "../assets/springfield-stamp-about.jpeg";

export const homeProductImages = {
  customStamps,
  magneticNameTags,
  deskNamePlates,
  acrylicAwards,
  notaryStamps,
} as const;

export const homeIcons = { breakTheIce, enhance, boostBrand } as const;

export { aboutStorefront };
