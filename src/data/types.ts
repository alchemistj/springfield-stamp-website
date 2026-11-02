// Shared copy types. Page data files (src/data/<page>.ts) use these.

/** A run of copy: plain text, or a bold phrase. Keeps the original punctuation and spacing exactly. */
export type RichPart = string | { strong: string };
export type Rich = readonly RichPart[];

export interface Cta {
  label: string;
  href: string;
}
