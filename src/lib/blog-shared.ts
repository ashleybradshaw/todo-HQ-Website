export const BLOG_CATEGORIES = [
  "projects",
  "leaps",
  "agents",
  "deep-cuts",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, string> = {
  projects: "Projects",
  leaps: "Leaps",
  agents: "Agents",
  "deep-cuts": "Deep Cuts",
};

export const BLOG_INDEX_PAGE_SIZE = 6;

export const BLOG_OG_DEFAULT_SRC = "/blog/og-default.png";
export const BLOG_OG_WIDTH = 1200;
export const BLOG_OG_HEIGHT = 630;

export type BlogIndexPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: BlogCategory;
  featured: boolean;
  writerName: string;
  avatarSrc: string | null;
};

export function isBlogCategory(value: string): value is BlogCategory {
  return (BLOG_CATEGORIES as readonly string[]).includes(value);
}

export function pickFeaturedPost<T extends { featured: boolean }>(
  posts: readonly T[],
): T | undefined {
  return posts.find((post) => post.featured) ?? posts[0];
}

export function formatBlogDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00.000Z`));
}
