import { test, expect, type Page } from "@playwright/test";

declare global {
  interface Window {
    __todoShareCalls?: number;
  }
}

const POSTS = [
  {
    slug: "internal-software-factory",
    title: "The internal software factory",
    author: "Riley Chen",
  },
  {
    slug: "multi-agent-systems",
    title: "Multi-agent systems we actually run",
    author: "Jordan Hale",
  },
  {
    slug: "factory-roster",
    title: "Proof is in the roster",
    author: "Avery Nishimura",
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
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
      name: "Blog",
    }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole("heading", { name: "blog.index" })).toBeVisible();
    await expect(page.getByText("NOTES", { exact: true })).toBeVisible();
    await expect(page.locator("#blog-count")).toHaveText("10 notes");
    await expect(page.locator("#blog-notes-grid a")).toHaveCount(6);
    await expect(page.getByRole("button", { name: "More" })).toBeVisible();
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
      await expect(page.getByText(post.author, { exact: true }).first()).toBeVisible();
      await expect(page.getByText(/min read/)).toBeVisible();
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
    await expect(page.locator("#blog-count")).toHaveText("2 notes");
    await expect(page.locator("#blog-featured")).toContainText("The house system");
    await expect(page.locator("#blog-notes-grid a")).toHaveCount(1);
    await expect(page.getByRole("button", { name: "More" })).toHaveCount(0);

    await page.getByRole("button", { name: "Projects" }).click();
    await expect(page.locator("#blog-count")).toHaveText("4 notes");
    await expect(page.locator("#blog-featured")).toContainText(
      "Our first time",
    );
    await expect(page.locator("#blog-notes-grid a")).toHaveCount(3);

    await page.getByRole("button", { name: "All" }).click();
    await expect(page.locator("#blog-count")).toHaveText("10 notes");
    await expect(page.locator("#blog-notes-grid a")).toHaveCount(6);
  });

  test("category titles use distinct colours that follow Spray", async ({
    page,
  }) => {
    await visit(page, "/blog");
    await page.evaluate(() => localStorage.removeItem("todo-spray"));
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForHydration(page);

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

    const pillColor = await page
      .locator('button[data-category="projects"]')
      .evaluate((el) => getComputedStyle(el).color);
    const badgeColor = await page
      .locator('[data-category-label="projects"]')
      .first()
      .evaluate((el) => getComputedStyle(el).color);
    expect(badgeColor).toBe(pillColor);

    await page.getByRole("navigation", { name: "Primary" }).getByRole("button", {
      name: "Spray a new accessible colour palette",
    }).click();

    await expect
      .poll(async () =>
        page.evaluate(() =>
          getComputedStyle(document.documentElement)
            .getPropertyValue("--blog-cat-projects")
            .trim(),
        ),
      )
      .not.toBe(before.projects);
  });

  test("More reveals the next page of notes", async ({ page }) => {
    await visit(page, "/blog");
    await expect(page.locator("#blog-notes-grid a")).toHaveCount(6);
    await page.getByRole("button", { name: "More" }).click();
    await expect(page.locator("#blog-notes-grid a")).toHaveCount(8);
    await expect(page.getByRole("button", { name: "More" })).toHaveCount(0);
  });

  test("sandbox starts on click-to-play and stays HTML-safe", async ({
    page,
  }) => {
    await visit(page, "/blog");
    const sandbox = page.locator("#blog-sandbox");
    await expect(sandbox.getByText("sandbox.ballpool")).toBeVisible();
    await expect(sandbox.getByText("STANDBY")).toBeVisible();
    await expect(sandbox.locator("canvas")).toHaveCount(0);
    await expect(page.locator("#blog-notes-grid a")).toHaveCount(6);

    await sandbox.getByRole("button", { name: "CLICK TO PLAY" }).click();
    await expect(sandbox.locator("canvas")).toBeVisible({ timeout: 15_000 });
    await expect(sandbox.getByText("LIVE")).toBeVisible();
    await expect(sandbox.getByRole("button", { name: "CLICK TO PLAY" })).toHaveCount(
      0,
    );
    await expect(page.locator("#blog-notes-grid a")).toHaveCount(6);
  });

  test("sandbox tank follows Spray tokens before play", async ({ page }) => {
    await visit(page, "/blog");
    await page.evaluate(() => localStorage.removeItem("todo-spray"));
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForHydration(page);

    const tank = page.locator("#blog-sandbox .aspect-video");
    const before = await tank.evaluate((el) => getComputedStyle(el).backgroundColor);

    await page.getByRole("navigation", { name: "Primary" }).getByRole("button", {
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

    await page.getByRole("navigation", { name: "Primary" }).getByRole("button", {
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
    const box = await sandbox.locator(".aspect-video").boundingBox();
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
    await expect(page.locator("#blog-notes-grid a")).toHaveCount(6);
  });

  test("desktop notes grid is 3 columns and mobile is 1", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await visit(page, "/blog");
    await expect(page.locator("#blog-notes-grid a")).toHaveCount(6);
    expect(await gridColumnCount(page)).toBe(3);

    await page.setViewportSize({ width: 390, height: 844 });
    expect(await gridColumnCount(page)).toBe(1);
  });

  test("mobile landing shows HQ chrome and menu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit(page, "/blog");
    await expect(page.getByRole("heading", { name: "blog.index" })).toBeVisible();
    await expect(page.getByRole("button", { name: "More" })).toBeVisible();
    await expect(page.getByRole("link", { name: "View all" })).toHaveCount(0);
    await expect(page.getByText(/Notes from the floor/)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  });

  test("card links reach the matching slug", async ({ page }) => {
    test.setTimeout(60_000);
    for (const post of POSTS) {
      await visit(page, "/blog");
      await page.getByRole("link", { name: new RegExp(post.title) }).click();
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

  test("featured note holds a 1:1 center crop of the 2400×1260 master", async ({
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
    expect(box!.width / box!.height).toBeCloseTo(1, 1);

    const title = page.locator("#blog-featured h2");
    await expect(title).toHaveText("Our first time");
    await expect(title).toHaveCSS("display", "-webkit-box");
    await expect(page.locator("#blog-featured h2 + p")).toHaveCSS(
      "display",
      "-webkit-box",
    );
  });

  test("/blog/all redirects to the notes index", async ({ page }) => {
    await page.goto("/blog/all", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole("heading", { name: "blog.index" })).toBeVisible();
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
      await expect(page.getByText(post.author, { exact: true }).first()).toBeVisible();
      await expect(page.getByText(/min read/)).toBeVisible();

      await page.getByRole("button", { name: "Copy link" }).click();
      await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied).toMatch(new RegExp(`/blog/${post.slug}$`));

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

  test("article page follows HQ section order with writer pool and book band", async ({
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
    await expect(article.getByText("Growth Editor, //TODO").first()).toBeVisible();
    const hero = article.locator("figure").first();
    await expect(hero).toBeVisible();
    await expect(hero.locator("img")).toHaveAttribute(
      "src",
      /og-default/,
    );
    await expect(article.locator("blockquote")).toBeVisible();
    await expect(
      article.getByText(
        "Edits factory notes for technical founders and product leads evaluating how the floor actually ships.",
      ),
    ).toBeVisible();
    await expect(
      article.getByRole("heading", { name: "Book the factory", level: 2 }),
    ).toBeVisible();
    await expect(
      article.getByRole("link", { name: "Book Team" }),
    ).toHaveAttribute("href", "/book");
    await expect(page.getByText(/Ashley|Dan/)).toHaveCount(0);

    const tops = await article.evaluate((root) => {
      const top = (el: Element | null) =>
        el ? el.getBoundingClientRect().top : Number.POSITIVE_INFINITY;
      return {
        crumb: top(root.querySelector("#blog-breadcrumb")),
        title: top(root.querySelector("h1")),
        byline: top(root.querySelector("time")),
        hero: top(root.querySelector("figure")),
        quote: top(root.querySelector("blockquote")),
        nod: top(root.querySelector("#blog-writer-nod")),
        share: top(root.querySelector("#blog-post-feedback")),
        book: top(root.querySelector("#blog-book-band")),
      };
    });

    expect(tops.crumb).toBeLessThan(tops.title);
    expect(tops.title).toBeLessThan(tops.byline);
    expect(tops.byline).toBeLessThan(tops.hero);
    expect(tops.hero).toBeLessThan(tops.quote);
    expect(tops.quote).toBeLessThan(tops.nod);
    expect(tops.nod).toBeLessThan(tops.share);
    expect(tops.share).toBeLessThan(tops.book);

    const bodyWidth = await page
      .locator("#blog-article-body")
      .evaluate((el) => el.getBoundingClientRect().width);
    expect(bodyWidth).toBeGreaterThanOrEqual(640);
    expect(bodyWidth).toBeLessThanOrEqual(720);
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
    expect(box!.width / box!.height).toBeCloseTo(1200 / 630, 1);

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
    await expect(article.locator("blockquote")).toBeVisible();
    const hero = page.locator("#blog-post-hero");
    await expect(hero.locator("img")).toBeVisible();
    await expect(hero.locator("img")).toHaveAttribute("src", /og-default/);
    const box = await hero.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width / box!.height).toBeCloseTo(1200 / 630, 1);
    await expect(
      article.getByRole("link", { name: "Book Team" }),
    ).toBeVisible();

    const bodyWidth = await page
      .locator("#blog-article-body")
      .evaluate((el) => el.getBoundingClientRect().width);
    expect(bodyWidth).toBeGreaterThanOrEqual(280);
    expect(bodyWidth).toBeLessThanOrEqual(390);
  });
});
