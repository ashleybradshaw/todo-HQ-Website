import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BlogAdjacentNav } from "@/components/blog/BlogAdjacentNav";
import { BlogMediaCraft } from "@/components/blog/BlogMediaCraft";
import { ReadMinutes } from "@/components/blog/BlogNoteCard";
import { BlogReadingProgress } from "@/components/blog/BlogReadingProgress";
import { BlogWriterBand } from "@/components/blog/BlogWriterBand";
import { WriterAvatar } from "@/components/blog/WriterAvatar";
import { JsonLd } from "@/components/JsonLd";
import { SiteCloser } from "@/components/SiteCloser";
import {
  blogPostingGraph,
  blogShareImageSrc,
  getAdjacentPosts,
  getAllPosts,
  getPostBySlug,
  moreByWriter,
  type BlogPost,
} from "@/lib/blog";
import {
  BLOG_OG_HEIGHT,
  BLOG_OG_WIDTH,
  formatBlogDate,
} from "@/lib/blog-shared";
import { pageMetadata } from "@/lib/seo";
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

  const base = pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  });
  const image = blogShareImageSrc(post);

  return {
    ...base,
    authors: [{ name: post.writer.name }],
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: `${post.date}T00:00:00.000Z`,
      authors: [post.writer.name],
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

function BlogHero({ post }: { post: BlogPost }) {
  const src = blogShareImageSrc(post);
  const alt = post.imageAlt ?? post.title;

  return (
    <figure className="mt-10">
      <div
        id="blog-post-hero"
        className="blog-post-hero relative w-full border border-border-ide bg-background"
        style={{ aspectRatio: `${BLOG_OG_WIDTH} / ${BLOG_OG_HEIGHT}` }}
      >
        <BlogMediaCraft className="absolute inset-0" enabled>
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="(min-width: 800px) 752px, calc(100vw - 48px)"
            className="object-cover object-center"
          />
        </BlogMediaCraft>
      </div>
    </figure>
  );
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
      <BlogReadingProgress />
      <div className="mx-auto w-full max-w-[800px] px-6 pt-28 pb-16">
        <JsonLd data={blogPostingGraph(post)} />
        <article>
          <Breadcrumbs
            id="blog-breadcrumb"
            parent={{ href: "/blog", label: "Blog" }}
            current={post.title}
          />
          <h1 className="type-title mt-10 text-center text-balance tracking-tight">
            {post.title}
          </h1>
          <div className="type-caption mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <WriterAvatar
              name={post.writer.name}
              src={post.avatarSrc}
              size={16}
            />
            <span>{post.writer.name}</span>
            <span aria-hidden="true">·</span>
            <span>{post.writer.role}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
            <span aria-hidden="true">·</span>
            <ReadMinutes minutes={post.readMinutes} />
          </div>
          <BlogHero post={post} />
          <div
            id="blog-article-body"
            className="type-prose mx-auto mt-10 w-full max-w-[688px] [&>blockquote]:mt-6 [&>blockquote]:ml-6 [&>blockquote]:border-l [&>blockquote]:border-border-ide [&>blockquote]:pl-4 [&>blockquote]:font-medium [&>blockquote>p]:mt-0 [&>code]:type-code [&>h2]:type-heading [&>h2]:mt-10 [&>h3]:type-subhead [&>h3]:mt-8 [&>p]:mt-4 [&>p:first-child]:mt-0 [&>ul]:mt-4 [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
          <div className="mx-auto w-full max-w-[688px]">
            <BlogAdjacentNav prev={prev} next={next} />
            <BlogWriterBand post={post} more={more} />
            <BlogPostFeedback slug={post.slug} title={post.title} />
          </div>
        </article>
      </div>
      <SiteCloser variant="book" />
    </>
  );
}
