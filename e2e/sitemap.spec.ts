import { test, expect } from "@playwright/test";

const KEEP_BLOG_SLUGS = [
  "repdaily-our-first-time",
  "readygo-deep-dive",
  "tool-off-week",
  "design-engineer-evolution",
] as const;

const FILLER_BLOG_SLUGS = [
  "internal-software-factory",
  "multi-agent-systems",
  "factory-roster",
] as const;

test("sitemap.xml is 200 with four keep blog locs and no fillers", async ({
  request,
}) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);

  const contentType = res.headers()["content-type"] ?? "";
  expect(contentType).toMatch(/xml/i);

  const body = await res.text();
  expect(body).toMatch(/urlset/i);

  const blogArticleLocs = [
    ...body.matchAll(/<loc>([^<]*\/blog\/[^<]+)<\/loc>/g),
  ].map((match) => match[1]);

  // Exclude bare /blog index — only article paths under /blog/{slug}.
  expect(blogArticleLocs).toHaveLength(4);

  for (const slug of KEEP_BLOG_SLUGS) {
    expect(body).toContain(`/blog/${slug}`);
  }

  for (const slug of FILLER_BLOG_SLUGS) {
    expect(body).not.toContain(`/blog/${slug}`);
  }
});
