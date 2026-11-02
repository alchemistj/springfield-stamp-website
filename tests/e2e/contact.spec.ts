import { test, expect } from "@playwright/test";

const GOOGLE_MAPS = /^https:\/\/(www\.)?google\.com\/maps\//;
const isGoogleMaps = (url: string) => GOOGLE_MAPS.test(url);

test.describe("contact form", () => {
  test("the form is in the server HTML (no JavaScript needed to see it)", async ({ request }) => {
    const html = await (await request.get("/contact/")).text();
    expect(html).toContain("<form");
    expect(html).toContain('name="email"');
    expect(html).not.toContain("<iframe");
  });

  test("without JavaScript the button is disabled and the phone link shows", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/contact/");
    await expect(page.locator("[data-submit]")).toBeDisabled();
    await expect(page.locator("[data-loading] a[href='tel:+14178818828']")).toBeVisible();
    await ctx.close();
  });

  test("on localhost it shows the preview message and sends nothing to Central Forms", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (r) => requests.push(r.url()));
    await page.route(/google|googletagmanager|gstatic/, (r) => r.abort());
    await page.goto("/contact/");
    await expect(page.locator("[data-submit]")).toBeEnabled();
    await page.fill("#cf-first", "Test");
    await page.fill("#cf-last", "Visitor");
    await page.fill("#cf-email", "test@example.com");
    await page.fill("#cf-message", "Test, please ignore");
    await page.click("[data-submit]");
    await expect(page.locator("[data-status]")).toHaveText("Preview: form not sent");
    await page.waitForTimeout(300);
    expect(requests.filter((u) => u.includes("forms.fluidframemarketing.com") || u.includes("/api/"))).toEqual([]);
    // Input is kept.
    await expect(page.locator("#cf-message")).toHaveValue("Test, please ignore");
  });

  test("asks for a phone or an email before doing anything", async ({ page }) => {
    await page.route(/google|googletagmanager|gstatic/, (r) => r.abort());
    await page.goto("/contact/");
    await page.fill("#cf-message", "hello");
    await page.click("[data-submit]");
    await expect(page.locator("[data-status]")).toContainText("Please check the fields");
    await expect(page.locator("[data-status] a[href='tel:+14178818828']")).toBeVisible();
  });
});

test.describe("contact map facade", () => {
  // Short viewport so the map starts below the fold.
  test.use({ viewport: { width: 1280, height: 480 } });

  test("makes no Google Maps request on load, then loads after a scroll", async ({ page }) => {
    const maps: string[] = [];
    page.on("request", (r) => isGoogleMaps(r.url()) && maps.push(r.url()));
    await page.route(GOOGLE_MAPS, (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<html><body>map</body></html>" }));
    await page.goto("/contact/", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    expect(maps).toEqual([]);
    await expect(page.locator("[data-map-facade] iframe")).toHaveCount(0);
    await page.mouse.wheel(0, 900);
    await expect(page.locator("[data-map-facade] iframe")).toHaveCount(1);
    await expect.poll(() => maps.length).toBeGreaterThan(0);
    expect(maps[0]).toContain("google.com/maps/embed");
    expect(maps[0]).toContain("2d-93.2618564!3d37.1883738");
  });

  test("loads the map on click", async ({ page }) => {
    await page.route(GOOGLE_MAPS, (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<html><body>map</body></html>" }));
    await page.goto("/contact/", { waitUntil: "networkidle" });
    await expect(page.locator("[data-map-facade] iframe")).toHaveCount(0);
    // A click on the facade (no scroll, no pointer movement) loads it too.
    await page.locator("[data-map-load]").dispatchEvent("click");
    await expect(page.locator("[data-map-facade] iframe")).toHaveCount(1);
  });

  test("reserves the map height so nothing shifts when the iframe arrives", async ({ page }) => {
    await page.route(GOOGLE_MAPS, (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<html><body>map</body></html>" }));
    await page.goto("/contact/", { waitUntil: "networkidle" });
    const before = await page.locator("[data-map-facade]").boundingBox();
    await page.mouse.wheel(0, 300);
    await expect(page.locator("[data-map-facade] iframe")).toHaveCount(1);
    const after = await page.locator("[data-map-facade]").boundingBox();
    expect(before!.height).toBe(450);
    expect(after!.height).toBe(450);
  });
});
