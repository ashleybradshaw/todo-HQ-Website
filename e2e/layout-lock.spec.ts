import { expect, test } from "@playwright/test";

const INDEX = ["/about", "/work", "/blog", "/book"] as const;

const VIEWPORTS = [
  {
    width: 1440,
    height: 900,
    title: "60px",
    frame: 1336,
    hero: 752,
    copy: 688,
  },
  {
    width: 390,
    height: 844,
    title: "36px",
    frame: 342,
    hero: 342,
    copy: null,
  },
] as const;

async function noHorizontalOverflow(page: import("@playwright/test").Page) {
  const fits = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth <= root.clientWidth;
  });
  expect(fits).toBe(true);
}

for (const viewport of VIEWPORTS) {
  test.describe(`layout lock ${viewport.width}`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
    });

    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
    });

    test("index heroes, frames, and overflow", async ({ page }) => {
      const tops: number[] = [];

      for (const path of INDEX) {
        await page.goto(path, { waitUntil: "domcontentloaded" });
        await page.evaluate(() => document.fonts.ready);

        const label = page.locator("[data-hero-label]");
        await expect(label).toBeVisible();
        expect((await label.innerText()).trim().startsWith("//")).toBe(true);
        await expect(label).toHaveCSS("font-size", "12px");

        const title = page.locator("[data-hero-title]");
        await expect(title).toHaveCSS("font-size", viewport.title);
        await expect(title).toHaveCSS("font-weight", "700");
        const family = await title.evaluate(
          (el) => getComputedStyle(el).fontFamily,
        );
        expect(family.toLowerCase()).toContain("unbounded");
        await expect(title).toHaveCSS("text-align", "center");

        const sub = page.locator("[data-hero-sub]");
        await expect(sub).toHaveCSS("font-size", "16px");
        await expect(sub).toHaveCSS("max-width", "592px");
        await expect(sub).toHaveCSS("text-align", "center");

        tops.push(
          await label.evaluate((el) => el.getBoundingClientRect().top),
        );

        const frames = page.locator("[data-ide-frame]");
        if (path === "/work" || path === "/blog") {
          await expect(frames).toHaveCount(1);
          const width = await frames.evaluate((el) =>
            Math.round(el.getBoundingClientRect().width),
          );
          expect(width).toBe(viewport.frame);
        } else {
          await expect(frames).toHaveCount(0);
        }

        await expect(page.locator("main .type-prose")).toHaveCount(0);

        await noHorizontalOverflow(page);
      }

      if (viewport.width === 1440) {
        for (const path of ["/about", "/book"] as const) {
          await page.goto(path, { waitUntil: "domcontentloaded" });
          const aligned = await page.evaluate(() => {
            const hero = document.querySelector("[data-hero]");
            const hairline = hero?.querySelector("[data-hero-label] .border-t");
            const bodyRule = [...document.querySelectorAll("main .border-t")].find(
              (el) => hero != null && !hero.contains(el),
            );
            if (!(hairline instanceof HTMLElement) || !(bodyRule instanceof HTMLElement)) {
              return null;
            }
            const hair = hairline.getBoundingClientRect();
            const body = bodyRule.getBoundingClientRect();
            return {
              width: Math.round(hair.width),
              hairLeft: Math.round(hair.left),
              bodyLeft: Math.round(body.left),
            };
          });
          expect(aligned).not.toBeNull();
          expect(aligned!.width).toBe(688);
          expect(aligned!.hairLeft).toBe(aligned!.bodyLeft);
        }
      }

      const first = tops[0];
      expect(Math.abs(first - 112)).toBeLessThanOrEqual(1);
      for (const top of tops) {
        expect(Math.abs(top - first)).toBeLessThanOrEqual(1);
      }
    });

    test("detail heroes, copy, media, and overflow", async ({ page }) => {
      await page.goto("/work/repdaily", { waitUntil: "domcontentloaded" });
      await page.evaluate(() => document.fonts.ready);
      await expectDetailTitle(page);
      await expectDetailHero(page, viewport.hero);
      await expect(page.locator("[data-detail-copy]")).toHaveCSS("font-size", "16px");
      await expect(page.locator("main .type-prose")).toHaveCount(0);
      if (viewport.copy) {
        await expectCopyWidth(page, viewport.copy);
        await expectMediaWidths(page);
      }
      await noHorizontalOverflow(page);

      await page.goto("/blog/repdaily-our-first-time", {
        waitUntil: "domcontentloaded",
      });
      await page.evaluate(() => document.fonts.ready);
      await expectDetailTitle(page);
      await expectDetailHero(page, viewport.hero);
      const headingFamily = await page
        .locator("#blog-article-body > h2")
        .first()
        .evaluate((el) => getComputedStyle(el).fontFamily);
      expect(headingFamily.toLowerCase()).toContain("unbounded");
      if (viewport.copy) {
        await expectCopyWidth(page, viewport.copy);
        const inlineWidths = await page
          .locator("main figure.blog-article-figure")
          .evaluateAll((nodes) =>
            nodes.map((node) => Math.round(node.getBoundingClientRect().width)),
          );
        for (const inlineWidth of inlineWidths) {
          expect(inlineWidth).toBe(688);
        }
      }
      await noHorizontalOverflow(page);
    });
  });
}

async function expectDetailTitle(page: import("@playwright/test").Page) {
  const title = page.locator("main h1");
  await expect(title).toHaveCount(1);
  await expect(title).toHaveCSS("text-align", "center");
}

async function expectDetailHero(
  page: import("@playwright/test").Page,
  width: number,
) {
  const hero = page.locator("[data-detail-hero]");
  await expect(hero).toHaveCount(1);
  const box = await hero.boundingBox();
  expect(box).not.toBeNull();
  expect(Math.round(box!.width)).toBe(width);
  expect(Math.abs(box!.width / box!.height - 16 / 9)).toBeLessThanOrEqual(0.01);
}

async function expectCopyWidth(
  page: import("@playwright/test").Page,
  width: number,
) {
  const copy = page.locator("[data-detail-copy]");
  await expect(copy).toHaveCount(1);
  const actual = await copy.evaluate((el) =>
    Math.round(el.getBoundingClientRect().width),
  );
  expect(actual).toBe(width);
}

async function expectMediaWidths(page: import("@playwright/test").Page) {
  const widths = await page
    .locator("main figure:has([data-ratio])")
    .evaluateAll((nodes) =>
      nodes.map((node) => Math.round(node.getBoundingClientRect().width)),
    );
  expect(widths.length).toBeGreaterThan(0);
  for (const width of widths) {
    expect([752, 368]).toContain(width);
  }
}
