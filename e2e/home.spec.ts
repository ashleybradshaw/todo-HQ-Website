import { test, expect } from "@playwright/test";

test.describe("/home IDE", () => {
  test("hero, strip, tabs, project cards, empty reply, shift.log", async ({
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

    await expect(
      page.getByRole("region", { name: /Production line/i }),
    ).toContainText("shift.log");
    await expect(page.getByText(/v1\.5/)).toBeVisible();
    const telemetry = page.getByRole("region", { name: /Factory telemetry/i });
    await expect(telemetry).toBeVisible();
    await expect(telemetry).toContainText("telemetry");
    await expect(
      page.getByRole("region", { name: "Projects" }),
    ).toContainText("on the line");
    await expect(
      page.locator(".ide-boot-status").getByText(/checkpoint/),
    ).toBeVisible();

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
    await expect(status.getByText("Markdown", { exact: true })).toBeVisible();

    const bookTab = page.getByRole("tab", { name: /book\.ts/ });
    await expect(async () => {
      await bookTab.click();
      await expect(bookTab).toHaveAttribute("aria-selected", "true");
    }).toPass();
    await expect(status.getByText("TypeScript", { exact: true })).toBeVisible();

    const servicesTab = page.getByRole("tab", { name: /services\.md/ });
    await expect(async () => {
      await servicesTab.click();
      await expect(servicesTab).toHaveAttribute("aria-selected", "true");
    }).toPass();
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
    expect(html).toContain("shift.log");
    expect(html).toContain("v1.5");
  });

  test("fresh session: bones hide editor, reveal ends done, hero draws first", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      try {
        sessionStorage.removeItem("todo-ide-boot-v8");
        sessionStorage.removeItem("todo-ide-boot-force");
      } catch {
        /* private mode */
      }
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/home", { waitUntil: "domcontentloaded" });

    const stage = page.locator(".ide-boot-stage[data-ide-boot]");
    await expect(stage).toHaveCount(1);

    // Hero should draw independently of IDE boot.
    await expect(page.locator("[data-hero-drawn]")).toHaveAttribute(
      "data-hero-drawn",
      "1",
      { timeout: 5000 },
    );

    // Force replay so we reliably catch bones (IDE may already be past trigger).
    await page.evaluate(() => {
      sessionStorage.setItem("todo-ide-boot-force", "1");
      window.dispatchEvent(new Event("todo-ide-boot-replay"));
    });

    await expect(stage).toHaveAttribute("data-ide-boot", "bones", {
      timeout: 2000,
    });

    const opacity = await page.locator(".ide-boot-editor").evaluate((el) => {
      return window.getComputedStyle(el).opacity;
    });
    expect(Number(opacity)).toBe(0);

    await expect(stage).toHaveAttribute("data-ide-boot", "done", {
      timeout: 8000,
    });
    await expect(page.locator("[data-ide-reveal]")).toHaveAttribute(
      "data-ide-reveal",
      "done",
      { timeout: 8000 },
    );

    await expect(
      page.getByRole("tab", { name: /README\.md/ }),
    ).toBeVisible();
  });

  test("mobile README wraps without collapse or sideways scroll", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/home", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("button", { name: /Show all \d+ lines/i }),
    ).toHaveCount(0);

    const readme = page.locator('[data-readme-source="true"]');
    await expect(readme).toBeVisible();
    await expect(readme.locator("[data-line-index]")).toHaveCount(30);

    await page.locator(".ide-window").evaluate((el) => {
      el.scrollIntoView({ block: "start" });
    });

    const overflow = await page.locator(".ide-window").evaluate((root) => {
      if (root.scrollWidth > root.clientWidth + 1) {
        return {
          overflow: true,
          where: "ide-window",
          scrollWidth: root.scrollWidth,
          clientWidth: root.clientWidth,
        };
      }
      for (const node of root.querySelectorAll("*")) {
        const el = node as HTMLElement;
        if (el.classList.contains("sr-only")) continue;
        const cs = window.getComputedStyle(el);
        // Clipped / scroll containers (truncate, overflow-x hidden) are fine.
        if (
          cs.overflowX === "hidden" ||
          cs.overflowX === "clip" ||
          cs.overflowX === "auto" ||
          cs.overflowX === "scroll" ||
          cs.overflow === "hidden"
        ) {
          continue;
        }
        if (el.scrollWidth > el.clientWidth + 1) {
          return {
            overflow: true,
            where: "unclipped",
            tag: el.tagName,
            className: el.className?.toString?.().slice(0, 80) ?? "",
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
          };
        }
      }
      // README lines themselves must not scroll sideways.
      for (const pre of root.querySelectorAll(".ide-readme-line-pre")) {
        const el = pre as HTMLElement;
        if (el.scrollWidth > el.clientWidth + 1) {
          return {
            overflow: true,
            where: "readme-pre",
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
          };
        }
      }
      return { overflow: false };
    });
    expect(overflow).toEqual({ overflow: false });

    const wrap = await page.locator('[data-line-index="10"] pre').evaluate((pre) => {
      const cs = getComputedStyle(pre);
      return {
        whiteSpace: cs.whiteSpace,
        overflowWrap: cs.overflowWrap,
      };
    });
    expect(wrap.whiteSpace).toMatch(/pre-wrap/);
    expect(wrap.overflowWrap).toBe("anywhere");

    // Heading "## " must not overlap the title (space is real, no absolute mark).
    // Also: headings must not use hanging indent (bullet-only).
    const headingGaps = await readme.evaluate((root) => {
      const rows = root.querySelectorAll(".ide-readme-heading");
      const gaps: {
        markRight: number;
        textLeft: number;
        ok: boolean;
        textIndent: string;
      }[] = [];
      for (const row of rows) {
        const mark = row.querySelector("[data-readme-heading-mark]");
        const text = row.querySelector("[data-readme-heading-text]");
        const pre = row.querySelector(".ide-readme-line-pre");
        if (!mark || !text || !pre) continue;
        const mr = mark.getBoundingClientRect();
        const tr = text.getBoundingClientRect();
        gaps.push({
          markRight: Math.round(mr.right * 100) / 100,
          textLeft: Math.round(tr.left * 100) / 100,
          ok: mr.right <= tr.left + 0.5,
          textIndent: getComputedStyle(pre).textIndent,
        });
      }
      return gaps;
    });
    expect(headingGaps.length).toBeGreaterThan(0);
    for (const gap of headingGaps) {
      expect(gap.ok).toBe(true);
      expect(gap.textIndent).toBe("0px");
    }
  });

  test("README stays visible when JavaScript is off", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/home", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByText(
        "Two engineers and a set of AI agents, running one small product factory.",
      ),
    ).toBeVisible();
    const editorOpacity = await page
      .locator(".ide-boot-editor")
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(editorOpacity).toBe("1");
    const armed = await page.evaluate(() =>
      document.documentElement.hasAttribute("data-ide-first"),
    );
    expect(armed).toBe(false);
    await context.close();
  });

  test("pipeline log fits the fixed slot at 768 and 390", async ({ page }) => {
    for (const width of [768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/home", { waitUntil: "domcontentloaded" });
      const stage = page.getByRole("button", { name: /THE_MVP/ });
      await expect(stage).toBeVisible();
      await stage.click();
      const slot = page.locator("[data-pipeline-detail]").filter({
        hasText: "App + homepage + light marketing",
      });
      await expect(slot).toBeVisible();
      const fit = await slot.evaluate((el) => {
        const line = [...el.querySelectorAll("p")].find((node) =>
          node.textContent?.includes("App + homepage + light marketing"),
        );
        const lineHeight = line
          ? Number.parseFloat(getComputedStyle(line).lineHeight)
          : 16;
        const lines = line
          ? Math.round(line.getBoundingClientRect().height / lineHeight)
          : 0;
        return {
          lines,
          overflows: el.scrollHeight > el.clientHeight + 1,
        };
      });
      expect(fit.lines).toBeGreaterThan(0);
      expect(fit.lines).toBeLessThanOrEqual(2);
      expect(fit.overflows).toBe(false);
    }
  });
});
