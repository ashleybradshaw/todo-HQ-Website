"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BlogSandbox } from "@/components/blog/BlogSandbox";
import { WriterAvatar } from "@/components/blog/WriterAvatar";
import { cn } from "@/lib/cn";
import {
  BLOG_CATEGORIES,
  BLOG_CATEGORY_LABELS,
  BLOG_INDEX_PAGE_SIZE,
  formatBlogDate,
  pickFeaturedPost,
  type BlogCategory,
  type BlogIndexPost,
} from "@/lib/blog-shared";

const FILTERS: readonly { id: "all" | BlogCategory; label: string }[] = [
  { id: "all", label: "All" },
  ...BLOG_CATEGORIES.map((id) => ({
    id,
    label: BLOG_CATEGORY_LABELS[id],
  })),
];

type FilterId = (typeof FILTERS)[number]["id"];

const pillClass =
  "cursor-pointer rounded-[4px] border px-3 py-1.5 font-jetbrains text-xs font-bold tracking-wider transition-[color,background-color,border-color,opacity] duration-[400ms] ease-in-out focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none";

const moreClass =
  "inline-flex cursor-pointer items-center justify-center rounded-[4px] border border-current px-3 py-1.5 font-jetbrains text-xs font-bold tracking-wider transition-[opacity,color,background-color] duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none";

function filterPosts(posts: readonly BlogIndexPost[], filter: FilterId) {
  if (filter === "all") {
    return posts;
  }
  return posts.filter((post) => post.category === filter);
}

function WriterMeta({
  name,
  avatarSrc,
  date,
}: {
  name: string;
  avatarSrc: string | null;
  date: string;
}) {
  return (
    <div className="font-jetbrains flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <WriterAvatar name={name} src={avatarSrc} size={24} />
      <span>{name}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={date}>{formatBlogDate(date)}</time>
    </div>
  );
}

export function BlogIndex({ posts }: { posts: readonly BlogIndexPost[] }) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [visibleCount, setVisibleCount] = useState(BLOG_INDEX_PAGE_SIZE);

  const filtered = useMemo(() => filterPosts(posts, filter), [posts, filter]);
  const featured = pickFeaturedPost(filtered);
  const gridPosts = featured
    ? filtered.filter((post) => post.slug !== featured.slug)
    : filtered;
  const visible = gridPosts.slice(0, visibleCount);
  const hasMore = gridPosts.length > visibleCount;

  function selectFilter(next: FilterId) {
    setFilter(next);
    setVisibleCount(BLOG_INDEX_PAGE_SIZE);
  }

  return (
    <div className="mx-auto max-w-[1336px] px-6 pt-28 pb-16">
      <section
        className="border border-border-ide"
        aria-labelledby="blog-index-heading"
      >
        <div className="flex items-center justify-between border-b border-border-ide px-6 py-2">
          <h1
            id="blog-index-heading"
            className="font-jetbrains text-syn-keyword text-xs"
          >
            blog.index
          </h1>
          <p className="font-jetbrains text-syn-comment text-xs">NOTES</p>
        </div>

        <div className="flex flex-col gap-6 p-6">
          <div role="group" aria-label="Filter notes">
            <ul className="flex flex-wrap gap-2">
              {FILTERS.map((item) => {
                const active = filter === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => selectFilter(item.id)}
                      className={cn(
                        pillClass,
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-current bg-transparent hover:opacity-80",
                      )}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <p
            id="blog-count"
            className="font-jetbrains text-syn-comment text-sm"
            aria-live="polite"
          >
            {filtered.length} notes
          </p>

          {featured ? (
            <article
              id="blog-featured"
              className="border border-border-ide"
            >
              <Link
                href={`/blog/${featured.slug}`}
                className="block p-6 transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none"
              >
                <h2 className="font-unbounded text-2xl font-bold tracking-tight text-balance md:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-3 max-w-2xl leading-relaxed">
                  {featured.excerpt}
                </p>
                <div className="mt-5">
                  <WriterMeta
                    name={featured.writerName}
                    avatarSrc={featured.avatarSrc}
                    date={featured.date}
                  />
                </div>
              </Link>
            </article>
          ) : null}

          <BlogSandbox />

          {visible.length > 0 ? (
            <ul
              id="blog-notes-grid"
              className="grid grid-cols-1 gap-4 md:grid-cols-3"
            >
              {visible.map((post) => (
                <li key={post.slug} className="min-w-0">
                  <Link
                    href={`/blog/${post.slug}`}
                    data-category={post.category}
                    className="flex h-full flex-col border border-border-ide p-5 transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none"
                  >
                    <p className="font-jetbrains inline-flex w-fit rounded-[4px] border border-current px-2 py-0.5 text-xs font-bold tracking-wider">
                      {BLOG_CATEGORY_LABELS[post.category]}
                    </p>
                    <h2 className="font-unbounded mt-3 text-xl font-bold tracking-tight text-balance">
                      {post.title}
                    </h2>
                    <p className="mt-3 flex-1 leading-relaxed">{post.excerpt}</p>
                    <div className="mt-5">
                      <WriterMeta
                        name={post.writerName}
                        avatarSrc={post.avatarSrc}
                        date={post.date}
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-jetbrains text-syn-comment text-sm">
              No notes in this filter.
            </p>
          )}

          {hasMore ? (
            <p className="flex justify-center">
              <button
                type="button"
                className={moreClass}
                onClick={() =>
                  setVisibleCount((count) => count + BLOG_INDEX_PAGE_SIZE)
                }
              >
                More
              </button>
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
