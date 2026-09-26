"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BlogMediaCraft } from "@/components/blog/BlogMediaCraft";
import { BlogNoteCard, ReadMinutes, WriterMeta, categoryPillStyle } from "@/components/blog/BlogNoteCard";
import { BlogPollTile } from "@/components/blog/BlogPollTile";
import { BlogSandbox } from "@/components/blog/BlogSandbox";
import { TypeComment } from "@/components/TypeComment";
import { getFeaturedPoll, getGridPolls, type BlogPoll } from "@/content/blog-polls";
import { cn } from "@/lib/cn";
import {
  BLOG_CATEGORIES,
  BLOG_CATEGORY_LABELS,
  BLOG_IMAGE_MASTER_HEIGHT,
  BLOG_IMAGE_MASTER_WIDTH,
  BLOG_INDEX_PAGE_SIZE,
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
  "type-label cursor-pointer rounded-[4px] border px-3 py-1.5 transition-[color,background-color,border-color,opacity] duration-[400ms] ease-in-out focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none";

const moreClass =
  "type-label inline-flex cursor-pointer items-center justify-center rounded-[4px] border border-current px-3 py-1.5 transition-[opacity,color,background-color] duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none";

type GridItem =
  | { kind: "note"; post: BlogIndexPost }
  | { kind: "poll"; poll: BlogPoll };

function FeaturedCover({ src }: { src: string | null }) {
  return (
    <div
      id="blog-featured-frame"
      className={cn(
        "relative aspect-video w-full overflow-hidden",
        src
          ? "blog-post-hero border border-border-ide"
          : "border border-dashed border-current",
      )}
      aria-hidden="true"
    >
      {src ? (
        <BlogMediaCraft className="absolute inset-0" enabled>
          <Image
            src={src}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover object-center"
          />
        </BlogMediaCraft>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1 bg-background px-2 text-center">
          <p className="type-label">
            {BLOG_IMAGE_MASTER_WIDTH} × {BLOG_IMAGE_MASTER_HEIGHT}
          </p>
          <p className="type-label text-syn-comment font-normal">16:9</p>
        </div>
      )}
    </div>
  );
}

function filterPosts(posts: readonly BlogIndexPost[], filter: FilterId) {
  if (filter === "all") {
    return posts;
  }
  return posts.filter((post) => post.category === filter);
}

function mixNotesAndPolls(
  notes: readonly BlogIndexPost[],
  filter: FilterId,
): GridItem[] {
  const items: GridItem[] = [];
  const gridPolls = getGridPolls();
  notes.forEach((post, index) => {
    items.push({ kind: "note", post });
    if (filter === "all") {
      const noteIndex = index + 1;
      for (const poll of gridPolls) {
        if (poll.afterNote === noteIndex) {
          items.push({ kind: "poll", poll });
        }
      }
    }
  });
  return items;
}

export function BlogIndex({ posts }: { posts: readonly BlogIndexPost[] }) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [visibleCount, setVisibleCount] = useState(BLOG_INDEX_PAGE_SIZE);

  const filtered = useMemo(() => filterPosts(posts, filter), [posts, filter]);
  const featured = pickFeaturedPost(filtered);
  const gridPosts = featured
    ? filtered.filter((post) => post.slug !== featured.slug)
    : filtered;
  const sibling = gridPosts[0];
  const notePosts = sibling ? gridPosts.slice(1) : gridPosts;
  const visibleNotes = notePosts.slice(0, visibleCount);
  const mixed = mixNotesAndPolls(visibleNotes, filter);
  const hasMore = notePosts.length > visibleCount;
  const featuredPoll = filter === "all" ? getFeaturedPoll() : undefined;

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
          <TypeComment
            as="h1"
            id="blog-index-heading"
            text="// Blog"
            className="text-syn-keyword"
          />
          <p className="type-label text-syn-comment font-normal">NOTES</p>
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
                      data-category={item.id}
                      onClick={() => selectFilter(item.id)}
                      className={cn(
                        pillClass,
                        item.id === "all"
                          ? active
                            ? "border-foreground bg-foreground text-background"
                            : "border-current bg-transparent hover:opacity-80"
                          : "hover:opacity-80",
                      )}
                      style={
                        item.id === "all"
                          ? undefined
                          : categoryPillStyle(item.id, active)
                      }
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
            className="type-meta text-syn-comment"
            aria-live="polite"
          >
            {filtered.length} notes
          </p>

          {featured ? (
            <div
              id="blog-featured-row"
              className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_2fr] md:items-stretch"
            >
              <article id="blog-featured" className="min-w-0">
                <Link
                  href={`/blog/${featured.slug}`}
                  className="blog-note-link flex h-full flex-col gap-4 border border-border-ide p-4 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none sm:p-5"
                >
                  <FeaturedCover src={featured.imageSrc} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h2 className="type-subhead line-clamp-2 tracking-tight">
                      {featured.title}
                    </h2>
                    <p className="type-body-sm mt-1.5 line-clamp-3">
                      {featured.excerpt}
                    </p>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-4">
                      <WriterMeta
                        name={featured.writerName}
                        avatarSrc={featured.avatarSrc}
                        date={featured.date}
                        compact
                      />
                      <ReadMinutes minutes={featured.readMinutes} />
                    </div>
                  </div>
                </Link>
              </article>
              <BlogSandbox
                fillHeight
                className="min-h-0 md:h-full"
              />
            </div>
          ) : (
            <BlogSandbox />
          )}

          {featuredPoll || sibling ? (
            <div
              id="blog-sandbox-row"
              className={cn(
                "grid grid-cols-1 gap-4",
                featuredPoll && sibling
                  ? "md:grid-cols-2 md:items-stretch"
                  : undefined,
              )}
            >
              {featuredPoll ? (
                <BlogPollTile
                  poll={featuredPoll}
                  className={sibling ? "md:h-full" : undefined}
                />
              ) : null}
              {sibling ? (
                <BlogNoteCard id="blog-sandbox-sibling" post={sibling} />
              ) : null}
            </div>
          ) : null}

          {mixed.length > 0 ? (
            <ul
              id="blog-notes-grid"
              className="grid grid-cols-1 gap-4 md:grid-cols-3"
            >
              {mixed.map((item) =>
                item.kind === "note" ? (
                  <li key={`note:${item.post.slug}`} className="min-w-0">
                    <BlogNoteCard post={item.post} />
                  </li>
                ) : (
                  <li key={`poll:${item.poll.id}`} className="min-w-0">
                    <BlogPollTile poll={item.poll} />
                  </li>
                ),
              )}
            </ul>
          ) : (
            <p className="type-meta text-syn-comment">
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
