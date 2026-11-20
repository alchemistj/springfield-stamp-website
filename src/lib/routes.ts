// Route registry: the single list of pages. The sitemap, robots, llms.txt, nav checks,
// vercel.json checks and tests all read from it. Add a page here first.
//
// Titles and descriptions are COPY 6 in docs/SPEC-audit-punch-list.md. og:title and
// og:description use the same strings. Visible H1 text is unchanged; CSS uppercases it.
import { SITE_URL } from "../data/site";

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
    title: "Custom Stamps & Name Tags in Springfield, MO | Springfield Stamp",
    description:
      "Family-owned Springfield, MO shop for custom stamps, name tags, signs, name plates and awards. Friendly service and fast turnaround.",
    h1: "Springfield Stamp: Your Trusted Partner for Custom Products",
    name: "Home",
    ogType: "website",
    priority: 1,
    photoHero: true,
  },
  {
    key: "custom-stamps",
    path: "/custom-stamps/",
    title: "Custom Stamps in Springfield, MO | Springfield Stamp & Engraving",
    description:
      "Self-inking, signature, logo and dater stamps, custom made in Springfield, MO. Friendly service and fast turnaround. Call (417) 881-8828 to get started.",
    h1: "Your Friendly Neighborhood CUSTOM STAMP Experts!",
    name: "Custom Stamps",
    ogType: "article",
    priority: 0.8,
    photoHero: true,
  },
  {
    key: "missouri-notary-stamp",
    path: "/missouri-notary-stamp/",
    title: "Missouri Notary Stamps in Springfield, MO | Springfield Stamp",
    description:
      "Missouri notary stamps and embossers from Springfield Stamp & Engraving in Springfield, MO. Call (417) 881-8828 or email to order.",
    h1: "Your One-Stop Spot for Missouri Notary Stamps",
    name: "Missouri Notary Stamp",
    ogType: "article",
    priority: 0.8,
    photoHero: true,
  },
  {
    key: "magnetic-name-tags",
    path: "/magnetic-name-tags/",
    title: "Magnetic Name Tags in Springfield, MO | Springfield Stamp",
    description:
      "Classic, logo, engraved, full-color and photo magnetic name tags in Springfield, MO. Friendly, fast service. Call (417) 881-8828 to start your order.",
    h1: "MAGNETIC NAME TAGS that Make Connections Count!",
    name: "Magnetic Name Tags",
    ogType: "article",
    priority: 0.8,
    photoHero: true,
  },
  {
    key: "about",
    path: "/about/",
    title: "About Springfield Stamp | Family-Owned in Springfield, MO",
    description:
      "Meet Adam and Bri, the family owners of Springfield Stamp & Engraving in Springfield, MO. Friendly service, careful work and quick turnaround.",
    h1: "Springfield Stamp",
    name: "About",
    ogType: "article",
    priority: 0.6,
    photoHero: true,
  },
  {
    key: "contact",
    path: "/contact/",
    title: "Contact Springfield Stamp & Engraving | Springfield, MO",
    description:
      "Visit Springfield Stamp & Engraving at 1416 S. Glenstone Ave., Springfield, MO. Open Monday through Friday, 8:00am to 4:30pm. Call (417) 881-8828.",
    h1: "Contact Us",
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
