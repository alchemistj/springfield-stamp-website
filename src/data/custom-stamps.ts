// Custom Stamps page copy, word for word from the live site (docs/reference/current-site-audit.md section 2.5,
// desktop rendering), with the spec's fix: "avaailable" -> "available".
// Bold phrases are `{ strong: "..." }` parts. Non-breaking spaces (U+00A0) from the original are kept inside strings.
import { site } from "./site";
import type { Cta, Rich } from "./types";

export interface CustomStampRow {
  title: string;
  /** One entry per paragraph. Splits fall on sentence ends. */
  body: readonly Rich[];
  /** Key into the images imported by the page. */
  image: "selfInking" | "signature" | "logo" | "daters" | "notary";
  cta?: Cta;
}

export interface WhyItem {
  icon: "detail" | "turnaround" | "service" | "community";
  title: string;
  body: Rich;
}

export const customStamps: {
  hero: { brand: string; h1: string };
  intro: Rich;
  find: { title: string; body: readonly Rich[]; rows: readonly CustomStampRow[] };
  ready: { title: string; body: string; callHeading: string; cta: Cta };
  why: { title: string; intro: Rich; lead: string; items: readonly WhyItem[] };
  mark: { title: string; lead: string; contactLabel: string; contactBody: string; callPrefix: string; callMiddle: string };
} = {
  hero: {
    brand: "springfield stamp",
    h1: "Your Friendly Neighborhood CUSTOM STAMP Experts!",
  },
  intro: [
    "Howdy from ",
    { strong: "Springfield Stamp" },
    ", your one-stop shop for custom rubber stamps, personalized stamps, and all things that help you make a lasting impression! Whether you're a bustling bakery needing custom logo stamps for your packaging or a freelance artist adding a unique touch with art stamps, we've got the perfect tool for your small business.",
  ],
  find: {
    title: "Find the Perfect Stamp for Your Unique Needs",
    body: [
      ["We take pride in being your friendly neighborhood stamp experts."],
      [
        "That means we offer ",
        { strong: "premium quality stamps" },
        " crafted with care, lightning-fast turnaround time, and personalized customer service that feels just like chatting over a cup of coffee!",
      ],
    ],
    rows: [
      {
        title: "Self-Inking Stamps",
        body: [
          ["Stay efficient with ", { strong: "quick, clean impressions" }, "."],
          ["Perfect for invoices, receipts, and adding a ", { strong: "personalized touch" }, " to packaging."],
          ["Choose from a variety of sizes, colors, and ink types to match your brand."],
        ],
        image: "selfInking",
      },
      {
        title: "Signature Stamps",
        body: [
          ["Replicate your handwritten signature with perfect accuracy, saving you time and adding a ", { strong: "personal touch" }, " to documents."],
          ["Ideal for contracts, handwritten notes, proposals, and checks."],
        ],
        image: "signature",
      },
      {
        title: "Logo Stamps",
        body: [
          ["Showcase your brand with a professional-looking ", { strong: "logo stamp" }, "."],
          ["Upload your own logo or let our design partners create one for you, ensuring a ", { strong: "consistent and memorable brand image" }, "."],
        ],
        image: "logo",
      },
      {
        title: "Daters & Inks",
        body: [
          ["Keep track of important dates with our handy daters, available in various styles and ink colors."],
          ["We also offer a variety of high-quality inks to keep your stamps looking their best, ensuring ", { strong: "professionalism and accuracy" }, " on every document."],
        ],
        image: "daters",
      },
      {
        title: "NOTARY STAMPS",
        body: [
          [{ strong: "Notarize documents" }, " with ease and professionalism using your very own ", { strong: "notary stamp" }, "."],
          ["No more messy ink pads or missed details plus –  we have all the supplies: the stamp, journal, and embosser!"],
        ],
        image: "notary",
        cta: { label: "Get Your Notary Stamp", href: "/missouri-notary-stamp/" },
      },
    ],
  },
  ready: {
    title: "Ready to create your own custom stamp?",
    body: "It’s easy—just give us a call! We’ll help you simplify your stamp design decisions, choose your ink color, and place your order. We'll then ship your stamp right away, so you can start making your mark in no time!",
    callHeading: "Give us a call today",
    cta: { label: `Call ${site.phone.display} to Get Started`, href: site.phone.tel },
  },
  why: {
    title: "why choose springfield stamp?",
    intro: [
      "In a world of faceless online retailers, we believe in the power of ",
      { strong: "personal connection" },
      " and ",
      { strong: "small-town values" },
      "….whether you are from Portland, Maine or Portland, Oregon!...",
    ],
    lead: "Here's why you should choose Springfield Stamp for your custom stamp needs:",
    items: [
      {
        icon: "detail",
        title: "Attention to detail",
        body: ["We handcraft each stamp with care, ensuring ", { strong: "superior quality and durability" }, "."],
      },
      {
        icon: "turnaround",
        title: "Lightning-fast turnaround",
        body: ["We know time is precious, so we get your stamps to you ", { strong: "quickly and efficiently" }, "."],
      },
      {
        icon: "service",
        title: "Personalized customer service",
        body: ["Our friendly U.S.-based team is always happy to answer your questions and help you find the perfect stamp for your needs."],
      },
      {
        icon: "community",
        title: "Community focus",
        body: ["We're proud to support local businesses and be an active part of the small business community."],
      },
    ],
  },
  mark: {
    title: "Make your mark with Springfield Stamp",
    lead: "Don't settle for ordinary when you can have extraordinary with Springfield Stamp – where quality meets creativity, and every impression counts!",
    contactLabel: "📞 Contact Our US-Based Team",
    contactBody: ": Do you have questions or need assistance with your order? Our friendly team is here to help!",
    callPrefix: "Call us at ",
    callMiddle: " or email us at ",
  },
};
