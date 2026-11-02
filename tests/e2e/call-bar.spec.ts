import { test, expect } from "@playwright/test";
import { site, stickyBar } from "../../src/data/site";

const pages = ["/", "/contact/"];

test.describe("mobile 390px: header and sticky call bar", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const path of pages) {
    test(`${path}: no phone pill, logo and hamburger share one row`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(page.locator("header a.phone-btn")).toBeHidden();
      await expect(page.locator("header a[href^='tel:']")).toHaveCount(1); // hidden desktop pill only
      const logo = await page.locator("header .logo").boundingBox();
      const burger = await page.locator("header details.nav-mobile summary").boundingBox();
      expect(logo!.x).toBeLessThan(60);
      expect(burger!.x + burger!.width).toBeGreaterThan(390 - 40);
      const logoMid = logo!.y + logo!.height / 2;
      const burgerMid = burger!.y + burger!.height / 2;
      expect(Math.abs(logoMid - burgerMid)).toBeLessThanOrEqual(1);
      expect(logo!.width).toBeGreaterThanOrEqual(200);
      expect(burger!.height).toBeGreaterThanOrEqual(44);
    });

    test(`${path}: menu has page links and no tel: link`, async ({ page }) => {
      await page.goto(path);
      await page.locator("details.nav-mobile summary").click();
      const nav = page.locator("details.nav-mobile nav");
      await expect(nav).toBeVisible();
      await expect(nav.locator("a[href^='tel:']")).toHaveCount(0);
      await expect(nav).not.toContainText(site.phone.display);
      await expect(nav.locator("a")).toHaveCount(5);
    });

    test(`${path}: call bar is visible, correct, and does not cover the last content`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      const bar = page.locator(".call-bar");
      await expect(bar).toBeVisible();
      expect(await bar.evaluate((el) => getComputedStyle(el).position)).toBe("fixed");
      const call = bar.locator(`a[href='${site.phone.tel}']`);
      const mail = bar.locator(`a[href='mailto:${site.email}']`);
      await expect(call).toHaveText(stickyBar.callLabel);
      await expect(mail).toHaveText(stickyBar.emailLabel);
      await expect(bar).not.toContainText(site.phone.display);
      expect(await call.getAttribute("aria-label")).toContain(site.phone.display);
      const [a, b] = [await call.boundingBox(), await mail.boundingBox()];
      expect(a!.height).toBeGreaterThanOrEqual(48);
      expect(b!.height).toBeGreaterThanOrEqual(48);
      expect(Math.abs(a!.width - b!.width)).toBeLessThanOrEqual(1);
      // Scrolled to the very end: the footer's last line sits above the bar, and so does the form's submit button.
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      const barTop = (await bar.boundingBox())!.y;
      const last = await page.evaluate(() => {
        const items = [...document.querySelectorAll(".site-footer *")].filter((e) => e.children.length === 0 && (e.textContent || "").trim());
        return Math.max(...items.map((e) => e.getBoundingClientRect().bottom));
      });
      expect(last).toBeLessThanOrEqual(barTop);
      const submit = page.locator("main button[type=submit]");
      if (await submit.count()) {
        await submit.scrollIntoViewIfNeeded();
        expect((await submit.boundingBox())!.y + (await submit.boundingBox())!.height).toBeLessThanOrEqual(barTop);
      }
    });
  }

  test("the bar comes after the .atf block in the source", async ({ page }) => {
    await page.goto("/");
    const order = await page.evaluate(() => {
      const atf = document.querySelector(".atf")!;
      const bar = document.querySelector(".call-bar")!;
      return !!(atf.compareDocumentPosition(bar) & Node.DOCUMENT_POSITION_FOLLOWING) && !atf.contains(bar);
    });
    expect(order).toBe(true);
  });
});

test.describe("desktop 1440px: bar hidden, header unchanged", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("no call bar; phone pill and nav stay in the header", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator(".call-bar")).toBeHidden();
    const pill = page.locator("header a.phone-btn");
    await expect(pill).toBeVisible();
    await expect(pill).toContainText(site.phone.display);
    await expect(page.locator("nav[aria-label='Primary']")).toBeVisible();
    await expect(page.locator("details.nav-mobile")).toBeHidden();
    const h = await page.locator("header.site-header").boundingBox();
    expect(h!.height).toBe(134);
  });
});
