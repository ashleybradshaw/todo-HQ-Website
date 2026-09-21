import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WriterAvatar } from "@/components/blog/WriterAvatar";
import { JsonLd } from "@/components/JsonLd";
import {
  blogPostingGraph,
  blogShareImageSrc,
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

const controlClass =
  "type-label inline-flex cursor-pointer items-center justify-center rounded-[4px] border border-current px-3 py-1.5 transition-[opacity,color,background-color] duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none";

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
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(min-width: 800px) 752px, calc(100vw - 48px)"
          className="object-cover object-center"
        />
      </div>
    </figure>
  );
}

function WriterNod({
  post,
  more,
}: {
  post: BlogPost;
  more: readonly BlogPost[];
}) {
  return (
    <section className="mt-16 border-t border-border-ide pt-8" aria-labelledby="blog-writer-nod">
      <div className="flex gap-4">
        <WriterAvatar
          name={post.writer.name}
          src={post.avatarSrc}
          size={64}
        />
        <div>
          <h2 id="blog-writer-nod" className="type-body font-bold">
            {post.writer.name}
          </h2>
          <p className="type-meta mt-1">{post.writer.role}</p>
          <p className="type-body mt-3">{post.writer.about}</p>
        </div>
      </div>
      {more.length > 0 ? (
        <div className="mt-8">
          <h3 className="type-meta font-bold">More by {post.writer.name}</h3>
          <ul className="mt-3 space-y-2">
            {more.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/blog/${item.slug}`}
                  className="type-body underline transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none"
                >
                  {item.title}
                </Link>
                <span className="type-meta">
                  {" · "}
                  <time dateTime={item.date}>{formatBlogDate(item.date)}</time>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function BlogBookBand() {
  return (
    <section
      className="mt-12 border border-border-ide p-6"
      aria-labelledby="blog-book-band"
    >
      <h2 id="blog-book-band" className="type-subhead">
        Book the factory
      </h2>
      <p className="type-body mt-3">
        {
          "//TODO Engineering runs the same production system for technical founders and product leads who need AI workflow architecture or a full-stack application to ship — including RepDaily, ReadyGo, and Contentic."
        }
      </p>
      <p className="mt-6">
        <Link href="/book" className={controlClass}>
          Book Team
        </Link>
      </p>
    </section>
  );
}

export default async function BlogPostPage({ params }: BlogPostParams) {
  const { slug } = await params;
  const [posts, post] = await Promise.all([getAllPosts(), getPostBySlug(slug)]);

  if (!post) {
    notFound();
  }

  const more = moreByWriter(posts, post);

  return (
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
        <div className="type-meta mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <WriterAvatar
            name={post.writer.name}
            src={post.avatarSrc}
            size={24}
          />
          <span>{post.writer.name}</span>
          <span aria-hidden="true">·</span>
          <span>{post.writer.role}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readMinutes} min read</span>
        </div>
        <BlogHero post={post} />
        <div
          id="blog-article-body"
          className="type-body mx-auto mt-10 w-full max-w-[688px] [&>blockquote]:mt-6 [&>blockquote]:ml-6 [&>blockquote]:border-l [&>blockquote]:border-border-ide [&>blockquote]:pl-4 [&>blockquote]:font-medium [&>blockquote>p]:mt-0 [&>code]:type-code [&>h2]:type-heading [&>h2]:mt-10 [&>h3]:type-subhead [&>h3]:mt-8 [&>p]:mt-4 [&>p:first-child]:mt-0 [&>ul]:mt-4 [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
        <div className="mx-auto w-full max-w-[688px]">
          <WriterNod post={post} more={more} />
          <BlogPostFeedback slug={post.slug} title={post.title} />
          <BlogBookBand />
        </div>
      </article>
    </div>
  );
}
