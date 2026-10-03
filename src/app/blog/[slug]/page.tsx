import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BlogAdjacentNav } from "@/components/blog/BlogAdjacentNav";
import { ReadMinutes } from "@/components/blog/BlogNoteCard";
import { BlogWriterBand } from "@/components/blog/BlogWriterBand";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { DetailHero } from "@/components/detail/DetailHero";
import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/PageShell";
import { SiteCloser } from "@/components/SiteCloser";
import {
  blogHeroImageSrc,
  blogOgImageSrc,
  blogPostingGraph,
  getAdjacentPosts,
  getAllPosts,
  getPostBySlug,
  isMockPost,
  moreByWriter,
} from "@/lib/blog";
import {
  BLOG_OG_HEIGHT,
  BLOG_OG_WIDTH,
  formatBlogDate,
} from "@/lib/blog-shared";
import { metadataDate } from "@/lib/metadata-date";
import { NavTrail } from "@/components/nav/NavTrail";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbGraph } from "@/lib/schema";
import { CONTENT_BYLINE } from "@/lib/site";
import { BlogPostFeedback } from "./BlogPostFeedback";

type BlogPostParams = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostParams): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return pageMetadata({
      title: "Not found",
      description: "This factory note does not exist.",
      path: `/blog/${slug}`,
      index: false,
    });
  }

  const published = metadataDate(post.date);
  const base = pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    index: !isMockPost(post),
  });
  const image = blogOgImageSrc(post);

  return {
    ...base,
    authors: [{ name: CONTENT_BYLINE }],
    openGraph: {
      ...base.openGraph,
      type: "article",
      ...(published ? { publishedTime: `${published}T00:00:00.000Z` } : {}),
      authors: [CONTENT_BYLINE],
      images: [
        {
          url: image,
          width: BLOG_OG_WIDTH,
          height: BLOG_OG_HEIGHT,
          alt: post.imageAlt ?? post.title,
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: "summary_large_image",
      images: [image],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostParams) {
  const { slug } = await params;
  const [posts, post] = await Promise.all([getAllPosts(), getPostBySlug(slug)]);

  if (!post) {
    notFound();
  }

  const more = moreByWriter(posts, post);
  const { prev, next } = getAdjacentPosts(posts, post);

  return (
    <>
      {isMockPost(post) ? null : <JsonLd data={blogPostingGraph(post)} />}
      <JsonLd
        data={breadcrumbGraph([
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <PageShell variant="essay" constrainCopy={false}>
        <NavTrail
          parentHref="/blog"
          parentLabel="Blog"
          current={post.title}
          progressId="blog-article-body"
        />
        <article>
          <DetailHeader
            title={post.title}
            breadcrumbs={
              <Breadcrumbs
                id="blog-breadcrumb"
                parent={{ href: "/blog", label: "Blog" }}
                current={post.title}
              />
            }
            meta={
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
                <span>{CONTENT_BYLINE}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={metadataDate(post.date) ?? undefined}>
                  {formatBlogDate(post.date)}
                </time>
                <span aria-hidden="true">·</span>
                <ReadMinutes minutes={post.readMinutes} />
              </div>
            }
          />
          <DetailHero
            id="blog-post-hero"
            src={blogHeroImageSrc(post)}
            alt={post.imageAlt ?? post.title}
          />
          <div
            id="blog-article-body"
            data-detail-copy
            className="article-copy type-prose mx-auto mt-10 w-full max-w-[688px] text-left [&>blockquote]:mt-6 [&>blockquote]:ml-6 [&>blockquote]:border-l [&>blockquote]:border-border-ide [&>blockquote]:pl-4 [&>blockquote]:font-medium [&>blockquote>p]:mt-0 [&>h2]:mt-10 [&>h3]:mt-8 [&>p]:mt-4 [&>p:first-child]:mt-0 [&>ul]:mt-4 [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
          <div className="mx-auto w-full max-w-[688px]">
            <BlogAdjacentNav prev={prev} next={next} />
            <BlogWriterBand more={more} />
            <BlogPostFeedback slug={post.slug} title={post.title} />
          </div>
        </article>
        <SiteCloser route="blog-detail" />
      </PageShell>
    </>
  );
}
