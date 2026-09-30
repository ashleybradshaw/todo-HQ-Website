import { test, expect } from "@playwright/test";

const INDEXABLE = [
  "/",
  "/home",
  "/about",
  "/ui",
  "/work",
  "/work/repdaily",
  "/work/readygo",
  "/work/contentic",
  "/blog",
  "/book",
] as const;

const MOCK_POSTS = [
  "repdaily-our-first-time",
  "readygo-deep-dive",
  "tool-off-week",
  "design-engineer-evolution",
] as const;

function jsonLdTypes(html: string) {
  const blocks = [...html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  )];
  const types: string[] = [];
  for (const block of blocks) {
    const data = JSON.parse(block[1]) as {
      "@type"?: string;
      "@graph"?: { "@type"?: string }[];
    };
    if (data["@type"]) types.push(data["@type"]);
    for (const node of data["@graph"] ?? []) {
      if (node["@type"]) types.push(node["@type"]);
    }
  }
  return { blocks: blocks.length, types };
}

test.describe("seo", () => {
  test("indexable routes have canonical, share images, one h1, and JSON-LD", async ({
    request,
  }) => {
    for (const path of INDEXABLE) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      const html = await res.text();
      const canonical = html.match(
        /<link rel="canonical" href="([^"]+)"/,
      )?.[1];
      expect(canonical, path).toBeTruthy();
      if (path === "/" || path === "/home") {
        expect(canonical).toMatch(/\/home$/);
      } else {
        expect(canonical).toMatch(new RegExp(`${path}$`));
      }
      expect(html, path).toMatch(/property="og:image"/);
      expect(html, path).toMatch(/name="twitter:image"/);
      const h1s = html.match(/<h1[\s>]/g) ?? [];
      expect(h1s, path).toHaveLength(1);
      const ld = jsonLdTypes(html);
      expect(ld.blocks, path).toBeGreaterThan(0);
      expect(ld.types.length, path).toBeGreaterThan(0);
    }
  });

  test("mock posts are noindex and omitted from the sitemap", async ({
    request,
  }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const slug of MOCK_POSTS) {
      const res = await request.get(`/blog/${slug}`);
      expect(res.status()).toBe(200);
      const html = await res.text();
      expect(html).toMatch(/noindex/);
      expect(jsonLdTypes(html).types).not.toContain("BlogPosting");
      expect(sitemap).not.toContain(`/blog/${slug}`);
    }
    expect(sitemap).toContain("/home");
  });

  test("ReadyGo schema does not claim live platforms", async ({ request }) => {
    const html = await (await request.get("/home")).text();
    const blocks = [...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    )];
    const graph = blocks
      .map((block) => JSON.parse(block[1]) as { "@graph"?: Record<string, unknown>[] })
      .flatMap((data) => data["@graph"] ?? []);
    const ready = graph.find((node) => node.name === "ReadyGo");
    const daily = graph.find((node) => node.name === "RepDaily");
    expect(ready).toBeTruthy();
    expect(ready).not.toHaveProperty("operatingSystem");
    expect(daily).toMatchObject({ operatingSystem: "iOS, Android, Web" });
    expect(graph.some((node) => node["@type"] === "WebSite")).toBe(true);
    expect(graph.some((node) => node["@type"] === "Person")).toBe(false);
  });
});
