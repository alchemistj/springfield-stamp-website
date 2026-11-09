import { expect, test } from "@playwright/test";

const COLLECT = /\/api\/site-events\/?$/;

type EventBody = {
  event: string;
  eventId: string;
  ff_vid: string;
  ff_sid: string;
  sessionId: string;
  visitorId: string;
  currentPath: string;
  ctaLocation?: string;
  engaged: boolean;
};

test.describe("journey tracking", () => {
  test("page_view fires once per page and keeps the same ff_sid", async ({ page }) => {
    const events: EventBody[] = [];
    await page.route(COLLECT, async (route) => {
      events.push(JSON.parse(route.request().postData() ?? "{}") as EventBody);
      await route.fulfill({ status: 204, body: "" });
    });
    await page.goto("/", { waitUntil: "networkidle" });
    await expect.poll(() => events.filter((e) => e.event === "page_view" && e.engaged === false && e.currentPath === "/").length).toBe(1);
    const first = events.find((e) => e.event === "page_view" && e.currentPath === "/")!;
    const sid = (await page.context().cookies()).find((c) => c.name === "ff_sid")?.value;
    expect(sid).toBeTruthy();
    expect(first.ff_sid).toBe(sid);
    expect(first.sessionId).toBe(sid);
    expect(first.ff_vid).toBe(first.visitorId);

    await page.goto("/contact/", { waitUntil: "networkidle" });
    await expect.poll(() => events.filter((e) => e.event === "page_view" && e.engaged === false && e.currentPath === "/contact/").length).toBe(1);
    const second = events.find((e) => e.event === "page_view" && e.currentPath === "/contact/")!;
    expect(second.ff_sid).toBe(first.ff_sid);
    expect(second.eventId).not.toBe(first.eventId);
    const homeViews = events.filter((e) => e.event === "page_view" && e.engaged === false && e.currentPath === "/");
    expect(homeViews).toHaveLength(1);
  });

  test("a tel click and a contact click each send one event with ctaLocation", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const events: EventBody[] = [];
    await page.route(COLLECT, async (route) => {
      events.push(JSON.parse(route.request().postData() ?? "{}") as EventBody);
      await route.fulfill({ status: 204, body: "" });
    });
    await page.addInitScript(() => {
      document.addEventListener(
        "click",
        (event) => {
          const node = event.target instanceof Element ? event.target.closest("a") : null;
          const href = node?.getAttribute("href") ?? "";
          if (href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("/contact")) event.preventDefault();
        },
        true,
      );
    });
    await page.goto("/", { waitUntil: "networkidle" });
    await expect.poll(() => events.some((e) => e.event === "page_view")).toBe(true);
    const before = events.length;
    await page.locator("header .phone-btn").click();
    await expect.poll(() => events.filter((e) => e.event === "click_to_call").length).toBe(1);
    await page.locator("nav.nav-desktop a[href='/contact/']").click();
    await expect.poll(() => events.filter((e) => e.event === "contact_click").length).toBe(1);
    const clicks = events.slice(before).filter((e) => e.event === "click_to_call" || e.event === "contact_click");
    expect(clicks).toHaveLength(2);
    expect(clicks.find((e) => e.event === "click_to_call")?.ctaLocation).toBe("header");
    expect(clicks.find((e) => e.event === "contact_click")?.ctaLocation).toBe("header");
  });

  test("sets no identity cookies on /_astro/* or api/*", async ({ request }) => {
    const home = await request.get("/");
    const homeCookies = home.headersArray().filter((h) => h.name.toLowerCase() === "set-cookie").map((h) => h.value);
    expect(homeCookies.some((c) => c.startsWith("ff_vid="))).toBe(true);

    const html = await home.text();
    const asset = html.match(/\/_astro\/[^"']+/)?.[0];
    expect(asset).toBeTruthy();
    for (const path of [asset!, "/api/site-events", "/favicon.png"]) {
      const res = await request.get(path);
      const cookies = res.headersArray().filter((h) => h.name.toLowerCase() === "set-cookie").map((h) => h.value).join("\n");
      expect(cookies, path).not.toMatch(/ff_vid|ff_sid|ff_bot|ff_entry/);
    }
  });

  test("the /Springfield 308 sets ff_entry and keeps the query string", async ({ request }) => {
    const res = await request.get("/Springfield?utm_source=gbp", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toBe("/?utm_source=gbp");
    const cookies = res.headersArray().filter((h) => h.name.toLowerCase() === "set-cookie").map((h) => h.value);
    expect(cookies.some((c) => c.startsWith("ff_entry=gbp-springfield"))).toBe(true);
  });
});
