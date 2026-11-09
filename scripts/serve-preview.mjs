// Serves the built site the way `astro preview` does, with the identity middleware in front.
// Playwright talks to this. Vercel runs middleware.ts itself in production; this proxy exists
// so the cookie and /Springfield checks can run locally.
import { spawn } from "node:child_process";
import http from "node:http";
import { decideIdentity } from "../middleware.ts";

const PREVIEW_PORT = 4399;
const PORT = Number(process.env.PORT ?? 4321);
const previewOrigin = `http://127.0.0.1:${PREVIEW_PORT}`;

const child = spawn("node_modules/.bin/astro", ["preview", "--host", "127.0.0.1", "--port", String(PREVIEW_PORT)], {
  stdio: "inherit",
});

function stop() {
  child.kill("SIGTERM");
}
process.on("SIGTERM", () => {
  stop();
  process.exit(0);
});
process.on("SIGINT", () => {
  stop();
  process.exit(0);
});
child.on("exit", (code) => {
  if (code) process.exit(code);
});

async function waitReady() {
  for (let i = 0; i < 150; i++) {
    try {
      const res = await fetch(`${previewOrigin}/`);
      if (res.status < 500) return;
    } catch {
      /* preview is still booting */
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("astro preview did not start");
}

function headerBag(req) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(", "));
  }
  return headers;
}

await waitReady();

const server = http.createServer(async (req, res) => {
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
    const headers = headerBag(req);
    const method = req.method ?? "GET";
    const request = new Request(url, {
      method,
      headers,
      body: body.length > 0 && method !== "GET" && method !== "HEAD" ? body : undefined,
    });
    const decision = decideIdentity(request);
    if (decision.kind === "redirect") {
      res.statusCode = 308;
      res.setHeader("location", decision.location);
      res.setHeader("cache-control", "private, no-store");
      for (const cookie of decision.cookies) res.appendHeader("set-cookie", cookie);
      res.end();
      return;
    }
    const upstreamHeaders = new Headers(headers);
    upstreamHeaders.delete("host");
    const upstream = await fetch(`${previewOrigin}${url.pathname}${url.search}`, {
      method,
      headers: upstreamHeaders,
      body: body.length > 0 && method !== "GET" && method !== "HEAD" ? body : undefined,
      redirect: "manual",
    });
    res.statusCode = upstream.status;
    for (const [key, value] of upstream.headers) {
      if (key === "set-cookie" || key === "content-encoding" || key === "transfer-encoding" || key === "content-length") continue;
      res.setHeader(key, value);
    }
    const setCookies = typeof upstream.headers.getSetCookie === "function" ? upstream.headers.getSetCookie() : [];
    for (const cookie of setCookies) res.appendHeader("set-cookie", cookie);
    if (decision.kind === "next") {
      for (const cookie of decision.cookies) res.appendHeader("set-cookie", cookie);
    }
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    res.statusCode = 502;
    res.end("preview proxy error");
  }
});

server.listen(PORT, "127.0.0.1");
