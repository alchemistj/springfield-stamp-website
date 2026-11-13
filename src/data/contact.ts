// Contact page copy, word for word from the live site (docs/reference/current-site-audit.md section 2.6).
// Address, phone and hours come from src/data/site.ts; the live body shows them slightly differently
// ("1416 S. Glenstone", "Springfield, MO. 65804", "417.881.8828"); the spec says to use the NAP format everywhere
// (`1416 S. Glenstone Ave., Springfield, MO 65804` and `(417) 881-8828`).
import { site } from "./site";

export const contact = {
  h1: "CONTACT US",
  intro: {
    lead: "In order for us to provide the best service possible, ",
    strong: "we prefer phone calls",
    tail: "!",
    aside: "(We’re old-school like that!)",
  },
  reach: { label: "You can reach us at:", phone: site.phone.display, href: site.phone.tel },
  allows: "This allows us to ask specific questions and make sure that we provide EXACTLY what you need.",
  lookForward: "We look forward to speaking with you!",
  details: {
    heading: "Other details and ways to get in touch are here:",
    name: "Springfield Stamp & Engraving, Inc.",
    address: [site.address.street, `${site.address.city}, ${site.address.region} ${site.address.postalCode}`],
    phone: site.phone.display,
    phoneHref: site.phone.tel,
    hoursDays: site.hours.days,
    hoursTimes: site.hours.times,
  },
  map: {
    title: "Springfield Stamp & Engraving",
    linkLabel: "View on Google Maps",
    /** Same place and coordinates as the live embed. */
    embedSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3178.499075143174!2d-93.2618564!3d37.1883738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87cf6335f31111cb%3A0xce0348f728b26251!2sSpringfield%20Stamp%20%26%20Engraving!5e0!3m2!1sen!2sfi!4v1711061853475!5m2!1sen!2sfi",
    linkHref: "https://www.google.com/maps/search/?api=1&query=Springfield+Stamp+%26+Engraving%2C+1416+S+Glenstone+Ave%2C+Springfield%2C+MO+65804",
  },
  form: {
    heading: "send us a message",
    nameLabel: "Name",
    firstLabel: "First",
    lastLabel: "Last",
    emailLabel: "Email",
    phoneLabel: "Phone",
    messageLabel: "Message",
    submit: "Send Message",
    // Honeypot: the live Gravity Form labels it "Comments" with this text. Hidden from people.
    honeypotLabel: "Comments",
    honeypotNote: "This field is for validation purposes and should be left unchanged.",
  },
} as const;

/** Visitor-facing form messages (written for this build; the live form's were Gravity Forms defaults). */
export const formMessages = {
  sending: "Sending…",
  success: "Thank you. We received your message and will be in touch soon.",
  invalid: "Please check the fields and try again, or call",
  rateLimited: "Please wait a minute and try again, or call",
  unconfirmed: "We could not confirm your message was sent. Your text is still here. Please call",
  preview: "Preview: form not sent",
  loading: "Form loading… or call",
  noscript: "This form needs JavaScript. Call us at",
} as const;
