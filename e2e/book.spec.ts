import { test, expect, type Page, type Locator } from "@playwright/test";

async function visit(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

function quickPanel(page: Page) {
  return page.getByRole("tabpanel", { name: "Quick note" });
}

function briefPanel(page: Page) {
  return page.getByRole("tabpanel", { name: "Pre-brief" });
}

function linkUrl(panel: Locator, n: number) {
  return panel.getByRole("textbox", { name: `Link ${n}` });
}

async function openBrief(page: Page) {
  await visit(page, "/book#brief");
  await expect(
    page.getByRole("heading", { name: /scope it before we talk/i }),
  ).toBeVisible();
}

async function goToPlannerStep3(page: Page) {
  await openBrief(page);
  const brief = briefPanel(page);
  await brief.getByRole("button", { name: "Coffee call (15 min)" }).click();
  await brief.getByRole("button", { name: "Next →" }).click();
  await brief.getByRole("button", { name: "As soon as possible" }).click();
  await brief.getByRole("button", { name: "Under £25k" }).click();
  await brief.getByRole("button", { name: "Build the app" }).click();
  await brief.getByRole("button", { name: "Next →" }).click();
  await expect(brief.getByText(/links \(optional\)/i)).toBeVisible();
}

test.describe("book links and draft panel", () => {
  test("tab switch keeps Quick note and Pre-brief data; name and email are shared", async ({
    page,
  }) => {
    await visit(page, "/book#quick");
    const quick = quickPanel(page);
    const brief = briefPanel(page);

    await quick.getByRole("textbox", { name: "Name", exact: true }).fill("Sam Lead");
    await quick.getByRole("textbox", { name: "Email", exact: true }).click();
    await expect(quick.getByRole("textbox", { name: "Name", exact: true })).toHaveValue(
      "Sam Lead",
    );
    await quick.getByRole("textbox", { name: "Email", exact: true }).fill("sam@example.com");
    await quick
      .getByLabel("How did you hear about us?")
      .selectOption("referral");
    await quick.getByRole("textbox", { name: "Message" }).fill(
      "Need a production app for our sales team this quarter.",
    );
    await expect(quick.getByRole("textbox", { name: "Name", exact: true })).toHaveValue(
      "Sam Lead",
    );
    await expect(quick.getByRole("textbox", { name: "Email", exact: true })).toHaveValue(
      "sam@example.com",
    );
    await expect(quick.getByRole("textbox", { name: "Message" })).toHaveValue(
      "Need a production app for our sales team this quarter.",
    );

    await page.getByRole("tab", { name: "Pre-brief" }).click();
    await expect(
      page.getByRole("heading", { name: /scope it before we talk/i }),
    ).toBeVisible();
    await brief.getByRole("button", { name: "Full build" }).click();

    await page.getByRole("tab", { name: "Quick note" }).click();
    await expect(
      page.getByRole("heading", { name: /start with a short note/i }),
    ).toBeVisible();
    await expect(quick.getByRole("textbox", { name: "Message" })).toHaveValue(
      "Need a production app for our sales team this quarter.",
    );
    await expect(quick.getByRole("textbox", { name: "Name", exact: true })).toHaveValue(
      "Sam Lead",
    );
    await expect(quick.getByRole("textbox", { name: "Email", exact: true })).toHaveValue(
      "sam@example.com",
    );

    await page.getByRole("tab", { name: "Pre-brief" }).click();
    await expect(
      brief.getByRole("button", { name: "Full build" }),
    ).toHaveAttribute("aria-pressed", "true");
    await brief.getByRole("button", { name: "Next →" }).click();
    await brief.getByRole("button", { name: "As soon as possible" }).click();
    await brief.getByRole("button", { name: "Under £25k" }).click();
    await brief.getByRole("button", { name: "Build the app" }).click();
    await brief.getByRole("button", { name: "Next →" }).click();
    await brief
      .getByLabel("What has to ship")
      .fill("Ship the intake app for the sales team this quarter.");
    await brief.getByRole("button", { name: "Not yet" }).click();
    await brief.getByRole("button", { name: "Next →" }).click();
    await expect(brief.getByRole("textbox", { name: "Name", exact: true })).toHaveValue(
      "Sam Lead",
    );
    await expect(brief.getByRole("textbox", { name: "Email", exact: true })).toHaveValue(
      "sam@example.com",
    );
  });

  test("Quick note adds links to 3 then shows 3 links max", async ({ page }) => {
    await visit(page, "/book#quick");
    const quick = quickPanel(page);
    await expect(
      page.getByRole("heading", { name: /start with a short note/i }),
    ).toBeVisible();
    await expect(quick.getByText(/up to 3\./i)).toBeVisible();

    const add = quick.getByRole("button", { name: "+ Add link" });
    await expect(add).toBeVisible();
    await add.click();
    await add.click();
    await expect(add).toHaveCount(0);
    await expect(quick.getByText("3 links max")).toBeVisible();
    await expect(quick.getByRole("button", { name: "Remove link 1" })).toBeVisible();
  });

  test("add links to max, remove a row, reject invalid and javascript URLs", async ({
    page,
  }) => {
    await goToPlannerStep3(page);
    const brief = briefPanel(page);
    await expect(brief.getByText(/up to 5\./i)).toBeVisible();

    const add = brief.getByRole("button", { name: "+ Add link" });
    for (let i = 0; i < 4; i++) {
      await add.click();
    }
    await expect(add).toHaveCount(0);
    await expect(brief.getByText("5 links max")).toBeVisible();

    await brief.getByRole("button", { name: "Remove link 5" }).click();
    await expect(brief.getByRole("button", { name: "+ Add link" })).toBeVisible();
    await expect(brief.getByText("5 links max")).toHaveCount(0);

    const firstUrl = linkUrl(brief, 1);
    await firstUrl.fill("ftp://files.example.com/deck");
    await firstUrl.press("Tab");
    await expect(
      brief.getByRole("alert").filter({ hasText: /enter a web link/i }),
    ).toBeVisible();

    await firstUrl.fill("javascript:alert(1)");
    await firstUrl.press("Tab");
    await expect(
      brief.getByRole("alert").filter({ hasText: /enter a web link/i }),
    ).toBeVisible();
    await expect(firstUrl).toHaveAttribute("aria-invalid", "true");
  });

  test("copy address shows Copied then reverts", async ({ browser, baseURL }) => {
    // Own context so clipboard permission does not poison Chrome autofill in later tests
    // (email fill was clearing the name field via autofill input events).
    const context = await browser.newContext({
      baseURL: baseURL ?? "http://localhost:3000",
    });
    const page = await context.newPage();
    await visit(page, "/book#quick");
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: new URL(page.url()).origin,
    });

    const copyBtn = quickPanel(page).getByRole("button", { name: "Copy address" });
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(
      page.getByRole("button", { name: "Copied ✓" }),
    ).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe("team@todo.engineering");
    await expect(quickPanel(page).getByRole("button", { name: "Copy address" })).toBeVisible({
      timeout: 3000,
    });
    await context.close();
  });

  test("long brief plus five long links shows too-long panel without mailto", async ({
    page,
  }) => {
    await goToPlannerStep3(page);
    const brief = briefPanel(page);

    const briefText = "word ".repeat(200).trim().slice(0, 1000);
    await brief.getByLabel("What has to ship").fill(briefText);
    await brief.getByRole("button", { name: "Yes" }).click();

    const longHost = "https://example.com/" + "a".repeat(280);
    await linkUrl(brief, 1).fill(longHost);
    await linkUrl(brief, 1).blur();

    const add = brief.getByRole("button", { name: "+ Add link" });
    for (let i = 2; i <= 5; i++) {
      await add.click();
      const url = `https://example.com/${i}/` + "b".repeat(270);
      await linkUrl(brief, i).fill(url);
      await linkUrl(brief, i).blur();
    }

    await brief.getByRole("button", { name: "Next →" }).click();
    await brief.getByRole("textbox", { name: "Name", exact: true }).fill("Alex Tester");
    await brief.getByRole("textbox", { name: "Email", exact: true }).fill("alex@example.com");
    await brief
      .getByLabel("How did you hear about us?")
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

    await brief.getByRole("button", { name: "Create email draft →" }).click();

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

  test("invalid link on step 3 Next stays on step 3 and focuses the bad field", async ({
    page,
  }) => {
    await goToPlannerStep3(page);
    const brief = briefPanel(page);

    await brief.getByLabel("What has to ship").fill("Ship the intake app for the sales team this quarter.");
    await brief.getByRole("button", { name: "Yes" }).click();
    await linkUrl(brief, 1).fill("ftp://files.example.com/deck");

    await brief.getByRole("button", { name: "Next →" }).click();

    await expect(
      brief.getByRole("heading", { name: /the brief/i }),
    ).toBeVisible();
    await expect(brief.getByRole("heading", { name: /^Contact$/ })).toHaveCount(0);
    await expect(
      brief.getByRole("alert").filter({ hasText: /enter a web link/i }),
    ).toBeVisible();
    await expect(linkUrl(brief, 1)).toBeFocused();
  });

  test("Pre-brief subject includes name and copy draft announces Draft copied", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL: baseURL ?? "http://localhost:3000",
    });
    const page = await context.newPage();
    await goToPlannerStep3(page);
    const brief = briefPanel(page);

    await brief.getByLabel("What has to ship").fill("Ship the intake app for the sales team this quarter.");
    await brief.getByRole("button", { name: "Not yet" }).click();
    await brief.getByRole("button", { name: "Next →" }).click();

    await brief.getByRole("textbox", { name: "Name", exact: true }).fill("Jordan Lee");
    await brief.getByRole("textbox", { name: "Email", exact: true }).fill("jordan@example.com");
    await brief
      .getByLabel("How did you hear about us?")
      .selectOption("referral");

    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: new URL(page.url()).origin,
    });

    await page.evaluate(() => {
      try {
        Object.defineProperty(window, "location", {
          configurable: true,
          value: new Proxy(window.location, {
            set(target, prop, value) {
              if (prop === "href" && String(value).startsWith("mailto:")) {
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
        // Panel assertion still runs if proxy fails.
      }
    });

    await brief.getByRole("button", { name: "Create email draft →" }).click();

    await expect(
      page.getByRole("heading", { name: /your draft is ready/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Copy draft text" }).click();
    await expect(page.getByText("Draft copied")).toBeAttached();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain("Subject: Pre-brief //TODO — Jordan Lee");
    expect(copied).not.toMatch(/Email address copied/i);
    await context.close();
  });
});
