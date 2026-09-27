import type { Metadata } from "next";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { SiteCloser } from "@/components/SiteCloser";
import { blogPage } from "@/content/pages/blog";
import { getAllPosts, toBlogIndexPost } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: blogPage.seo.title,
  description: blogPage.seo.description,
  path: "/blog",
});

export default async function BlogLandingPage() {
  const posts = (await getAllPosts()).map(toBlogIndexPost);

  return (
    <>
      <BlogIndex posts={posts} />
      <SiteCloser variant="full" />
    </>
  );
}
