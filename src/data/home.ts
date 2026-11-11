// Home page copy, word for word from the live site (docs/reference/current-site-audit.md section 2.1),
// with the spec's only change: "60 years" -> "50 years".
// Bold phrases are `{ strong: "..." }` parts. Non-breaking spaces (U+00A0) from the original are kept inside strings.
import { site } from "./site";
import type { Cta, Rich } from "./types";

export interface HomeProduct {
  title: string;
  body: Rich;
  /** Key into `src/lib/images.ts` `homeProductImages`. */
  image?: "customStamps" | "magneticNameTags" | "signs" | "deskNamePlates" | "awardsPlaques" | "notaryEmbosser";
  /** Alt text describing what the photo shows (empty for decorative). */
  imageAlt?: string;
  /** "contain" shows the whole photo instead of cropping it to the row box. */
  fit?: "cover" | "contain";
  cta?: { label: string; href: string };
}

export interface HomeFeature {
  icon: "breakTheIce" | "enhance" | "boostBrand";
  title: string;
  body: Rich;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export const home: {
  hero: { kicker: string; h1Lead: string; h1Rest: string; sub: readonly string[]; callCta: Cta; emailCta: Cta };
  help: { title: string; products: readonly HomeProduct[] };
  workflow: { title: string; intro: string; testimonials: readonly Testimonial[]; outro: Rich; cta: Cta };
  why: { title: string; items: readonly HomeFeature[] };
  about: { title: string; body: Rich; cta: Cta };
} = {
  hero: {
    kicker: "Make a Lasting Impression…",
    /** H1: first part, then the uppercase second part (a line break sits between them on mobile). */
    h1Lead: "Springfield Stamp:",
    h1Rest: "Your Trusted Partner for Custom Products",
    sub: ["High-quality stamps, name tags, signs & awards.", "Fast turnaround, friendly service."],
    callCta: { label: `Give us a call Today! ${site.phone.display}`, href: site.phone.tel },
    emailCta: { label: "Email Springfield Stamp", href: `mailto:${site.email}` },
  },

  help: {
    title: "How We Can Help…",
    products: [
      {
        title: "Custom Stamps",
        body: [
          "Leave a lasting impression with ",
          { strong: "custom stamps" },
          " crafted to your exact specifications. Choose from self-inking stamps, rubber handstamps, logo stamps and address stamps in a variety of sizes, styles, and ink colors. Perfect for everyday tasks like signing documents, addressing envelopes, or personalizing packaging. Choose from classic or decorative designs, and let us create a stamp that reflects your unique style.",
        ],
        image: "customStamps",
        imageAlt: "Large Trodat professional stamp next to a small round self-inking stamp, with the banner \"Big to small, we have it all!\"",
        fit: "contain",
        cta: { label: "See Our Custom Stamp Options", href: "/custom-stamps/" },
      },
      {
        title: "Name Tags",
        body: [
          "Make introductions a breeze with ",
          { strong: "professional-looking name tags" },
          ". We offer high-quality printed tags, engraved tags, and ID badges. Our customizable options allow you to showcase your brand logo, personalize with employee names, and choose from various styles and materials to match your needs.",
        ],
        image: "magneticNameTags",
        cta: { label: "Explore Magnetic Name Tags Here", href: "/magnetic-name-tags/" },
      },
      {
        title: "Signs",
        body: [
          "Custom metal and plastic signs, engraved or printed in the size you need. We can engrave or print your artwork, logos, and designs on room signs, max occupancy signs, ADA-compliant signs with braille, memorial signs, electrical tags, and parking lot signs, with standoff mounting available.",
        ],
        image: "signs",
        imageAlt: "Engraved signs including an EXIT sign, Smoke Free Building plate and a frosted office sign on standoffs",
      },
      {
        title: "Name Plates",
        body: [
          { strong: "Elevate your workspace" },
          " with professional and stylish custom-engraved metal and plastic ",
          { strong: "name plates" },
          ". Display them on your desk with traditional wooden or sleek modern metal bases. Mount them flush to doors, or let them float on architectural standoffs. You'll make a lasting impression on visitors and colleagues.",
        ],
        image: "deskNamePlates",
      },
      {
        title: "Awards & Plaques",
        body: [
          "Celebrate accomplishments and recognition with our premium ",
          { strong: "custom awards" },
          ". Choose from modern acrylic, elegant glass, or timeless crystal, as well as classic wooden or plastic plaques featuring precision-engraved metal plates. We offer a variety of styles and sizes to suit any occasion, allowing you to personalize each piece with text, logos, or custom artwork.",
        ],
        image: "awardsPlaques",
        imageAlt: "Wood plaques with engraved metal plates and glass and crystal awards",
      },
      {
        title: "Notary Stamps & Embossers",
        body: [
          { strong: "Notarize documents" },
          " with ease and professionalism using your very own ",
          { strong: "notary stamp" },
          ". No more messy ink pads or missed details plus –  we have all the supplies: the stamp, journal, and embosser!",
        ],
        image: "notaryEmbosser",
        imageAlt: "Notary embosser pressing a raised seal into paper",
        cta: { label: "Get Your Notary Stamp", href: "/missouri-notary-stamp/" },
      },
    ],
  },

  workflow: {
    title: "Our Workflow Process Might Be the Easiest Thing You Do All Day!",
    intro: "Ordering your custom products from Springfield Stamp & Engraving is simple and hassle-free.",
    testimonials: [
      {
        quote:
          "\"I needed custom stamps in a hurry, and Springfield Stamp & Engraving came to the rescue! They had my order ready in just a few days, and the quality is fantastic.",
        name: "Sarah B.",
        role: "Business Owner",
      },
      {
        quote:
          "The customer service at Springfield Stamp is top-notch. They listened carefully to my needs and offered suggestions I hadn't even thought of. My desk name plates look amazing!",
        name: "John D.",
        role: "Marketing Manager",
      },
      {
        quote:
          "We ordered acrylic awards for our employee recognition ceremony, and they were a huge hit! The quality is exceptional, and the engraving is beautiful.",
        name: "Jane S.",
        role: "HR Manager",
      },
    ],
    outro: [
      "Just give us a call, tell us what you need, and our friendly team guides you through the process. We'll clarify any details, offer valuable suggestions based on our 50 years of experience, and get started on fulfilling your order right away. In most cases, you'll receive your products within ",
      { strong: "a few short days!" },
    ],
    cta: { label: `Click to Call ${site.phone.display}`, href: site.phone.tel },
  },

  why: {
    title: "Why Do Business with Us?",
    items: [
      {
        icon: "breakTheIce",
        title: "FAST TURNAROUND",
        body: [
          "Need your order quickly? No problem! We understand tight deadlines. Our ",
          { strong: "lightning-fast turnaround times" },
          " ensure you get your products when you need them most. Whether you need custom stamps for a last-minute marketing campaign or personalized name tags for an upcoming event, we've got you covered.",
        ],
      },
      {
        icon: "enhance",
        title: "Customer Service",
        body: [
          "At Springfield Stamp & Engraving, we don't just sell products, we ",
          { strong: "build relationship" },
          "s. Our friendly and knowledgeable team is dedicated to providing exceptional customer service. We'll take the time to understand your needs, answer your questions, and offer expert suggestions to ensure you get the perfect product for your specific requirements.",
        ],
      },
      {
        icon: "boostBrand",
        title: "QUALITY WORK",
        body: [
          "We take pride in offering ",
          { strong: "superior" },
          " ",
          { strong: "quality products " },
          "that are built to last. From the materials we use to the craftsmanship of our work, we ensure exceptional results that will exceed your expectations. Our products are not only beautiful but also durable, ensuring they make a lasting impression.",
        ],
      },
    ],
  },

  about: {
    title: "About Us",
    body: [
      "Springfield Stamp has been a family-owned and operated business for ",
      { strong: "over 50 years" },
      ". Now in the hands of Adam and Bri, the founder's nephew and niece-in-law, we carry on the tradition of exceptional quality, personalized service, and fast turnaround times. We're passionate about helping our customers make a lasting impression, and we're dedicated to providing the best possible experience every step of the way.",
    ],
    cta: { label: "Read Our STORY", href: "/about/" },
  },
};
