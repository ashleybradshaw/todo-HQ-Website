import Link from "next/link";
import { formatBlogDate } from "@/lib/blog-shared";
import { metadataDate } from "@/lib/metadata-date";
import type { BlogPost } from "@/lib/blog";
import { cn } from "@/lib/cn";

type BlogAdjacentNavProps = {
  prev: BlogPost | null;
  next: BlogPost | null;
};

function AdjacentCell({
  label,
  post,
  align,
  prefetch,
}: {
  label: "PREV" | "NEXT";
  post: BlogPost;
  align: "start" | "end";
  prefetch?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      prefetch={prefetch}
      className={cn(
        "blog-note-link flex min-h-6 min-w-0 flex-col gap-1 border border-border-ide p-4 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none",
        align === "end" && "md:items-end md:text-right",
      )}
    >
      <span className="type-label text-syn-comment">{label}</span>
      <span className="type-body-sm font-bold text-balance">{post.title}</span>
      <time
        className="type-caption text-syn-comment"
        dateTime={metadataDate(post.date) ?? undefined}
      >
        {formatBlogDate(post.date)}
      </time>
    </Link>
  );
}

export function BlogAdjacentNav({
  prev,
  next,
  prefetch,
}: BlogAdjacentNavProps & { prefetch?: boolean }) {
  if (!prev && !next) {
    return null;
  }

  return (
    <nav
      id="blog-adjacent-nav"
      className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2"
      aria-label="Adjacent notes"
    >
      {prev ? (
        <AdjacentCell label="PREV" post={prev} align="start" prefetch={prefetch} />
      ) : (
        <div className="hidden md:block" aria-hidden="true" />
      )}
      {next ? (
        <AdjacentCell label="NEXT" post={next} align="end" prefetch={prefetch} />
      ) : null}
    </nav>
  );
}
