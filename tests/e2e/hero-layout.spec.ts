import { test, expect } from "@playwright/test";

const mobileWidths = [360, 390, 430] as const;
const desktopWidths = [1024, 1280, 1440, 1920, 2560] as const;

test.describe("homepage hero", () => {
  for (const width of mobileWidths) {
    test(`mobile ${width}px: storefront behind the text, no products, buttons above the call bar`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/", { waitUntil: "networkidle" });

      const products = page.locator(".hero-products");
      await expect(products).toHaveCount(1);
      await expect(products).toBeHidden();

      const hero = page.locator(".hero");
      const pad = await hero.evaluate((el) => getComputedStyle(el).paddingTop);
      expect(pad).toBe("0px");

      const h1 = page.locator("#hero-title");
      const header = page.locator("header");
      const h1Box = await h1.boundingBox();
      const headerBox = await header.boundingBox();
      expect(h1Box).not.toBeNull();
      expect(headerBox).not.toBeNull();
      // The headline starts under the header, not below a product photo strip.
      expect(h1Box!.y).toBeGreaterThan(headerBox!.y + headerBox!.height - 1);
      expect(h1Box!.y).toBeLessThan(headerBox!.y + headerBox!.height + 220);

      const call = page.locator(".call-bar");
      const callBox = await call.boundingBox();
      expect(callBox).not.toBeNull();
      for (const btn of await page.locator(".hero .ctas a").all()) {
        const box = await btn.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(-1);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
        expect(box!.y).toBeGreaterThanOrEqual(0);
        expect(box!.y + box!.height).toBeLessThanOrEqual(callBox!.y + 1);
      }

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  for (const width of desktopWidths) {
    test(`desktop ${width}px: centred pair, product group fully inside the viewport`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/", { waitUntil: "networkidle" });

      const products = page.locator(".hero-products");
      await expect(products).toBeVisible();
      const fit = await products.evaluate((el) => getComputedStyle(el).objectFit);
      expect(fit).toBe("contain");

      const box = await products.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(-1);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
      expect(box!.width).toBeGreaterThan(200);
      expect(box!.height).toBeGreaterThan(80);

      const pair = await page.locator(".hero-in").boundingBox();
      expect(pair).not.toBeNull();
      expect(Math.abs(pair!.x + pair!.width / 2 - width / 2)).toBeLessThan(3);

      // 1024 is the desktop breakpoint. The about row below the hero is a fixed 1040px
      // grid from the existing page, so the scroll check starts at the widths in the spec.
      if (width >= 1280) {
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
      }
    });
  }
});
