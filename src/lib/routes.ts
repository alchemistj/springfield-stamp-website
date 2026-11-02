// Route registry: the single list of pages. The sitemap, robots, llms.txt, nav checks,
// vercel.json checks and tests all read from it. Add a page here first.
//
// Titles and descriptions are the live site's, with the spec's copy fixes ("60 years" -> "50 years").
// Contact had no meta description on the live site; the one below is the spec's.
import { site, SITE_URL } from "../data/site";

export interface Route {
  /** Stable key, used by components and tests. */
  key: "home" | "custom-stamps" | "missouri-notary-stamp" | "magnetic-name-tags" | "about" | "contact";
  /** URL path with leading and trailing slash. */
  path: string;
  /** `<title>` and og:title. */
  title: string;
  /** Meta description and og:description. */
  description: string;
  /** Visible H1 text (one per page). */
  h1: string;
  /** Name used in BreadcrumbList and llms.txt. */
  name: string;
  /** Live site's og:type. */
  ogType: "website" | "article";
  /** sitemap priority. */
  priority: number;
  /** True when the page has a photo hero that must be inlined photo-first (SOP section 2). */
  photoHero: boolean;
}

export const routes: readonly Route[] = [
  {
    key: "home",
    path: "/",
    title: "Springfield Stamp & Engraving in Springfield Missouri",
    description:
      "High-quality custom stamps, name tags, awards & more. Fast turnaround, friendly service & expert advice. Family-owned, 50+ years experience.",
    h1: "Springfield Stamp: Your Trusted Partner for Custom Products",
    name: "Home",
    ogType: "website",
    priority: 1,
    photoHero: true,
  },
  {
    key: "custom-stamps",
    path: "/custom-stamps/",
    title: "Get Your Custom Rubber Stamps Fast!",
    description:
      "Springfield Stamps: your best custom stamp source. Get self-inking, signature, logo, daters & more. Enjoy friendly service, fast turnaround, and top quality.",
    h1: "Your Friendly Neighborhood CUSTOM STAMP Experts!",
    name: "Custom Stamps",
    ogType: "article",
    priority: 0.8,
    photoHero: true,
  },
  {
    key: "missouri-notary-stamp",
    path: "/missouri-notary-stamp/",
    title: "Missouri Notary Stamps and Embossers | Springfield Stamp",
    description:
      "Shop high-quality Missouri notary stamps, seals, embossers, and journals that meet all state requirements. Fast shipping and full compliance guaranteed.",
    h1: "Your One-Stop Spot for Missouri Notary Stamps",
    name: "Missouri Notary Stamp",
    ogType: "article",
    priority: 0.8,
    photoHero: true,
  },
  {
    key: "magnetic-name-tags",
    path: "/magnetic-name-tags/",
    title: "Magnetic Name Tags & Badges Springfield Stamps: Friendly, Fast Service",
    description:
      "Find the perfect magnetic name tags for your business at Springfield Stamps! Customizable, durable, & professional. Shop now & make a lasting impression!",
    h1: "MAGNETIC NAME TAGS that Make Connections Count!",
    name: "Magnetic Name Tags",
    ogType: "article",
    priority: 0.8,
    photoHero: true,
  },
  {
    key: "about",
    path: "/about/",
    title: "Springfield Stamp - Family Tradition & Quality Service",
    description:
      "Discover the 50-year legacy of Springfield Stamp. Family-owned, we pride ourselves on rapid service, meticulous care, and delivering the perfection you need.",
    h1: "Springfield Stamp",
    name: "About",
    ogType: "article",
    priority: 0.6,
    photoHero: true,
  },
  {
    key: "contact",
    path: "/contact/",
    title: "Contact Us",
    description: `Contact Springfield Stamp & Engraving at ${site.address.street}, ${site.address.city}, ${site.address.region}. Call ${site.phone.display} or email ${site.email}.`,
    h1: "CONTACT US",
    name: "Contact Us",
    ogType: "article",
    priority: 0.6,
    photoHero: true,
  },
];

export const routeByKey = (key: Route["key"]): Route => {
  const r = routes.find((x) => x.key === key);
  if (!r) throw new Error(`Unknown route key: ${key}`);
  return r;
};

export const routeByPath = (path: string): Route | undefined => routes.find((x) => x.path === path);

/** Absolute canonical URL (trailing slash) for a route path. */
export const canonicalUrl = (path: string): string => new URL(path, SITE_URL).toString();
