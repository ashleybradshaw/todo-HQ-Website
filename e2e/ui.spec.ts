import { expect, test } from "@playwright/test";

const TYPE_TOKENS = [
  "type-display",
  "type-title",
  "type-heading",
  "type-subhead",
  "type-body",
  "type-prose",
  "type-body-sm",
  "type-meta",
  "type-caption",
  "type-label",
  "type-code",
] as const;

test.describe("ui spec", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/ui");
  });

  test("hero is centred and the page has one h1", async ({ page }) => {
    const hero = page.locator("[data-hero]").first();
    await expect(hero).toHaveCSS("text-align", "center");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Built to spec.");
  });

  test("type lists the live tokens", async ({ page }) => {
    const type = page.locator("#ui-type");
    for (const token of TYPE_TOKENS) {
      await expect(type.getByText(`.${token}`, { exact: true })).toBeVisible();
    }
    await expect(type.getByText(".work-stat-figure", { exact: true })).toBeVisible();
    await expect(type.locator(".article-copy > h2")).toBeVisible();
    await expect(type.locator(".article-copy > h3")).toBeVisible();
  });

  test("layout tracks replace the column grid", async ({ page }) => {
    await expect(
      page.locator("#ui-layout").getByRole("heading", {
        name: "Layout and tracks",
      }),
    ).toBeVisible();
  });

  test("live parts keep a single page heading", async ({ page }) => {
    for (const name of [
      "Heroes and headers",
      "Frames and media",
      "Work parts",
      "Blog and about",
    ]) {
      await expect(page.getByRole("heading", { name, level: 2 })).toBeVisible();
    }
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("[data-nav-breadcrumb]")).toHaveCount(0);
    await expect(page.locator("[data-nav-progress]")).toHaveCount(0);
    await expect(page.locator("[data-nav-trail-specimen]")).toBeVisible();
  });

  test("poll specimen does not store a vote", async ({ page }) => {
    const poll = page.locator("[data-blog-poll='ui-specimen-poll']");
    const option = poll.getByRole("radio").first();
    await expect(option).toBeDisabled();
    await option.click({ force: true });
    const stored = await page.evaluate(() =>
      window.localStorage.getItem("todo-blog-poll:ui-specimen-poll"),
    );
    expect(stored).toBeNull();
  });

  test("spec sections have no em dashes", async ({ page }) => {
    const sections = page.locator("section[id^='ui-']");
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const text = await sections.nth(i).innerText();
      expect(text, `section ${i}`).not.toContain("\u2014");
    }
  });
});
