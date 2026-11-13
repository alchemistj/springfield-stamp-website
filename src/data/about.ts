// About page copy, word for word from the live site (docs/reference/current-site-audit.md section 2.3).
// The live page shows different copy per width: the "story" block (four paragraphs) from 768px up, and the
// "Howdy" paragraph below 768px. Both are kept, as on the live site. Bold phrases are `{ strong }` parts.
import type { Rich } from "./types";

export const about: {
  kicker: string;
  h1: string;
  story: readonly Rich[];
  storyMobile: Rich;
  why: { title: string; paragraphs: readonly Rich[] };
  closing: { body: Rich; cta: { label: string; href: string } };
} = {
  kicker: "ABOUT",
  h1: "Springfield Stamp",
  story: [
    ["We’ve been a family-owned business for over 50 years!"],
    ["Adam’s uncle, John Arnold, started ", { strong: "Springfield Stamp" }, ", beginning a long tradition of customer service and attention to detail."],
    [
      "While he loves his customers and work, after half a century of hard work, it was time for John to spend a little less time at the shop and a little more time getting work done around his house. So he approached us (Adam and Bri) about taking over the business. (Although you can still find him puttering around the shop answering all of the challenging questions!)",
    ],
    ["Long time admirers of John’s conscientious and meticulous approach to ", { strong: "Springfield Stamp" }, ", we agreed to continue the legacy."],
    ["Combining John’s years of experience with new ideas and technology, we focus on premium quality products and top-notch customer service."],
  ],
  storyMobile: [
    "Howdy from ",
    { strong: "Springfield Stamp" },
    ", your one-stop shop for custom rubber stamps, personalized stamps, and all things that help you make a lasting impression! Whether you're a bustling bakery needing ",
    { strong: "custom logo stamps" },
    " for your packaging or a freelance artist adding a unique touch with ",
    { strong: "art stamps" },
    ", we've got the perfect tool for your small business.",
  ],
  why: {
    title: "Why Choose Springfield Stamp?",
    paragraphs: [
      ["We’re legendary for our ", { strong: "turnaround time" }, "."],
      ["It sounds like bragging, I know, but the fact is, it’s a bit of an obsession."],
      ["We can’t even go to bed at night if there are dirty dishes in the sink…(despite a toddler dominating our evening routine!)"],
      ["So if there’s work to be done, we don’t rest until it’s done."],
      ["So you can be assured that we process your order as efficiently as possible."],
      ["Plus, as a family business, we bring mid-western family values to work every day.\u00a0 Our customers are an extension of our community, even though they may come from the farthest reaches of the country."],
    ],
  },
  closing: {
    body: ["We want everything to be ", { strong: "PERFECT" }, "…so we take the time to ask the right questions and ", { strong: "deliver exactly what our clients want and need" }, "."],
    cta: { label: "Click Here to Get in Touch", href: "/contact/" },
  },
};
