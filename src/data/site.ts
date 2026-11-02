// One business config: NAP, hours, social, header and footer copy.
// The only phone number on the site is `phone` below (spec: "Only this phone number appears anywhere").

export const SITE_URL = "https://www.springfieldstamp.com";

export const site = {
  name: "Springfield Stamp",
  legalName: "Springfield Stamp & Engraving, Inc.",
  tagline: "SpringField Stamp and Engraving",
  url: SITE_URL,
  phone: {
    display: "(417) 881-8828",
    footer: "417-881-8828",
    tel: "tel:+14178818828",
    e164: "+14178818828",
  },
  email: "orders@springfieldstamp.com",
  address: {
    street: "1416 S. Glenstone Ave.",
    city: "Springfield",
    region: "MO",
    postalCode: "65804",
    country: "US",
    /** Footer / body format: `1416 S. Glenstone Ave., Springfield, MO 65804` */
    oneLine: "1416 S. Glenstone Ave., Springfield, MO 65804",
  },
  geo: { latitude: 37.1883738, longitude: -93.2618564 },
  hours: {
    /** Contact page text, as shown on the live site. */
    days: "Mon- Fri",
    times: "8:00am - 4:30pm",
    /** schema.org openingHours */
    schema: "Mo-Fr 08:00-16:30",
  },
  facebook: "https://www.facebook.com/SpringfieldStamp",
  banner: "1-Day Service!",
} as const;

/** Header nav, in live-site order. Paths come from the route registry (`src/lib/routes.ts`). */
export const headerNav = [
  { label: "Custom Stamps", path: "/custom-stamps/" },
  { label: "Magnetic Name Tags", path: "/magnetic-name-tags/" },
  { label: "Notary Stamps", path: "/missouri-notary-stamp/" },
  { label: "About", path: "/about/" },
  { label: "Contact", path: "/contact/" },
] as const;

/** Sticky mobile bottom bar (StickyCallBar.astro). Labels only, no digits (Rule 7.2); edit the wording here. */
export const stickyBar = {
  callLabel: "Call Now",
  emailLabel: "Email Us",
  regionLabel: "Call or email Springfield Stamp",
} as const;

export const footer = {
  informationHeading: "INFORMATION",
  contactHeading: "CONTACT US",
  socialHeading: "SOCIAL",
  links: [
    { label: "Custom Stamps", path: "/custom-stamps/" },
    { label: "Magnetic Name Tags", path: "/magnetic-name-tags/" },
    { label: "Notary Stamps", path: "/missouri-notary-stamp/" },
    { label: "Contact Us", path: "/contact/" },
  ],
} as const;
