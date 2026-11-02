import type { APIRoute } from "astro";
import { sitemapXml } from "../lib/discovery";

export const GET: APIRoute = () =>
  new Response(sitemapXml(new Date().toISOString().slice(0, 10)), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
