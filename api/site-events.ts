// Same-origin beacon receiver. Validates the journey event, then forwards the ff-measure.v1
// body to FF Reports. Does not set identity cookies (middleware skips api/*).
import type { IncomingMessage, ServerResponse } from "node:http";
import { normalizeClientPayload } from "../src/lib/attribution/collector.ts";
import { forwardMeasurementCollect } from "../server/lib/forwardMeasurementCollect.ts";

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
    if (upstream.ok) return new Response(null, { status: 204, headers: { "Cache-Control": "private, no-store" } });
    return json(upstream.status, { ok: false });
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
  const request = new Request(`https://${host}${req.url ?? "/api/site-events"}`, {
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
