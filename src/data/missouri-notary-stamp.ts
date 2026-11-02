// Missouri Notary Stamp page copy, word for word from the live site (docs/reference/current-site-audit.md section 2.4).
// Prices are as shown. "Buy now!" goes to the in-page anchor #buy, as on the live site (no cart).
import { site } from "./site";
import type { Cta } from "./types";

export interface NotaryProduct {
  name: string;
  price: string;
  body: string;
  /** Extra sentence the live site shows on the mobile layout only. */
  mobileExtra?: string;
  image: "rectangle" | "circular" | "embosser" | "journal";
  /** The live desktop layout shows three cards; the journal appears only on the mobile layout. */
  mobileOnly?: boolean;
}

export const notaryStamp: {
  hero: { lead: string; accent: string };
  intro: string;
  products: { title: string; items: readonly NotaryProduct[]; buy: Cta };
  requirements: { title: string; intro: string; items: readonly string[]; outro: string };
  buy: { title: string; body: string; callLabel: string; emailLabel: string };
} = {
  hero: { lead: "Your One-Stop Spot for Missouri", accent: "Notary Stamps" },
  intro:
    "Our high-quality notary stamps, seals, and embossers meet all Missouri notary stamp requirements, ensuring that your documents are legally valid and recognized. Whether you need a new notary stamp, a replacement, or an embosser, we have the products that will meet your professional needs.",
  products: {
    title: "Notary Stamps",
    buy: { label: "Buy now!", href: "#buy" },
    items: [
      {
        name: "Rectangle Stamp",
        price: "$22",
        body: "Sleek and easy to use, this rectangular notary stamp provides a modern alternative to the traditional circular style. Designed for efficiency, it produces sharp, legible text and fits perfectly on standard document lines.",
        image: "rectangle",
      },
      {
        name: "Circular Stamp",
        price: "$30",
        body: "This classic round notary stamp features a clean, professional design that complies with state regulations. Ideal for official documents, it delivers crisp, clear impressions with every use.",
        mobileExtra: "Available in multiple ink colors.",
        image: "circular",
      },
      {
        name: "Notary Embosser",
        price: "$32",
        body: "Add a layer of authenticity and elegance to your documents with this notary embosser. Compact and durable, it creates a raised seal impression and is perfect for both personal and professional use.",
        image: "embosser",
      },
      {
        name: "Notary Journal",
        price: "$19.95",
        body: "Stay organized and compliant with this secure, professionally bound notary journal. Includes detailed entry fields to record every notarization, helping you meet legal record-keeping requirements with ease.",
        image: "journal",
        mobileOnly: true,
      },
    ],
  },
  requirements: {
    title: "Missouri Notary Stamp Requirements",
    intro: "As a notary in Missouri, your stamp must meet the following specifications:",
    items: [
      "The notary stamp should include your name, commission number, expiration date, and the county where you are commissioned.",
      "The stamp must be legible, permanent, and inked.",
      "Missouri notary seals must be in a rectangular or circular format.",
    ],
    outro:
      "At Springfield Stamp & Engraving, you can shop with confidence knowing that all of our stamps are legally recognized and fully compliant. We provide high-quality products that meet the highest standards, ensuring your documents remain valid and professional.",
  },
  buy: {
    title: "Buy Your Missouri Notary Supplies Today",
    body: "Ready to get your Missouri notary stamp? Contact us now and take advantage of fast shipping, high-quality products, and excellent customer service.",
    callLabel: "call us",
    emailLabel: "email us",
  },
};

export const notaryContact = { phone: site.phone, email: site.email };
