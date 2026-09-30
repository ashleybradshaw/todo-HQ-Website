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

test("sitemap.xml is 200 with no mock blog locs and no fillers", async ({
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

  // Mock posts stay off the sitemap until a real note ships.
  expect(blogArticleLocs).toHaveLength(0);

  for (const slug of KEEP_BLOG_SLUGS) {
    expect(body).not.toContain(`/blog/${slug}`);
  }

  const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const home = locs.find((loc) => loc.endsWith("/home"));
  expect(home).toBeTruthy();
  const origin = home!.replace(/\/home$/, "");
  expect(locs).not.toContain(origin);
  expect(locs).not.toContain(`${origin}/`);

  for (const slug of FILLER_BLOG_SLUGS) {
    expect(body).not.toContain(`/blog/${slug}`);
  }
});
