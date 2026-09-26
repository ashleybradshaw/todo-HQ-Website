import { test, expect } from "@playwright/test";

const SPRAY_NAME = "Spray a new accessible colour palette";

const PRIMARY_ORDER = [
  { name: "About", href: "/about" },
  { name: "Work", href: "/work" },
  { name: "Blog", href: "/blog" },
  { name: "Home", href: "/home" },
  { name: "Book a call", href: "/book" },
] as const;

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

test("mobile Spray and menu have at least 12px between them", async ({
  page,
}) => {
  await page.goto("/home", { waitUntil: "domcontentloaded" });

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

test("gateway Ready? Yes/No landing uses NavOverlay trigger, not factory Spray", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("button", { name: SPRAY_NAME })).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Primary", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Landing footer" }),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Open menu" }).click();
  const primary = page.getByRole("navigation", { name: "Primary", exact: true });
  await expect(primary).toBeVisible();
  const links = primary.getByRole("link");
  await expect(links).toHaveCount(PRIMARY_ORDER.length);
  for (let i = 0; i < PRIMARY_ORDER.length; i += 1) {
    await expect(links.nth(i)).toHaveText(PRIMARY_ORDER[i].name);
    await expect(links.nth(i)).toHaveAttribute("href", PRIMARY_ORDER[i].href);
  }

  // Close control sits above the overlay; Esc also dismisses.
  await page.getByRole("button", { name: "Close menu" }).click();
  await expect(primary).toHaveCount(0);
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(primary).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(primary).toHaveCount(0);
});
