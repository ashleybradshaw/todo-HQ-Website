import { test, expect, type Page } from "@playwright/test";

const SPRAY_NAME = "Spray a new accessible colour palette";
const BRAND_BG = "#DFDFFF";
const BRAND_FG = "#4545FF";

async function waitForHydration(page: Page) {
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll("button")].some((el) =>
        Object.keys(el).some((key) => key.startsWith("__react")),
      ),
    undefined,
    { timeout: 30_000 },
  );
}

async function visit(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await waitForHydration(page);
}

function expandHex(value: string) {
  const normalized = value.trim().toUpperCase();
  const short = /^#([0-9A-F])([0-9A-F])([0-9A-F])$/;
  const match = normalized.match(short);
  if (!match) {
    return normalized;
  }

  return `#${match[1]}${match[1]}${match[2]}${match[2]}${match[3]}${match[3]}`;
}

async function rootToken(page: Page, token: string) {
  const raw = await page.evaluate(
    (name) =>
      getComputedStyle(document.documentElement).getPropertyValue(name),
    token,
  );
  return expandHex(raw);
}

async function rootBackground(page: Page) {
  return rootToken(page, "--background");
}

test.describe("site smoke", () => {
  test("gateway has no Spray control", async ({ page }) => {
    await visit(page, "/");
    await expect(
      page.getByRole("button", { name: SPRAY_NAME }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("navigation", { name: "Primary", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("navigation", { name: "Landing footer" }),
    ).toHaveCount(0);
  });

  test("inner factory routes load and expose Spray", async ({ page }) => {
    await visit(page, "/home");
    await expect(
      page.getByRole("button", { name: SPRAY_NAME }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "//TODO Engineering" }),
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: /README\.md/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /services\.md/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /book\.ts/ })).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);

    await visit(page, "/about");
    await expect(
      page.getByRole("heading", {
        name: /we build apps, systems and hardware for hard/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: SPRAY_NAME }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();

    await visit(page, "/work");
    await expect(
      page.getByRole("heading", { name: /the work/i }),
    ).toBeVisible();

    await visit(page, "/book");
    await expect(
      page.getByRole("heading", { name: /bring us the hard problem/i }),
    ).toBeVisible();

    await visit(page, "/blog");
    await expect(page.getByRole("heading", { name: /\/\/ Blog/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: SPRAY_NAME }),
    ).toBeVisible();
  });

  test("Spray persists across client nav and resets on hard refresh", async ({
    page,
  }) => {
    await visit(page, "/home");
    await expect.poll(async () => rootBackground(page)).toBe(BRAND_BG);
    await expect.poll(async () => rootToken(page, "--foreground")).toBe(BRAND_FG);

    // SprayProvider must have applied brand tokens before click is meaningful.
    await expect
      .poll(
        () =>
          page.evaluate(() =>
            document.documentElement.style.getPropertyValue("--background").trim(),
          ),
        { timeout: 15_000 },
      )
      .not.toBe("");

    const spray = page.getByRole("button", { name: SPRAY_NAME });
    await expect(spray).toBeVisible();
    await expect(async () => {
      await spray.click();
      expect(await rootBackground(page)).not.toBe(BRAND_BG);
    }).toPass({ timeout: 15_000 });

    const sprayedBg = await rootBackground(page);
    await expect
      .poll(async () =>
        page.evaluate(() => localStorage.getItem("todo-spray")),
      )
      .toBeNull();

    // Client nav keeps React Spray state (full goto would remount).
    await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .getByRole("navigation", { name: "Primary", exact: true })
      .getByRole("link", { name: "About" })
      .click();
    await expect(page).toHaveURL(/\/about/);
    await expect.poll(async () => rootBackground(page)).toBe(sprayedBg);

    await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .getByRole("navigation", { name: "Primary", exact: true })
      .getByRole("link", { name: "Work" })
      .click();
    await expect(page).toHaveURL(/\/work/);
    await expect.poll(async () => rootBackground(page)).toBe(sprayedBg);

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForHydration(page);
    await expect.poll(async () => rootBackground(page)).toBe(BRAND_BG);
  });
});
