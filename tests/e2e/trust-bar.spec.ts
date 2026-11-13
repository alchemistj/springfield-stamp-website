import { test, expect } from "@playwright/test";
import { routes } from "../../src/lib/routes";
import { site, trustBar } from "../../src/data/site";

test.describe("trust bar at 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const r of routes) {
    test(`${r.path} shows the trust bar once under the hero, with no horizontal scroll`, async ({ page }) => {
      await page.goto(r.path, { waitUntil: "networkidle" });

      const bar = page.locator(".trust-bar");
      await expect(bar).toHaveCount(1);

      const place = await page.evaluate(() => {
        const atf = document.querySelector(".atf");
        const hero = document.querySelector(".atf h1");
        const node = document.querySelector(".trust-bar");
        if (!atf || !hero || !node) return { afterAtf: false, outsideAtf: false, underHero: false };
        const following = Node.DOCUMENT_POSITION_FOLLOWING;
        return {
          afterAtf: (atf.compareDocumentPosition(node) & following) !== 0,
          outsideAtf: !atf.contains(node),
          underHero: (hero.compareDocumentPosition(node) & following) !== 0,
        };
      });
      expect(place.afterAtf).toBe(true);
      expect(place.outsideAtf).toBe(true);
      expect(place.underHero).toBe(true);

      for (const item of trustBar.line1) await expect(bar).toContainText(item);
      await expect(bar).toContainText(trustBar.place);
      await expect(bar).toContainText(trustBar.call);
      const link = bar.locator("a");
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute("href", site.phone.tel);
      await expect(link).toHaveText(site.phone.display);
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(48);
      expect(box!.width).toBeGreaterThanOrEqual(48);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
