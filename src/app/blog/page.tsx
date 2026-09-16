import type { Metadata } from "next";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { JsonLd } from "@/components/JsonLd";
import { getAllPosts, toBlogIndexPost } from "@/lib/blog";
import { organizationGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description:
    "Notes from the //TODO Engineering factory — internal software process, multi-agent systems, and the production roster.",
  path: "/blog",
});

export default async function BlogLandingPage() {
  const posts = (await getAllPosts()).map(toBlogIndexPost);

  return (
    <>
      <JsonLd data={organizationGraph()} />
      <BlogIndex posts={posts} />
    </>
  );
}
