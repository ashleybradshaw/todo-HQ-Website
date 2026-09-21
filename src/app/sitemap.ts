import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getProjectSlugs } from "@/lib/projects";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const posts = await getAllPosts();
  const workSlugs = getProjectSlugs();

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
      lastModified: new Date(`${post.date}T00:00:00.000Z`),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
