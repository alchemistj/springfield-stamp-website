// Images. Every picture on the site lives in src/assets/ (downloaded from the old WordPress
// /wp-content/uploads/) and is optimized at build by astro:assets (AVIF and WebP, own domain).
//
// Import what a page needs directly (`import x from "../assets/x.jpg"`), NOT through a barrel:
// Vite emits every imported asset, so a barrel would ship unused originals on every page.
// File names are the originals, lowercased, underscores turned into hyphens, year folders dropped.
//
// Inventory (file: where the live site used it)
//   Shared: springfield-stamp-logo-black.png (header logo, inlined by Header.astro), springfield-stamp-logo-white.png (footer),
//     cropped-springfield-stamp-favicon.png (favicon source), springfield-stamp-testimonial.png (yellow quote mark, Testimonial.astro)
//   Home: home-hero.jpg + home-hero-mobile.jpg (hero, inlined as AVIF), custom-stamps-2026.jpg, signs.jpg, awards-plaques.jpg, notary-embosser.jpg (client photos, home rows),
//     springfield-stamps4.jpg (contact hero), springfield-stamps-mobile.jpg (notary journal photo),
//     springfield-logo-magnetic-tags-2.png, springfield-stamp-logo-stamp-2.png (home "Self-Inking Stamps" row; also Custom Stamps "Logo Stamps"),
//     desk-name-plate.webp, springfield-stamp-4913.jpg (Custom Stamps notary),
//     break-the-ice.png, enhance.png, boost-brand.png (Why Do Business icons), springfield-stamp-about.jpeg (storefront)
//   Custom Stamps: springfield-stamp-custom-stamps-2.jpg (hero, 2300x782), custom-stamp-mobile.jpg (mobile hero, 339x533),
//     springfield-stamps-premium.png (og + hero cut-out), springfield-stamp-ideal-line.jpg, springfield-stamp-maxlight.jpg,
//     springfield-stamp-daters-inks.jpg, make-your-mark-2.jpg (900x621), make-your-mark-wide.jpg (1650x635),
//     springfield-cs-grey.png, springfield-turnaround.png, stamp-grey.png, community-1.png (why-choose icons)
//   Magnetic Name Tags: springfield-name-tags-hero1.png (1280x435), springfield-stamp-nametags2.jpg (1920x653), springfield-prof-nametags2.png,
//     magnetic-name-tag-mobile.jpg (333x618), springfield-magnetic-tags.jpg (og), springfield-logo-magnetic-tags.jpg,
//     springfield-engraved-magnetic-tags.jpg, springfield-full-color-magnetic-tags3.jpg, photo-name-tags.png, magnetic-tags-4.png,
//     springfield-stamp-name-tags.jpg, springfield-stamp-tablet.jpg, break-the-ice.png, boost-brand.png, promote.png, improve.png,
//     enhance.png (benefit icons), plus the four why-choose icons above
//   Missouri Notary: springfield-hero-notary-stamps-1.png (1280x435), springfield-stamps-0522.png (1280x435),
//     springfield-stamps-rectangular.jpg (og), springfield-stamps-circular.jpg, springfield-stamps-notary-embosser.jpg
//   About: springfield-stamp-hero-about3.jpg (1920x430), team-top-img-6.jpg (Thrive stock, 1920x650)
//   Contact: call-us-springfield-stamp.jpg (og, 700x413), springfield-stamp-arrow1.png, springfield-stamp-arrow2.png (540x540)
//   springfield-hero-2.png (1920x653) appears in the live CSS only; check the page before using it.
//
// NOTE the live file names are sometimes swapped against the pictures: springfield-stamp-logo-stamp-2.png shows the
// round IDEAL 5000 (home "Self-Inking Stamps"). Go by what the picture shows.
import homeLogoStamp from "../assets/springfield-stamp-logo-stamp-2.png";
import customPremium from "../assets/springfield-stamps-premium.png";
import notaryRectangular from "../assets/springfield-stamps-rectangular.jpg";
import magneticTags from "../assets/springfield-magnetic-tags.jpg";
import callUs from "../assets/call-us-springfield-stamp.jpg";
import type { ImageMetadata } from "astro";
import type { Route } from "./routes";

/** og:image per route key (the live site's og:image; About had none, so it reuses the home one). */
export const ogImages: Record<Route["key"], ImageMetadata> = {
  home: homeLogoStamp,
  "custom-stamps": customPremium,
  "missouri-notary-stamp": notaryRectangular,
  "magnetic-name-tags": magneticTags,
  about: homeLogoStamp,
  contact: callUs,
};
