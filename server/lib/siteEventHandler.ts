// Source for the beacon function. The file Vercel runs is the committed bundle
// `api/site-events.js` (no local imports). Regenerating that bundle is a unit test:
// edit this file, then update the bundle so the test matches. The build must not
// move or delete anything under `api/`.
import type { IncomingMessage, ServerResponse } from "node:http";
import { normalizeClientPayload } from "../../src/lib/attribution/collector.ts";
import { forwardMeasurementCollect } from "./forwardMeasurementCollect.ts";

export const MAX_BODY_BYTES = 20_000;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });

export async function handleSiteEvent(request: Request, fetchImpl: typeof fetch = fetch): Promise<Response> {
  if (request.method !== "POST") return json(405, { ok: false, error: "Method not allowed" });
  const type = request.headers.get("content-type") ?? "";
  if (!type.toLowerCase().includes("application/json") && !type.toLowerCase().includes("text/plain")) {
    return json(415, { ok: false, error: "Expected JSON" });
  }
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength > MAX_BODY_BYTES) return json(413, { ok: false, error: "Body too large" });
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return json(400, { ok: false, error: "Invalid JSON" });
  }
  const payload = normalizeClientPayload(parsed);
  if (!payload) return json(400, { ok: false, error: "Invalid event" });
  const origin = request.headers.get("origin");
  try {
    const upstream = await forwardMeasurementCollect(JSON.stringify(payload), request.headers.get("user-agent") ?? "", origin, fetchImpl);
    const upstreamBody = (await upstream.text()).slice(0, 180).replace(/[\r\n]+/g, " ");
    // The beacon is accepted once FF Reports answered. A 403 (site key not registered yet)
    // must not become the browser status: the page cannot fix that, and a beacon is fire-and-forget.
    // The upstream status stays on the response so a 403 is visible without reading the runtime log.
    if (!upstream.ok) console.error(`FF Reports collect responded ${upstream.status} ${upstreamBody}`);
    return new Response(null, {
      status: 204,
      headers: {
        "Cache-Control": "private, no-store",
        "x-ff-collect-status": String(upstream.status),
        "x-ff-collect-body": upstreamBody,
      },
    });
  } catch {
    return json(502, { ok: false, error: "Unable to reach FF Reports" });
  }
}

function nodeHeaders(source: IncomingMessage["headers"]): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) headers.set(key, value.join(", "));
    else if (typeof value === "string") headers.set(key, value);
  }
  return headers;
}

export const config = { api: { bodyParser: false } };

async function readBody(req: IncomingMessage): Promise<Uint8Array> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return new Uint8Array(Buffer.concat(chunks));
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const host = typeof req.headers.host === "string" ? req.headers.host : "invalid";
  const method = req.method ?? "GET";
  const raw = method === "GET" || method === "HEAD" ? undefined : await readBody(req);
  const request = new Request(`https://${host}${req.url ?? "/api/site-events/"}`, {
    method,
    headers: nodeHeaders(req.headers),
    body: raw && raw.byteLength > 0 ? new TextDecoder().decode(raw) : undefined,
  });
  const response = await handleSiteEvent(request);
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.end(Buffer.from(await response.arrayBuffer()));
}
