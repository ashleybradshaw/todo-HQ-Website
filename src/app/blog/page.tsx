import type { Metadata } from "next";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { IdeFrame } from "@/components/ide/IdeFrame";
import { PageShell } from "@/components/PageShell";
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
    <PageShell
      variant="index"
      eyebrow={blogPage.eyebrow}
      title={blogPage.title}
      lede={blogPage.sub}
    >
      <IdeFrame
        label={blogPage.heading}
        meta={blogPage.notesLabel}
        labelledBy="blog-frame-label"
      >
        <BlogIndex posts={posts} />
      </IdeFrame>
      <SiteCloser route="blog" />
    </PageShell>
  );
}
