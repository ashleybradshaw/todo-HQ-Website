import { test, expect } from "@playwright/test";

const SPRAY_NAME = "Spray a new accessible colour palette";

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

test("mobile Spray and menu have at least 12px between them", async ({
  page,
}) => {
  // Gap check on an inner PageShell route — /home is chrome-clean (Spray only).
  await page.goto("/about", { waitUntil: "domcontentloaded" });

  const spray = page.getByRole("button", { name: SPRAY_NAME });
  const menu = page.getByRole("button", { name: "Open menu" });

  await expect(spray).toBeVisible();
  await expect(menu).toBeVisible();

  const sprayBox = await spray.boundingBox();
  const menuBox = await menu.boundingBox();

  expect(sprayBox).not.toBeNull();
  expect(menuBox).not.toBeNull();

  const gap = menuBox!.x - (sprayBox!.x + sprayBox!.width);
  expect(gap).toBeGreaterThanOrEqual(12);
});

test("IDE home has Spray and no hamburger", async ({ page }) => {
  await page.goto("/home", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("button", { name: SPRAY_NAME }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(
    0,
  );
});
