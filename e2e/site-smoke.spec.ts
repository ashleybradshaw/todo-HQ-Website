import { test, expect, type Page } from "@playwright/test";

const SPRAY_NAME = "Spray a new accessible colour palette";
const BRAND_BG = "#E6E6FA";

async function visit(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

async function rootBackground(page: Page) {
  return page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--background")
      .trim()
      .toUpperCase(),
  );
}

test.describe("site smoke", () => {
  test("gateway has no Spray control", async ({ page }) => {
    await visit(page, "/");
    await expect(
      page.getByRole("button", { name: SPRAY_NAME }),
    ).toHaveCount(0);
  });

  test("inner factory routes load and expose Spray", async ({ page }) => {
    await visit(page, "/home");
    await expect(
      page.getByRole("button", { name: SPRAY_NAME }),
    ).toBeVisible();

    await visit(page, "/about");
    await expect(
      page.getByRole("heading", { name: /we build the entire factory/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: SPRAY_NAME }),
    ).toBeVisible();

    await visit(page, "/work");
    await expect(
      page.getByRole("heading", { name: /the work/i }),
    ).toBeVisible();

    await visit(page, "/book");
    await expect(
      page.getByRole("heading", { name: /bring the factory to the problem/i }),
    ).toBeVisible();
  });

  test("Spray changes inner tokens and gateway paints brand back", async ({
    page,
  }) => {
    await visit(page, "/home");
    await page.evaluate(() => localStorage.removeItem("todo-spray"));
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect
      .poll(async () =>
        page.evaluate(() =>
          document.documentElement.style.getPropertyValue("--background"),
        ),
      )
      .not.toBe("");

    const spray = page.getByRole("navigation", { name: "Primary" }).getByRole(
      "button",
      { name: SPRAY_NAME },
    );
    await expect(spray).toBeVisible();
    await spray.click();

    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem("todo-spray")))
      .toBeTruthy();

    expect(await rootBackground(page)).not.toBe(BRAND_BG);

    await visit(page, "/");
    await expect.poll(async () => rootBackground(page)).toBe(BRAND_BG);
  });
});
