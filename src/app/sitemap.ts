import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getListedProjectSlugs } from "@/lib/projects";
import { SITE_URL } from "@/lib/site";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function safePostLastModified(date: string, fallback: Date): Date {
  if (!ISO_DATE.test(date)) {
    return fallback;
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) ? parsed : fallback;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
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

  return [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/home`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/ui`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/work`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...workSlugs.map((slug) => ({
      url: `${SITE_URL}/work/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${SITE_URL}/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/book`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: safePostLastModified(post.date, lastModified),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
