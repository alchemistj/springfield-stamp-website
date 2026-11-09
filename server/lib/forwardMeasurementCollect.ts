// Forwards a validated measurement body to FF Reports. The visitor's user agent goes in
// `x-ff-client-user-agent` because this server's own fetch would otherwise replace it.
export const MEASUREMENT_COLLECT_URL = "https://ff-reports-analytics.vercel.app/api/measurement/collect";
export const CLIENT_UA_HEADER = "x-ff-client-user-agent";

export async function forwardMeasurementCollect(
  body: string,
  userAgent: string,
  origin: string | null,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  const headers = new Headers();
  headers.set("content-type", "application/json");
  headers.set("accept", "application/json");
  headers.set(CLIENT_UA_HEADER, userAgent);
  if (origin) headers.set("origin", origin);
  return fetchImpl(MEASUREMENT_COLLECT_URL, {
    method: "POST",
    redirect: "error",
    headers,
    body,
  });
}
