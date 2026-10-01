import { test, expect } from "@playwright/test";

const PAGE_LINKS = [
  "Open RepDaily",
  "Open ReadyGo",
  "Open Contentic",
] as const;

test.describe("work roster", () => {
  test("index shows five cards with three Open links and two pipeline cards", async ({
    page,
  }) => {
    await page.goto("/work", { waitUntil: "domcontentloaded" });

    const cards = page.locator("article[aria-label]");
    await expect(cards).toHaveCount(5);

    for (const label of PAGE_LINKS) {
      await expect(page.getByRole("link", { name: label })).toHaveCount(1);
    }

    const tower = page.locator('article[aria-label="The Tower"]');
    const erg = page.locator('article[aria-label="ErgTrainer"]');
    await expect(tower).toBeVisible();
    await expect(erg).toBeVisible();
    await expect(tower.getByRole("link")).toHaveCount(0);
    await expect(erg.getByRole("link")).toHaveCount(0);
  });

  test("pipeline and deleted slugs 404", async ({ request }) => {
    for (const slug of ["the-tower", "ergtrainer", "northstar"]) {
      const res = await request.get(`/work/${slug}`);
      expect(res.status()).toBe(404);
    }
  });

  test("unknown route returns 404 with heading and ways back", async ({
    page,
  }) => {
    const res = await page.goto("/this-route-does-not-exist", {
      waitUntil: "domcontentloaded",
    });
    expect(res?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: /this page didn't ship/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Go home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "See the work" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Book the team" })).toBeVisible();
  });

  test("sitemap includes three work detail URLs only", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();

    const workLocs = [...body.matchAll(/<loc>([^<]*\/work\/[^<]+)<\/loc>/g)].map(
      (match) => match[1],
    );
    expect(workLocs).toHaveLength(3);
    expect(body).toContain("/work/repdaily");
    expect(body).toContain("/work/readygo");
    expect(body).toContain("/work/contentic");
    expect(body).not.toContain("/work/the-tower");
    expect(body).not.toContain("/work/ergtrainer");
    expect(body).not.toContain("/work/northstar");
  });

  test("prev/next links skip pipeline projects", async ({ page }) => {
    await page.goto("/work/readygo", { waitUntil: "domcontentloaded" });
    const nav = page.getByRole("navigation", { name: "Adjacent projects" });
    await expect(nav.getByRole("link", { name: "← RepDaily" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Contentic →" })).toBeVisible();
    await expect(nav.getByRole("link", { name: /Tower|ErgTrainer/i })).toHaveCount(
      0,
    );
  });

  test("nav breadcrumb appears after the h1 and progress tracks the essay", async ({
    page,
  }) => {
    await page.goto("/work/repdaily", { waitUntil: "domcontentloaded" });
    const navCrumb = page.locator("header [data-nav-breadcrumb]");
    await expect(navCrumb).toHaveCount(1);
    await expect(navCrumb).toHaveCSS("opacity", "0");
    const menuBefore = await page.evaluate(() => {
      const header = document.querySelector("header")!.getBoundingClientRect();
      const menu = document
        .querySelector('header button[aria-label="Open menu"]')!
        .getBoundingClientRect();
      return {
        gap: header.right - menu.right,
        height: header.height,
      };
    });

    await page.locator("h1").evaluate((el) => {
      const bottom = el.getBoundingClientRect().bottom + window.scrollY;
      window.scrollTo(0, bottom + 8);
    });
    await expect(navCrumb).toHaveCSS("opacity", "1");
    const menuAfter = await page.evaluate(() => {
      const header = document.querySelector("header")!.getBoundingClientRect();
      const menu = document
        .querySelector('header button[aria-label="Open menu"]')!
        .getBoundingClientRect();
      return {
        gap: header.right - menu.right,
        height: header.height,
      };
    });
    expect(Math.abs(menuAfter.gap - menuBefore.gap)).toBeLessThan(2);
    expect(Math.abs(menuAfter.height - menuBefore.height)).toBeLessThan(2);
    await expect(navCrumb.getByRole("link", { name: "Work" })).toHaveAttribute(
      "href",
      "/work",
    );

    const before = await page.locator("[data-nav-progress]").evaluate((el) => {
      return new DOMMatrix(getComputedStyle(el).transform).a;
    });
    await page.evaluate(() => window.scrollBy(0, 700));
    await expect
      .poll(async () =>
        page.locator("[data-nav-progress]").evaluate((el) => {
          return new DOMMatrix(getComputedStyle(el).transform).a;
        }),
      )
      .toBeGreaterThan(before);
  });
});
