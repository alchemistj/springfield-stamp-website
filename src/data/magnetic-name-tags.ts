// Magnetic Name Tags page copy, word for word from the live site (docs/reference/current-site-audit.md section 2.2,
// desktop rendering). Spec fix: the second product-list sentence said "custom stamps"; it now says "magnetic name tags".
// Bold phrases are `{ strong: "..." }` parts.
import { site } from "./site";
import type { Cta, Rich } from "./types";

export interface TagRow {
  title: string;
  body: string;
  image: "classic" | "logo" | "engraved" | "fullColor" | "photo";
}
export interface Benefit {
  icon: "breakTheIce" | "boostBrand" | "promote" | "improve" | "enhance";
  title: string;
  body: Rich;
}
export interface WhyItem {
  icon: "quality" | "speed" | "touch" | "community";
  title: string;
  body: Rich;
}

export const magneticNameTags: {
  hero: { brand: string; lead: string; rest: string };
  intro: { hello: Rich; pride: Rich; callHeading: string; callCta: Cta; whether: Rich };
  find: { title: string; lead: string; rows: readonly TagRow[] };
  unique: { title: string; body: Rich; contact: string; callLine: string; cta: Cta };
  design: { title: string; body: Rich };
  power: { title: string; lead: string; benefits: readonly Benefit[] };
  more: { title: string; body: Rich; bullets: readonly string[] };
  why: { title: string; lead: Rich; items: readonly WhyItem[] };
  ready: { title: string; before: string; after: string };
} = {
  hero: { brand: "Springfield Stamp", lead: "MAGNETIC NAME TAGS", rest: "that Make Connections Count!" },
  intro: {
    hello: [
      "Howdy from",
      { strong: " Springfield Stamp," },
      " your friendly neighborhood experts in making names stick — literally!",
    ],
    pride: [
      "We take pride in offering ",
      { strong: "top-quality blurless magnetic nametags " },
      "backed by ",
      { strong: "friendly, small-town service" },
      ". You can expect",
      { strong: " personalized attention, lightning-fast turnaround times" },
      ", and the kind of genuine care that makes you feel like you're dealing with a neighbor.",
    ],
    callHeading: "Give us a call today to get started!",
    callCta: { label: site.phone.display, href: site.phone.tel },
    whether: [
      "Whether you're a bustling restaurant needing ",
      { strong: "custom magnetic name tags" },
      " with logos for your waitstaff, a growing startup seeking professional name badges, or a local school fostering a sense of community with photo name tags, we've got the perfect solution.",
    ],
  },
  find: {
    title: "Find the Perfect Magnetic Name Tag for Your Needs",
    lead: "We offer a wide variety of custom magnetic name tags to meet your unique needs, including:",
    rows: [
      {
        title: "Classic Magnetic Name Tags",
        body: "Simple and functional, perfect for everyday use. Choose from a variety of sizes, shapes, and colors.",
        image: "classic",
      },
      {
        title: "Magnetic Name Tags with Logo",
        body: "Showcase your brand with a professional-looking logo. Upload your own logo or let our design team create one for you. Make a lasting impression whenever you meet someone new.",
        image: "logo",
      },
      {
        title: "Engraved Magnetic Name Tags",
        body: "Add a touch of elegance with personalized engraved name tags. Perfect for executives, professionals, or special events.",
        image: "engraved",
      },
      {
        title: "Full-Color Magnetic Name Tags",
        body: "Make a bold statement with vibrant, full-color designs. Ideal for creative businesses, marketing campaigns, or team-building events.",
        image: "fullColor",
      },
      {
        title: "Magnetic Photo Name Tags",
        body: "Put a face to the name with personalized photo name tags. Great for schools, healthcare facilities, or customer service teams.",
        image: "photo",
      },
    ],
  },
  unique: {
    title: "Looking for something truly unique?",
    body: [
      "We offer custom options like ",
      { strong: "magnetic closures" },
      ", ",
      { strong: "breakaway lanyards, and more" },
      ". Just let us know your vision, and we'll bring your dream name tag to life!",
    ],
    contact: "Contact us today to discuss your customization options and get started.",
    callLine: `Call ${site.phone.display} to Start Creating`,
    cta: { label: "CALL US", href: site.phone.tel },
  },
  design: {
    title: "Design Your Own in Minutes: It's Easy!",
    body: [
      "Creating your ",
      { strong: "custom magnetic name tags" },
      " is a breeze! Choose your style, size, and design elements, send us your logo or photo, and see your creation come to life. Once you're satisfied, place your order and we'll get started right away!",
    ],
  },
  power: {
    title: "The Power of Name Tags",
    lead: "Beyond simply identifying individuals, magnetic name tags offer a surprising range of benefits for businesses and organizations. Here’s how they can positively impact your environment:",
    benefits: [
      {
        icon: "breakTheIce",
        title: "BREAK THE ICE",
        body: [
          { strong: "Name tags " },
          "instantly ",
          { strong: "facilitate introductions" },
          " and ",
          { strong: "ease social interactions, " },
          "creating a more welcoming and approachable atmosphere.",
        ],
      },
      {
        icon: "boostBrand",
        title: "Boost Brand Recognition",
        body: [{ strong: "Custom logo name tags" }, " subtly reinforce your brand identity with every interaction, increasing brand awareness and memorability."],
      },
      {
        icon: "promote",
        title: "Promote Professionalism",
        body: ["Name tags project a ", { strong: "polished and put-together image" }, ", fostering trust and confidence in your team and organization."],
      },
      {
        icon: "improve",
        title: "Improve Communication",
        body: ["By readily identifying individuals, ", { strong: "name tags" }, " enable smoother communication and collaboration, streamlining interactions and fostering teamwork."],
      },
      {
        icon: "enhance",
        title: "Enhance Customer Service",
        body: ["Personalized name tags create a ", { strong: "friendlier and more personalized customer experience" }, ", leaving a lasting positive impression."],
      },
    ],
  },
  more: {
    title: "More Than Just Name Tags: Building Connection",
    body: [
      "At Springfield Stamp, we're passionate about helping businesses ",
      { strong: "connect with their customers and employees" },
      ". That's why we offer a variety of other products to enhance your professional image, including:",
    ],
    bullets: [
      "Custom rubber stamps for a personalized touch on documents and packaging.",
      "Promotional products to spread brand awareness and appreciation.",
      "Embroidered badges for a touch of class and distinction.",
    ],
  },
  why: {
    title: "Why Choose Springfield Stamp?",
    lead: [
      "In a world of online anonymity, we value the power of ",
      { strong: "personal connection" },
      " and ",
      { strong: "small-town service" },
      ". Here's why you should choose ",
      { strong: "Springfield Stamp" },
      " for your custom name tag needs:",
    ],
    items: [
      {
        icon: "quality",
        title: "Unmatched Quality",
        body: ["We use ", { strong: "high-grade materials and expert craftsmanship" }, " to ensure your name tags look their best and last for years to come."],
      },
      {
        icon: "speed",
        title: "Speed is Key",
        body: ["We understand the importance of time, so we offer ", { strong: "lightning-fast turnaround times" }, " to get you the name tags you need – when you need them!"],
      },
      {
        icon: "touch",
        title: "Personalized Touch",
        body: ["Our friendly team is here to answer your questions, help you choose the perfect option, and ensure a smooth ordering experience."],
      },
      {
        icon: "community",
        title: "Community focus",
        body: ["We're proud to support local businesses and be an active part of the small business community."],
      },
    ],
  },
  ready: {
    title: "Ready to give your team the professional image they deserve?",
    before: "For expert advice and personalized service, call ",
    after: ". Our US-based customer support team is unparalleled in the world. We can clarify any questions, ensure that we get you exactly what you need, and accelerate the turnaround time!",
  },
};
