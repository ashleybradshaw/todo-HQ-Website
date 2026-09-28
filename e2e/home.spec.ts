import { test, expect } from "@playwright/test";

test.describe("/home IDE", () => {
  test("hero, strip, tabs, project cards, empty reply, pipeline.log", async ({
    page,
  }) => {
    await page.goto("/home", { waitUntil: "domcontentloaded" });

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Hard problems in.");
    await expect(page.locator("h1")).toContainText("Working software out.");
    await expect(page.locator("h1")).not.toHaveClass(/sr-only/);

    await expect(page.getByRole("heading", { name: "Apps" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Systems" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Hardware" }),
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: "About the factory" }),
    ).toHaveAttribute("href", "/about");
    await expect(
      page.getByRole("link", { name: "See the work" }),
    ).toHaveAttribute("href", "/work");

    await expect(
      page.getByRole("tab", { name: /README\.md/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("tab", { name: /services\.md/ }),
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: /book\.ts/ })).toBeVisible();

    await expect(page.getByText(/pipeline\.log/)).toBeVisible();
    await expect(page.getByText(/v1\.5/)).toBeVisible();

    await expect(
      page.getByRole("link", { name: "View" }).nth(0),
    ).toHaveAttribute("href", "/work/repdaily");
    await expect(
      page.getByRole("link", { name: "View" }).nth(1),
    ).toHaveAttribute("href", "/work/readygo");
    await expect(
      page.getByRole("link", { name: "View" }).nth(2),
    ).toHaveAttribute("href", "/work/contentic");

    await page.getByRole("tab", { name: /book\.ts/ }).click();
    await expect(page.locator("[data-discovery-reply]")).toHaveCount(0);
  });

  test("language follows active tab at desktop width", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/home", { waitUntil: "domcontentloaded" });

    const status = page.locator(".ide-boot-status");
    await status.scrollIntoViewIfNeeded();
    await expect(status.getByText("Markdown", { exact: true })).toBeVisible();

    const bookTab = page.getByRole("tab", { name: /book\.ts/ });
    await bookTab.scrollIntoViewIfNeeded();
    await bookTab.click();
    await expect(status.getByText("TypeScript", { exact: true })).toBeVisible();

    const servicesTab = page.getByRole("tab", { name: /services\.md/ });
    await servicesTab.scrollIntoViewIfNeeded();
    await servicesTab.click();
    await expect(status.getByText("Markdown", { exact: true })).toBeVisible();
  });

  test("SSR has one visible h1 and README source gutter", async ({
    request,
  }) => {
    const res = await request.get("/home");
    expect(res.ok()).toBeTruthy();
    const html = await res.text();

    const h1Matches = html.match(/<h1\b[^>]*>/gi) ?? [];
    expect(h1Matches.length).toBe(1);
    expect(html).toContain("Hard problems in.");
    expect(html).toContain("Working");
    expect(html).toContain("software out.");
    expect(html).not.toMatch(/<h1[^>]*sr-only/);
    expect(html).toContain('data-readme-source="true"');
    expect(html).toContain("ide-readme-gutter");
    expect(html).toContain("pipeline.log");
    expect(html).toContain("v1.5");
  });
});
