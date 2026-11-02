import { test, expect } from "@playwright/test";
import { routes } from "../../src/lib/routes";
import { headerNav } from "../../src/data/site";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const;

for (const vp of viewports) {
  test.describe(`${vp.name} ${vp.width}px`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const r of routes) {
      test(`${r.path}: no horizontal scroll, one visible H1`, async ({ page }) => {
        await page.goto(r.path, { waitUntil: "networkidle" });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator("h1")).toBeVisible();
      });
    }
  });
}

test.describe("navigation", () => {
  test("desktop nav shows every link, in order", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const links = await page.locator("nav[aria-label='Primary'] a").evaluateAll((els) => els.map((e) => [e.textContent?.trim(), e.getAttribute("href")]));
    expect(links).toEqual(headerNav.map((n) => [n.label, n.path]));
    await expect(page.locator("details.nav-mobile")).toBeHidden();
  });

  test("mobile menu opens and has the same links as the desktop nav", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator("nav[aria-label='Primary']")).toBeHidden();
    const menu = page.locator("details.nav-mobile");
    await expect(menu.locator("nav")).toBeHidden();
    await menu.locator("summary").click();
    await expect(menu.locator("nav")).toBeVisible();
    const links = await menu.locator("nav a").evaluateAll((els) => els.map((e) => [e.textContent?.trim(), e.getAttribute("href")]));
    expect(links).toEqual(headerNav.map((n) => [n.label, n.path]));
    const box = await menu.locator("nav").boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  });

  test("works with JavaScript disabled", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await page.locator("details.nav-mobile summary").click();
    await expect(page.locator("details.nav-mobile nav")).toBeVisible();
    await ctx.close();
  });
});
