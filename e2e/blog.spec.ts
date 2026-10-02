import { test, expect, type Page } from "@playwright/test";

declare global {
  interface Window {
    __todoShareCalls?: number;
  }
}

const BYLINE = "TODO Engineering content team";

const POSTS = [
  {
    slug: "design-engineer-evolution",
    title: "The design engineer, evolving",
  },
  {
    slug: "tool-off-week",
    title: "Tool-off week",
  },
  {
    slug: "readygo-deep-dive",
    title: "ReadyGo: the next lap",
  },
  {
    slug: "repdaily-our-first-time",
    title: "RepDaily: counting was the easy part",
  },
] as const;

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

async function gridColumnCount(page: Page) {
  return page.locator("#blog-notes-grid").evaluate((el) => {
    const columns = getComputedStyle(el).gridTemplateColumns;
    return columns.split(" ").filter(Boolean).length;
  });
}

test.describe("blog loop", () => {
  test("top nav Blog reaches HQ notes index and articles render", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await visit(page, "/home");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", {
      name: "Blog",
    }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(
      page.getByRole("heading", { name: "Notes from the factory.", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("NOTES", { exact: true })).toBeVisible();
    await expect(page.locator("#blog-count")).toHaveText("4 notes");
    await expect(page.locator("#blog-featured-row")).toBeVisible();
    await expect(page.locator("#blog-featured-row #blog-sandbox")).toBeVisible();
    await expect(page.locator("#blog-sandbox-row")).toBeVisible();
    await expect(page.locator("#blog-sandbox-sibling")).toBeVisible();
    await expect(page.locator('#blog-sandbox-row [data-blog-poll="talk-next"]')).toBeVisible();
    // 4 total − featured − sandbox sibling = 2 note cards; page size covers the pool.
    await expect(page.locator("#blog-notes-grid a")).toHaveCount(2);
    // Featured poll only — grid poll inserts after note N that is past the 2-card pool.
    await expect(page.locator("[data-blog-poll]")).toHaveCount(1);
    await expect(page.getByRole("button", { name: "More" })).toHaveCount(0);
    await expect(page.getByText(/\/\/ \d+m/).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "View all" })).toHaveCount(0);
    await expect(page.locator(".blog-orb, #blog-orbs-root")).toHaveCount(0);
    await expect(page.getByText(/Notes from the floor/)).toHaveCount(0);

    for (const post of POSTS) {
      await visit(page, "/blog");
      await page.getByRole("link", { name: new RegExp(post.title) }).click();
      await expect(page).toHaveURL(new RegExp(`/blog/${post.slug}$`), {
        timeout: 15_000,
      });
      await expect(
        page.getByRole("heading", { name: post.title, level: 1 }),
      ).toBeVisible();
      await expect(page.getByText(BYLINE, { exact: true }).first()).toBeVisible();
      await expect(page.getByText(/\/\/ \d+m/)).toBeVisible();
      await expect(page.locator("time").first()).toBeVisible();
      await page
        .locator("article")
        .getByRole("navigation", { name: "Breadcrumb" })
        .getByRole("link", { name: "Blog" })
        .click();
      await expect(page).toHaveURL(/\/blog$/, { timeout: 20_000 });
    }
  });

  test("pills filter the grid and count", async ({ page }) => {
    await visit(page, "/blog");
    await page.getByRole("button", { name: "Deep Cuts" }).click();
    await expect(page.locator("#blog-count")).toHaveText("1 notes");
    await expect(page.locator("#blog-featured")).toContainText("Tool-off week");
    // Single note is featured; no sibling/grid; polls hidden.
    await expect(page.locator("#blog-notes-grid")).toHaveCount(0);
    await expect(page.locator("#blog-sandbox-sibling")).toHaveCount(0);
    await expect(page.locator("[data-blog-poll]")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "More" })).toHaveCount(0);

    await page.getByRole("button", { name: "Projects" }).click();
    await expect(page.locator("#blog-count")).toHaveText("2 notes");
    await expect(page.locator("#blog-featured")).toContainText(
      "RepDaily: counting was the easy part",
    );
    await expect(page.locator("#blog-sandbox-sibling")).toBeVisible();
    await expect(page.locator("#blog-notes-grid")).toHaveCount(0);
    await expect(page.locator("[data-blog-poll]")).toHaveCount(0);

    await page.getByRole("button", { name: "All" }).click();
    await expect(page.locator("#blog-count")).toHaveText("4 notes");
    await expect(page.locator("#blog-notes-grid a")).toHaveCount(2);
    await expect(page.locator("[data-blog-poll]")).toHaveCount(1);
  });

  test("category titles use distinct colours that follow Spray", async ({
    page,
  }) => {
    await visit(page, "/blog");
    await page.evaluate(() => localStorage.removeItem("todo-spray"));
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForHydration(page);

    // SprayProvider applies category tokens on mount; wait until root inline
    // style is set so pill/badge aren't mid-race against static CSS defaults.
    await expect
      .poll(
        () =>
          page.evaluate(() =>
            document.documentElement.style
              .getPropertyValue("--blog-cat-projects")
              .trim(),
          ),
        { timeout: 15_000 },
      )
      .not.toBe("");

    const before = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        projects: style.getPropertyValue("--blog-cat-projects").trim(),
        leaps: style.getPropertyValue("--blog-cat-leaps").trim(),
        agents: style.getPropertyValue("--blog-cat-agents").trim(),
        deepCuts: style.getPropertyValue("--blog-cat-deep-cuts").trim(),
      };
    });
    expect(new Set(Object.values(before)).size).toBe(4);

    // Filter pills transition color over 400ms when Spray tokens apply; wait
    // until pill and badge resolved colors match.
    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const pill = document.querySelector(
              'button[data-category="projects"]',
            ) as HTMLElement | null;
            const badge = document.querySelector(
              '[data-category-label="projects"]',
            ) as HTMLElement | null;
            if (!pill || !badge) return false;
            return (
              getComputedStyle(pill).color === getComputedStyle(badge).color
            );
          }),
        { timeout: 15_000 },
      )
      .toBe(true);

    const spray = page.getByRole("button", {
      name: "Spray a new accessible colour palette",
    });
    await expect(async () => {
      await spray.click();
      const next = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--blog-cat-projects")
          .trim(),
      );
      expect(next).not.toBe(before.projects);
    }).toPass({ timeout: 15_000 });
  });

  test("More stays hidden when the note pool fits one page", async ({
    page,
  }) => {
    await visit(page, "/blog");
    // 4 total − featured − sandbox sibling = 2 note cards (≤ page size).
    await expect(page.locator("#blog-notes-grid a")).toHaveCount(2);
    await expect(page.getByRole("button", { name: "More" })).toHaveCount(0);
  });

  test("poll tiles lock a vote in localStorage and show percent bars", async ({
    page,
  }) => {
    await visit(page, "/blog");
    await page.evaluate(() => {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("todo-blog-poll:")) {
          localStorage.removeItem(key);
        }
      }
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForHydration(page);

    const poll = page.locator('[data-blog-poll="talk-next"]');
    await expect(poll).toBeVisible();
    await poll.getByRole("radio", { name: "AI" }).click();
    await expect(poll.getByText(/%/).first()).toBeVisible();
    await expect(poll.getByRole("radio")).toHaveCount(0);

    const stored = await page.evaluate(() =>
      localStorage.getItem("todo-blog-poll:talk-next"),
    );
    expect(stored).toContain("ai");

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForHydration(page);
    await expect(
      page.locator('[data-blog-poll="talk-next"]').getByText(/%/).first(),
    ).toBeVisible();
    await expect(
      page.locator('[data-blog-poll="talk-next"]').getByRole("radio"),
    ).toHaveCount(0);
  });

  test("featured+sandbox and poll+sibling sit side-by-side on desktop", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await visit(page, "/blog");

    const featuredRow = page.locator("#blog-featured-row");
    await expect(featuredRow).toBeVisible();
    await expect(page.locator("#blog-featured")).toBeVisible();
    await expect(page.locator("#blog-featured-row #blog-sandbox")).toBeVisible();
    const featuredCols = await featuredRow.evaluate((el) =>
      getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length,
    );
    expect(featuredCols).toBe(2);

    const secondaryRow = page.locator("#blog-sandbox-row");
    await expect(secondaryRow).toBeVisible();
    await expect(
      page.locator('#blog-sandbox-row [data-blog-poll="talk-next"]'),
    ).toBeVisible();
    await expect(page.locator("#blog-sandbox-sibling")).toBeVisible();
    const secondaryCols = await secondaryRow.evaluate((el) =>
      getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length,
    );
    expect(secondaryCols).toBe(2);
  });

  test("sandbox starts on click-to-play and stays HTML-safe", async ({
    page,
  }) => {
    await visit(page, "/blog");
    const sandbox = page.locator("#blog-sandbox");
    await expect(sandbox.getByText("sandbox.ballpool")).toBeVisible();
    await expect(sandbox.getByText("STANDBY")).toBeVisible();
    await expect(sandbox.locator("canvas")).toHaveCount(0);
    await expect(page.locator("#blog-notes-grid a")).toHaveCount(2);

    await sandbox.getByRole("button", { name: "CLICK TO PLAY" }).click();
    await expect(sandbox.locator("canvas")).toBeVisible({ timeout: 15_000 });
    await expect(sandbox.getByText("LIVE")).toBeVisible();
    await expect(sandbox.getByRole("button", { name: "CLICK TO PLAY" })).toHaveCount(
      0,
    );
    await expect(page.locator("#blog-notes-grid a")).toHaveCount(2);
  });

  test("sandbox tank follows Spray tokens before play", async ({ page }) => {
    await visit(page, "/blog");
    await page.evaluate(() => localStorage.removeItem("todo-spray"));
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForHydration(page);

    const tank = page.locator("#blog-sandbox [data-blog-sandbox-stage]");
    const before = await tank.evaluate((el) => getComputedStyle(el).backgroundColor);

    await page.getByRole("button", {
      name: "Spray a new accessible colour palette",
    }).click();

    await expect
      .poll(async () => tank.evaluate((el) => getComputedStyle(el).backgroundColor))
      .not.toBe(before);
  });

  test("live sandbox follows Spray tokens", async ({ page }) => {
    await visit(page, "/blog");
    await page.evaluate(() => localStorage.removeItem("todo-spray"));
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForHydration(page);

    const sandbox = page.locator("#blog-sandbox");
    await sandbox.getByRole("button", { name: "CLICK TO PLAY" }).click();
    await expect(sandbox.locator("canvas")).toBeVisible({ timeout: 15_000 });

    const before = await sandbox
      .locator("canvas")
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    await page.getByRole("button", {
      name: "Spray a new accessible colour palette",
    }).click();

    await expect
      .poll(async () =>
        sandbox.locator("canvas").evaluate((el) => getComputedStyle(el).backgroundColor),
      )
      .not.toBe(before);
  });

  test("sandbox play works at a mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit(page, "/blog");
    const sandbox = page.locator("#blog-sandbox");
    await sandbox.getByRole("button", { name: "CLICK TO PLAY" }).click();
    await expect(sandbox.locator("canvas")).toBeVisible({ timeout: 15_000 });
    await expect(sandbox.getByText("LIVE")).toBeVisible();
    const box = await sandbox.locator("[data-blog-sandbox-stage]").boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width / box!.height).toBeGreaterThan(1.6);
    expect(box!.width / box!.height).toBeLessThan(1.9);
  });

  test("sandbox stays static when reduced motion is preferred", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await visit(page, "/blog");
    const sandbox = page.locator("#blog-sandbox");
    await expect(sandbox.getByText("STANDBY")).toBeVisible();
    await expect(sandbox.getByText("Playground paused")).toBeVisible();
    await expect(
      sandbox.getByRole("button", { name: "CLICK TO PLAY" }),
    ).toHaveCount(0);
    await expect(sandbox.locator("canvas")).toHaveCount(0);
    await expect(page.locator("#blog-notes-grid a")).toHaveCount(2);
  });

  test("desktop notes grid is 3 columns and mobile is 1", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await visit(page, "/blog");
    await expect(page.locator("#blog-notes-grid a")).toHaveCount(2);
    expect(await gridColumnCount(page)).toBe(3);

    await page.setViewportSize({ width: 390, height: 844 });
    expect(await gridColumnCount(page)).toBe(1);
  });

  test("mobile landing shows HQ chrome and menu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit(page, "/blog");
    await expect(
      page.getByRole("heading", { name: "Notes from the factory.", level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "More" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "View all" })).toHaveCount(0);
    await expect(page.getByText(/Notes from the floor/)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  });

  test("card links reach the matching slug", async ({ page }) => {
    test.setTimeout(60_000);
    for (const post of POSTS) {
      await visit(page, "/blog");
      await page.locator(`a[href="/blog/${post.slug}"]`).first().click();
      await expect(page).toHaveURL(new RegExp(`/blog/${post.slug}$`), {
        timeout: 15_000,
      });
    }
  });

  test("note cards take keyboard focus", async ({ page }) => {
    await visit(page, "/blog");
    const card = page.locator("#blog-featured a").first();
    await card.focus();
    await expect(card).toBeFocused();
  });

  test("featured note stacks a 16:9 crop of the 2400×1260 master", async ({
    page,
  }) => {
    await visit(page, "/blog");
    const frame = page.locator("#blog-featured-frame");
    await expect(frame).toBeVisible();
    await expect(frame.locator("img")).toHaveAttribute(
      "src",
      /repdaily-our-first-time\.webp/,
    );
    const box = await frame.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width / box!.height).toBeCloseTo(16 / 9, 1);

    const title = page.locator("#blog-featured h2");
    await expect(title).toHaveText("RepDaily: counting was the easy part");
    await expect(title).toHaveClass(/line-clamp-2/);
    await expect(page.locator("#blog-featured h2 + p")).toHaveClass(
      /line-clamp-3/,
    );
  });

  test("/blog/all redirects to the notes index", async ({ page }) => {
    await page.goto("/blog/all", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/blog$/);
    await expect(
      page.getByRole("heading", { name: "Notes from the factory.", level: 1 }),
    ).toBeVisible();
  });

  test("copy link and rating thank-you lock on each stub", async ({
    page,
    context,
  }) => {
    test.setTimeout(90_000);
    page.setDefaultNavigationTimeout(60_000);
    await visit(page, `/blog/${POSTS[0].slug}`);
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: new URL(page.url()).origin,
    });

    for (const post of POSTS) {
      await visit(page, `/blog/${post.slug}`);
      await page.evaluate((slug) => {
        window.localStorage.removeItem(`todo-blog-rate:${slug}`);
      }, post.slug);
      await visit(page, `/blog/${post.slug}`);
      await expect(page.getByText(BYLINE, { exact: true }).first()).toBeVisible();
      await expect(page.getByText(/\/\/ \d+m/)).toBeVisible();

      await page.getByRole("button", { name: "Copy link" }).click();
      await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");
      expect(copied).toBe(canonical);

      await page.getByRole("button", { name: "Good" }).click();
      await expect(page.getByText("Thanks — that's noted.")).toBeVisible();
      await expect(page.getByRole("button", { name: "Fine" })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Boring" })).toHaveCount(0);

      await visit(page, `/blog/${post.slug}`);
      await expect(page.getByText("Thanks — that's noted.")).toBeVisible();
      await expect(page.getByRole("button", { name: "Good" })).toHaveCount(0);
    }
  });

  test("share uses the native sheet when the browser can share", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", {
        configurable: true,
        writable: true,
        value: async () => {
          window.__todoShareCalls = (window.__todoShareCalls ?? 0) + 1;
        },
      });
    });
    await visit(page, `/blog/${POSTS[0].slug}`);
    const share = page.getByRole("button", { name: "Share", exact: true });
    await expect(share).toBeVisible();
    await share.click();
    await expect
      .poll(async () =>
        page.evaluate(() => window.__todoShareCalls ?? 0),
      )
      .toBe(1);
    await expect(page.getByRole("button", { name: "Copied" })).toHaveCount(0);
  });

  test("Share stays hidden when navigator.share is missing", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", {
        configurable: true,
        writable: true,
        value: undefined,
      });
    });
    await visit(page, `/blog/${POSTS[0].slug}`);
    await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Share", exact: true }),
    ).toHaveCount(0);
  });

  test("article page follows HQ section order with writer band and book closer", async ({
    page,
  }) => {
    await visit(page, `/blog/${POSTS[0].slug}`);
    const article = page.locator("article");

    const crumb = article.getByRole("navigation", { name: "Breadcrumb" });
    await expect(crumb.getByRole("link", { name: "Blog" })).toHaveAttribute(
      "href",
      "/blog",
    );
    await expect(crumb).toContainText(POSTS[0].title);
    await expect(
      article.getByRole("heading", { name: POSTS[0].title, level: 1 }),
    ).toBeVisible();
    await expect(article.getByText(BYLINE).first()).toBeVisible();
    const hero = article.locator("#blog-post-hero");
    await expect(hero).toBeVisible();
    await expect(hero.locator("img")).toHaveAttribute(
      "src",
      /og-default/,
    );
    await expect(article.locator(".blog-note-callout")).toBeVisible();
    await expect(article.getByText(/MOCK — outline only/)).toBeVisible();
    await expect(article.locator("#blog-adjacent-nav")).toBeVisible();
    await expect(article.locator("#blog-writer-band")).toBeVisible();
    await expect(article.locator("#blog-writer-band")).toContainText(BYLINE);
    await expect(article.getByText(/Growth Editor/)).toHaveCount(0);
    await expect(
      page.getByRole("region", { name: "Work together" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Book a call", exact: true }),
    ).toHaveAttribute("href", "/book");
    await expect(page.getByText(/Ashley|Dan/)).toHaveCount(0);

    const tops = await page.evaluate(() => {
      const top = (el: Element | null) =>
        el ? el.getBoundingClientRect().top : Number.POSITIVE_INFINITY;
      return {
        crumb: top(document.querySelector("#blog-breadcrumb")),
        title: top(document.querySelector("article h1")),
        byline: top(document.querySelector("article time")),
        hero: top(document.querySelector("#blog-post-hero")),
        quote: top(document.querySelector("#blog-article-body .blog-note-callout")),
        adjacent: top(document.querySelector("#blog-adjacent-nav")),
        writer: top(document.querySelector("#blog-writer-band")),
        share: top(document.querySelector("#blog-post-feedback")),
        book: top(document.querySelector('[aria-label="Work together"]')),
      };
    });

    expect(tops.crumb).toBeLessThan(tops.title);
    expect(tops.title).toBeLessThan(tops.byline);
    expect(tops.byline).toBeLessThan(tops.hero);
    expect(tops.hero).toBeLessThan(tops.quote);
    expect(tops.quote).toBeLessThan(tops.adjacent);
    expect(tops.adjacent).toBeLessThan(tops.writer);
    expect(tops.writer).toBeLessThan(tops.share);
    expect(tops.share).toBeLessThan(tops.book);

    const body = page.locator("#blog-article-body");
    const bodyWidth = await body.evaluate((el) => el.getBoundingClientRect().width);
    expect(bodyWidth).toBeGreaterThanOrEqual(640);
    expect(bodyWidth).toBeLessThanOrEqual(720);
    await expect(body).toHaveCSS("font-size", "19px");
  });

  test("pilot note renders craft blocks and larger prose", async ({ page }) => {
    await visit(page, "/blog/repdaily-our-first-time");
    const body = page.locator("#blog-article-body");
    await expect(body.locator(".blog-note-callout")).toHaveCount(3);
    await expect(body.locator(".blog-note-callout .type-label").first()).toHaveText(
      "NOTE",
    );
    await expect(
      body.getByRole("heading", { name: "The brief we thought we had" }),
    ).toBeVisible();
    await expect(body).toHaveClass(/type-prose/);
  });

  test("adjacent nav hides the missing end on newest and oldest notes", async ({
    page,
  }) => {
    await visit(page, "/blog/design-engineer-evolution");
    const newest = page.locator("#blog-adjacent-nav");
    await expect(newest.getByText("PREV", { exact: true })).toBeVisible();
    await expect(newest.getByText("NEXT", { exact: true })).toHaveCount(0);

    await visit(page, "/blog/repdaily-our-first-time");
    const oldest = page.locator("#blog-adjacent-nav");
    await expect(oldest.getByText("NEXT", { exact: true })).toBeVisible();
    await expect(oldest.getByText("PREV", { exact: true })).toHaveCount(0);

    await visit(page, "/blog/tool-off-week");
    const mid = page.locator("#blog-adjacent-nav");
    await expect(mid.getByText("PREV", { exact: true })).toBeVisible();
    await expect(mid.getByText("NEXT", { exact: true })).toBeVisible();
  });

  test("article without hero uses the default OG image in the slot and head", async ({
    page,
  }) => {
    await visit(page, `/blog/${POSTS[0].slug}`);
    const hero = page.locator("#blog-post-hero");
    await expect(hero.locator("img")).toBeVisible();
    await expect(hero.locator("img")).toHaveAttribute("src", /og-default/);

    const box = await hero.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width / box!.height).toBeCloseTo(16 / 9, 1);

    const og = page.locator('meta[property="og:image"]');
    await expect(og).toHaveAttribute("content", /\/blog\/og-default\.png/);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      "content",
      /\/blog\/og-default\.png/,
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
  });

  test("article page stays readable at a mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit(page, `/blog/${POSTS[0].slug}`);
    const article = page.locator("article");

    await expect(
      article.getByRole("navigation", { name: "Breadcrumb" }),
    ).toContainText(POSTS[0].title);
    await expect(
      article.getByRole("heading", { name: POSTS[0].title, level: 1 }),
    ).toBeVisible();
    await expect(article.locator(".blog-note-callout")).toBeVisible();
    const hero = page.locator("#blog-post-hero");
    await expect(hero.locator("img")).toBeVisible();
    await expect(hero.locator("img")).toHaveAttribute("src", /og-default/);
    const box = await hero.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width / box!.height).toBeCloseTo(16 / 9, 1);
    await expect(
      page.getByRole("link", { name: "Book a call", exact: true }),
    ).toBeVisible();

    const body = page.locator("#blog-article-body");
    const bodyWidth = await body.evaluate((el) => el.getBoundingClientRect().width);
    expect(bodyWidth).toBeGreaterThanOrEqual(280);
    expect(bodyWidth).toBeLessThanOrEqual(390);
    await expect(body).toHaveCSS("font-size", "18px");
  });

  test("nav breadcrumb appears after the h1 and progress tracks the article", async ({
    page,
  }) => {
    await visit(page, `/blog/${POSTS[0].slug}`);
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
    await expect(navCrumb.getByRole("link", { name: "Blog" })).toHaveAttribute(
      "href",
      "/blog",
    );

    const before = await page.locator("[data-nav-progress]").evaluate((el) => {
      return new DOMMatrix(getComputedStyle(el).transform).a;
    });
    await page.evaluate(() => window.scrollBy(0, 900));
    await expect
      .poll(async () =>
        page.locator("[data-nav-progress]").evaluate((el) => {
          return new DOMMatrix(getComputedStyle(el).transform).a;
        }),
      )
      .toBeGreaterThan(before);
  });

  test("featured card stacks at 768 and the byline is not truncated", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await visit(page, "/blog");
    const row = page.locator("#blog-featured-row");
    const columns = await row.evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns,
    );
    expect(columns.split(" ").filter(Boolean)).toHaveLength(1);

    const byline = row.getByText(BYLINE);
    await expect(byline).toBeVisible();
    const clipped = await byline.evaluate((el) => el.scrollWidth > el.clientWidth + 1);
    expect(clipped).toBe(false);

    const stage = page.locator("#blog-featured-row [data-blog-sandbox-stage]");
    const stageBox = await stage.boundingBox();
    const play = await stage.getByRole("button", { name: "CLICK TO PLAY" }).boundingBox();
    expect(stageBox).not.toBeNull();
    expect(play).not.toBeNull();
    expect(stageBox!.height).toBeGreaterThanOrEqual(320);
    expect(play!.y).toBeGreaterThan(stageBox!.y + 24);
    expect(play!.y + play!.height).toBeLessThan(stageBox!.y + stageBox!.height - 24);
  });
});
