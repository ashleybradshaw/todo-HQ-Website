import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { metadataDate } from "@/lib/metadata-date";
import { getListedProjectSlugs } from "@/lib/projects";
import { SITE_URL } from "@/lib/site";

/** Static pages do not use "now" — crawlers were seeing a fresh stamp on every build. */
const STATIC_LAST_MODIFIED = new Date("2026-09-30T00:00:00.000Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: Awaited<ReturnType<typeof getAllPosts>> = [];
  try {
    posts = await getAllPosts();
  } catch (error) {
    console.error(
      "[sitemap] getAllPosts failed; emitting static+work only",
      error,
    );
  }
  const workSlugs = getListedProjectSlugs();
  const indexablePosts = posts.filter((post) => post.status !== "mock");

  return [
    {
      url: `${SITE_URL}/home`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/ui`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/work`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...workSlugs.map((slug) => ({
      url: `${SITE_URL}/work/${slug}`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${SITE_URL}/blog`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/book`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...indexablePosts.flatMap((post) => {
      const published = metadataDate(post.date);
      if (!published) {
        return [];
      }
      return [
        {
          url: `${SITE_URL}/blog/${post.slug}`,
          lastModified: new Date(`${published}T00:00:00.000Z`),
          changeFrequency: "monthly" as const,
          priority: 0.5,
        },
      ];
    }),
  ];
}
