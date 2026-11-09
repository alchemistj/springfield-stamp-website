// Reads the identity cookies the middleware set. Session ids are never stored in sessionStorage.
import { BOT_COOKIE, ENTRY_COOKIE, SID_COOKIE, VID_COOKIE, isUuid } from "./allowlist.ts";

/** One cookie value from a `Cookie` request header or `document.cookie`. */
export function readCookie(header: string, name: string): string | null {
  const prefix = `${name}=`;
  for (const part of header.split(/; */)) {
    if (!part.startsWith(prefix)) continue;
    const raw = part.slice(prefix.length);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}

export interface IdentityCookies {
  ff_vid: string | null;
  ff_sid: string | null;
  entry: string | null;
  bot: boolean;
}

export function readIdentity(header: string): IdentityCookies {
  const vid = readCookie(header, VID_COOKIE);
  const sid = readCookie(header, SID_COOKIE);
  const entry = readCookie(header, ENTRY_COOKIE);
  return {
    ff_vid: vid !== null && isUuid(vid) ? vid : null,
    ff_sid: sid !== null && isUuid(sid) ? sid : null,
    entry: entry !== null && entry !== "" ? entry : null,
    bot: readCookie(header, BOT_COOKIE) === "1",
  };
}

/** The Central Forms attribution envelope. Omitted when either cookie is missing. */
export function attributionEnvelope(header: string): { ff_vid: string; ff_sid: string } | null {
  const id = readIdentity(header);
  if (!id.ff_vid || !id.ff_sid) return null;
  return { ff_vid: id.ff_vid, ff_sid: id.ff_sid };
}
