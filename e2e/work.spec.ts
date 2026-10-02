import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

const PAGE_LINKS = [
  /^open \.\/repdaily\b/,
  /^open \.\/readygo\b/,
  /^open \.\/contentic\b/,
] as const;

test.describe("work roster", () => {
  test("index shows three cards and two queued items", async ({ page }) => {
    await page.goto("/work", { waitUntil: "domcontentloaded" });

    const cards = page.locator("article[aria-label]");
    await expect(cards).toHaveCount(3);

    for (const label of PAGE_LINKS) {
      await expect(page.getByRole("link", { name: label })).toHaveCount(1);
    }

    const queued = page.getByRole("region", { name: "// queued" });
    await expect(queued.getByRole("listitem")).toHaveCount(2);
    await expect(queued.getByRole("link")).toHaveCount(0);
    await expect(queued.getByText("The Tower")).toBeVisible();
    await expect(queued.getByText("ErgTrainer")).toBeVisible();

    const imageBox = cards.first().locator("[data-ratio='16:9']");
    const ratio = await imageBox.evaluate((el) => {
      const box = el.getBoundingClientRect();
      return box.width / box.height;
    });
    expect(Math.abs(ratio / (16 / 9) - 1)).toBeLessThan(0.01);
  });

  test("index contrast, count line, wide card and first-image priority", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      const zeros: string[] = [];
      (window as unknown as { __countZeros: string[] }).__countZeros = zeros;
      const watch = () => {
        const root = document.documentElement;
        if (!root) return;
        const observer = new MutationObserver(() => {
          const node = document.querySelector("article [data-countup]");
          if (node?.textContent?.trim() === "0") zeros.push("0");
        });
        observer.observe(root, {
          subtree: true,
          childList: true,
          characterData: true,
        });
      };
      if (document.documentElement) watch();
      else document.addEventListener("DOMContentLoaded", watch);
    });
    await page.goto("/work", { waitUntil: "domcontentloaded" });

    const contrast = await new AxeBuilder({ page })
      .include("main")
      .withRules(["color-contrast"])
      .analyze();
    expect(contrast.violations).toEqual([]);
    await expect(page.locator('a[href*="example.com"]')).toHaveCount(0);
    await expect(page.getByText("// 3 projects · 2 live · 2 queued")).toBeVisible();

    const firstImage = page.locator("article").first().locator("img");
    await expect(firstImage).toHaveAttribute("fetchpriority", "high");
    await expect(page.locator("article").nth(1).locator("img")).not.toHaveAttribute(
      "fetchpriority",
      "high",
    );

    const last = page.locator("article").last();
    const span = await last.evaluate((el) =>
      getComputedStyle(el.parentElement as HTMLElement).gridColumn,
    );
    expect(span).toContain("span 2");

    await expect(page.locator("article").first().locator("[data-countup]")).toHaveText(
      "103",
    );
    const zeros = await page.evaluate(
      () => (window as unknown as { __countZeros: string[] }).__countZeros,
    );
    expect(zeros).toEqual([]);
  });

  test("pipeline and deleted slugs 404", async ({ request }) => {
    for (const slug of ["the-tower", "ergtrainer", "northstar"]) {
      const res = await request.get(`/work/${slug}`);
      expect(res.status()).toBe(404);
    }
  });

  test("unknown route returns 404 with heading and ways back", async ({
    page,
  }) => {
    const res = await page.goto("/this-route-does-not-exist", {
      waitUntil: "domcontentloaded",
    });
    expect(res?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: /this page didn't ship/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Go home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "See the work" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Book the team" })).toBeVisible();
  });

  test("sitemap includes three work detail URLs only", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();

    const workLocs = [...body.matchAll(/<loc>([^<]*\/work\/[^<]+)<\/loc>/g)].map(
      (match) => match[1],
    );
    expect(workLocs).toHaveLength(3);
    expect(body).toContain("/work/repdaily");
    expect(body).toContain("/work/readygo");
    expect(body).toContain("/work/contentic");
    expect(body).not.toContain("/work/the-tower");
    expect(body).not.toContain("/work/ergtrainer");
    expect(body).not.toContain("/work/northstar");
  });

  test("prev/next links skip pipeline projects", async ({ page }) => {
    await page.goto("/work/readygo", { waitUntil: "domcontentloaded" });
    const nav = page.getByRole("navigation", { name: "Adjacent projects" });
    await expect(nav.getByRole("link", { name: "← RepDaily" })).toBeVisible();
    await expect(nav.getByRole("link", { name: /Contentic/ })).toBeVisible();
    await expect(nav.getByRole("link", { name: /Tower|ErgTrainer/i })).toHaveCount(
      0,
    );
  });

  test("contentic next panel wraps to RepDaily", async ({ page }) => {
    await page.goto("/work/contentic", { waitUntil: "domcontentloaded" });
    const nav = page.getByRole("navigation", { name: "Adjacent projects" });
    await expect(nav.getByRole("link", { name: /RepDaily/ })).toHaveAttribute(
      "href",
      "/work/repdaily",
    );
    await expect(nav.getByRole("link", { name: "← ReadyGo" })).toBeVisible();
  });

  test("nav breadcrumb appears after the h1 and progress tracks the essay", async ({
    page,
  }) => {
    await page.goto("/work/repdaily", { waitUntil: "domcontentloaded" });
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
    await expect(navCrumb.getByRole("link", { name: "Work" })).toHaveAttribute(
      "href",
      "/work",
    );

    const before = await page.locator("[data-nav-progress]").evaluate((el) => {
      return new DOMMatrix(getComputedStyle(el).transform).a;
    });
    await page.evaluate(() => window.scrollBy(0, 700));
    await expect
      .poll(async () =>
        page.locator("[data-nav-progress]").evaluate((el) => {
          return new DOMMatrix(getComputedStyle(el).transform).a;
        }),
      )
      .toBeGreaterThan(before);
  });

  test("repdaily shows the spec table, metrics and a 4:5 frame", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work/repdaily", { waitUntil: "domcontentloaded" });

    const spec = page.getByRole("region", { name: "RepDaily specification" });
    await expect(spec.getByText("// meta")).toBeVisible();
    for (const key of ["client", "year", "platforms", "links"]) {
      await expect(spec.getByText(key, { exact: true })).toBeVisible();
    }
    await expect(spec.getByText("status", { exact: true })).toHaveCount(0);
    for (const key of ["role", "timeline", "stack"]) {
      await expect(spec.getByText(key, { exact: true })).toHaveCount(0);
    }
    const build = page.getByRole("region", { name: "RepDaily build" });
    await expect(build.getByText("// build")).toBeVisible();
    for (const key of ["role", "timeline", "stack"]) {
      await expect(build.getByText(key, { exact: true })).toBeVisible();
    }
    await expect(page.locator('a[href*="example.com"]')).toHaveCount(0);
    await expect(
      spec.getByRole("link", { name: "repdaily.app (opens in a new tab)" }),
    ).toHaveAttribute("href", "https://www.repdaily.app");
    await expect(
      spec.getByRole("link", { name: "Instagram (opens in a new tab)" }),
    ).toHaveAttribute("href", "https://www.instagram.com/repdailyapp");

    const pairTops = await page
      .locator("[data-media-layout='pair'] [data-ratio]")
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getBoundingClientRect().top),
      );
    expect(pairTops.length).toBeGreaterThan(1);
    expect(Math.abs(pairTops[0] - pairTops[1])).toBeLessThan(1);

    const metrics = page.getByRole("region", { name: "RepDaily metrics" });
    const items = metrics.locator("[data-metric-list] > li");
    await expect(items).toHaveCount(3);
    const metricsBox = await metrics.locator("[data-metric-list]").boundingBox();
    const specBox = await spec.boundingBox();
    const buildBox = await build.boundingBox();
    expect(metricsBox).not.toBeNull();
    expect(specBox).not.toBeNull();
    expect(buildBox).not.toBeNull();
    expect(specBox!.y).toBeGreaterThan(metricsBox!.y + metricsBox!.height - 2);
    expect(buildBox!.y).toBeGreaterThan(specBox!.y);
    await expect(items.nth(0)).toContainText("103");
    await expect(items.nth(1)).toContainText("300");
    await expect(items.nth(2)).toContainText("15%");

    const hero = page.locator("[data-detail-hero]");
    const specTop = await spec.evaluate((el) => el.getBoundingClientRect().top);
    const heroTop = await hero.evaluate((el) => el.getBoundingClientRect().top);
    expect(heroTop).toBeLessThan(specTop);
    await expect(hero.locator("img")).toHaveAttribute("src", /repdaily\.webp/);

    const portrait = page.locator("[data-ratio='4:5']").first();
    const ratio = await portrait.evaluate((el) => {
      const box = el.getBoundingClientRect();
      return box.width / box.height;
    });
    expect(Math.abs(ratio / (4 / 5) - 1)).toBeLessThan(0.01);

    const captions = page.locator("figcaption");
    const count = await captions.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      const caption = captions.nth(i);
      const box = await caption.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          overflow: style.textOverflow,
          whiteSpace: style.whiteSpace,
          truncated: el.scrollWidth > el.clientWidth + 1,
        };
      });
      expect(box.overflow).not.toBe("ellipsis");
      expect(box.whiteSpace).not.toBe("nowrap");
      expect(box.truncated).toBe(false);
    }
  });

  test("card CTA focus ring is 3px", async ({ page }) => {
    await page.goto("/work", { waitUntil: "domcontentloaded" });
    const cta = page.getByRole("link", { name: /^open \.\/repdaily\b/ });
    for (let i = 0; i < 40; i += 1) {
      if (await cta.evaluate((el) => el === document.activeElement)) break;
      await page.keyboard.press("Tab");
    }
    await expect(cta).toBeFocused();
    const shadow = await cta.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toMatch(/0px 0px 0px 3px/);
  });

  test("status strip follows the card and omits the status word", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/work", { waitUntil: "domcontentloaded" });

    const card = page.locator("article").first();
    const strip = card.locator(".work-status-strip");
    const translateY = (el: Element) => {
      const value = getComputedStyle(el).transform;
      if (value === "none") return 0;
      return new DOMMatrix(value).m42;
    };

    expect(await strip.evaluate(translateY)).toBeGreaterThan(0);
    const text = (await strip.innerText()).replace(/\s+/g, " ").trim();
    expect(text).toBe("v1.5 · ios / android");
    expect(text).not.toMatch(/\blive\b|\bin build\b/i);

    const heading = card.getByRole("heading", { name: "RepDaily" });
    const box = await heading.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await expect.poll(() => strip.evaluate(translateY)).toBe(0);

    await page.mouse.move(0, 0);
    await expect.poll(() => strip.evaluate(translateY)).toBeGreaterThan(0);

    const cta = card.getByRole("link", { name: /^open \.\/repdaily\b/ });
    await cta.focus();
    await expect.poll(() => strip.evaluate(translateY)).toBe(0);
  });

  test("next panel does not scramble until it is in view", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 640 });
    await page.goto("/work/repdaily", { waitUntil: "domcontentloaded" });

    const panel = page
      .getByRole("navigation", { name: "Adjacent projects" })
      .getByRole("link");
    const title = panel.locator("h2");
    const top = await panel.evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBeGreaterThan(640);
    await expect(title).toHaveAttribute("data-decode-play", "0");

    await panel.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect(title).toHaveAttribute("data-decode-play", "1");
  });

  test("mobile case header puts the hero above the spec table", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/work/repdaily", { waitUntil: "domcontentloaded" });

    const title = page.getByRole("heading", { name: "RepDaily", level: 1 });
    const hero = page.locator("[data-detail-hero]");
    const metrics = page.getByRole("region", { name: "RepDaily metrics" });
    const build = page.getByRole("region", { name: "RepDaily build" });
    const spec = page.getByRole("region", { name: "RepDaily specification" });
    const top = async (locator: typeof title) =>
      locator.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);

    const titleTop = await top(title);
    const heroTop = await top(hero);
    const metricsTop = await top(metrics);
    const buildTop = await top(build);
    const specTop = await top(spec);
    expect(titleTop).toBeLessThan(heroTop);
    expect(heroTop).toBeLessThan(metricsTop);
    expect(metricsTop).toBeLessThan(specTop);
    expect(specTop).toBeLessThan(buildTop);

    const columns = await metrics.locator("[data-metric-list]").evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns,
    );
    expect(columns.split(" ").filter(Boolean)).toHaveLength(2);
  });
});
