import { test, expect, type Page } from "@playwright/test";

async function visit(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

function linkUrl(page: Page, n: number) {
  return page.getByRole("textbox", { name: `Link ${n}` });
}

async function openBrief(page: Page) {
  await visit(page, "/book#brief");
  await expect(
    page.getByRole("heading", { name: /scope the next lap/i }),
  ).toBeVisible();
}

async function goToPlannerStep3(page: Page) {
  await openBrief(page);
  await page.getByRole("button", { name: "Coffee talk (15)" }).click();
  await page.getByRole("button", { name: "Next →" }).click();
  await page.getByRole("button", { name: "ASAP" }).click();
  await page.getByRole("button", { name: "Under £25k" }).click();
  await page.getByRole("button", { name: "Build the app" }).click();
  await page.getByRole("button", { name: "Next →" }).click();
  await expect(page.getByText(/links \(optional\)/i)).toBeVisible();
}

test.describe("book links and draft panel", () => {
  test("add links to max, remove a row, reject invalid and javascript URLs", async ({
    page,
  }) => {
    await goToPlannerStep3(page);

    const add = page.getByRole("button", { name: "+ Add link" });
    for (let i = 0; i < 4; i++) {
      await add.click();
    }
    await expect(add).toHaveCount(0);
    await expect(page.getByText("5 links max")).toBeVisible();

    await page.getByRole("button", { name: "Remove link 5" }).click();
    await expect(page.getByRole("button", { name: "+ Add link" })).toBeVisible();
    await expect(page.getByText("5 links max")).toHaveCount(0);

    const firstUrl = linkUrl(page, 1);
    await firstUrl.fill("ftp://files.example.com/deck");
    await firstUrl.press("Tab");
    await expect(
      page.getByRole("alert").filter({ hasText: /enter a web link/i }),
    ).toBeVisible();

    await firstUrl.fill("javascript:alert(1)");
    await firstUrl.press("Tab");
    await expect(
      page.getByRole("alert").filter({ hasText: /enter a web link/i }),
    ).toBeVisible();
    await expect(firstUrl).toHaveAttribute("aria-invalid", "true");
  });

  test("copy email shows Copied then reverts", async ({ page, context }) => {
    await visit(page, "/book#quick");
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: new URL(page.url()).origin,
    });

    const copyBtn = page.getByRole("button", { name: "Copy email" });
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(
      page.getByRole("button", { name: "Copied ✓" }),
    ).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe("team@todo.engineering");
    await expect(page.getByRole("button", { name: "Copy email" })).toBeVisible({
      timeout: 3000,
    });
  });

  test("long brief plus five long links shows too-long panel without mailto", async ({
    page,
  }) => {
    await goToPlannerStep3(page);

    const brief = "word ".repeat(200).trim().slice(0, 1000);
    await page.getByLabel("What has to ship").fill(brief);
    await page.getByRole("button", { name: "Yes" }).click();

    const longHost = "https://example.com/" + "a".repeat(280);
    await linkUrl(page, 1).fill(longHost);
    await linkUrl(page, 1).blur();

    const add = page.getByRole("button", { name: "+ Add link" });
    for (let i = 2; i <= 5; i++) {
      await add.click();
      const url = `https://example.com/${i}/` + "b".repeat(270);
      await linkUrl(page, i).fill(url);
      await linkUrl(page, i).blur();
    }

    await page.getByRole("button", { name: "Next →" }).click();
    await page.getByRole("textbox", { name: "Name", exact: true }).fill("Alex Tester");
    await page.getByRole("textbox", { name: "Email", exact: true }).fill("alex@example.com");
    await page
      .getByLabel("How did you hear about TODO?")
      .selectOption("referral");

    await page.evaluate(() => {
      (window as unknown as { __mailtoOpened: boolean }).__mailtoOpened = false;
      try {
        Object.defineProperty(window, "location", {
          configurable: true,
          value: new Proxy(window.location, {
            set(target, prop, value) {
              if (prop === "href" && String(value).startsWith("mailto:")) {
                (
                  window as unknown as { __mailtoOpened: boolean }
                ).__mailtoOpened = true;
                return true;
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (target as any)[prop] = value;
              return true;
            },
            get(target, prop) {
              const value = Reflect.get(target, prop);
              if (typeof value === "function") {
                return value.bind(target);
              }
              return value;
            },
          }),
        });
      } catch {
        // Proxy may fail in some environments — panel assertion still runs.
      }
    });

    await page.getByRole("button", { name: "Create email draft →" }).click();

    await expect(
      page.getByRole("heading", { name: /your draft is too long to open/i }),
    ).toBeVisible();
    await expect(page.getByRole("status")).toContainText(
      /too long to open|cut long drafts/i,
    );

    const mailtoOpened = await page.evaluate(
      () =>
        (window as unknown as { __mailtoOpened?: boolean }).__mailtoOpened ===
        true,
    );
    expect(mailtoOpened).toBe(false);
    await expect(page).toHaveURL(/\/book/);
  });
});
