import { test, expect } from "@playwright/test";
import { routes } from "../../src/lib/routes";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const;

function headerBox(page: import("@playwright/test").Page) {
  return page.locator("header.site-header").boundingBox();
}

for (const vp of viewports) {
  test.describe(`header scroll ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const r of routes) {
      test(`${r.path}: hides on the way down and returns on the way up`, async ({ page }) => {
        await page.goto(r.path, { waitUntil: "networkidle" });
        const header = page.locator("header.site-header");
        await expect(header).toBeVisible();

        let box = await headerBox(page);
        expect(box).not.toBeNull();
        expect(box!.y).toBeGreaterThanOrEqual(0);
        expect(box!.y).toBeLessThan(20);

        await page.evaluate(() => window.scrollTo(0, 600));
        await page.waitForTimeout(350);
        box = await headerBox(page);
        expect(!box || box.y + box.height <= 1).toBe(true);

        await page.evaluate(() => window.scrollTo(0, 550));
        await page.waitForTimeout(350);
        box = await headerBox(page);
        expect(box).not.toBeNull();
        expect(box!.y).toBeGreaterThanOrEqual(-1);
        expect(box!.y).toBeLessThan(20);
        expect(box!.height).toBeGreaterThan(40);

        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(350);
        box = await headerBox(page);
        expect(box).not.toBeNull();
        expect(box!.y).toBeGreaterThanOrEqual(0);
        expect(box!.y).toBeLessThan(20);
      });
    }
  });
}

test("mobile menu stays open and the header stays visible while scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("details.nav-mobile summary").click();
  await expect(page.locator("details.nav-mobile nav")).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(350);
  const box = await headerBox(page);
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(-1);
  await expect(page.locator("details.nav-mobile nav")).toBeVisible();
});
