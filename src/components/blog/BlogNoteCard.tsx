import Link from "next/link";
import { WriterAvatar } from "@/components/blog/WriterAvatar";
import { cn } from "@/lib/cn";
import {
  BLOG_CATEGORY_LABELS,
  BLOG_CATEGORY_VARS,
  formatBlogDate,
  type BlogCategory,
  type BlogIndexPost,
} from "@/lib/blog-shared";

function categoryTone(category: BlogCategory, filled: boolean) {
  const token = `var(${BLOG_CATEGORY_VARS[category]})`;
  if (filled) {
    return {
      color: "var(--background)",
      backgroundColor: token,
      borderColor: token,
    };
  }
  return {
    color: token,
    borderColor: token,
    backgroundColor: "transparent",
  };
}

export function WriterMeta({
  name,
  avatarSrc,
  date,
  compact = false,
}: {
  name: string;
  avatarSrc: string | null;
  date: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "type-caption flex items-center gap-x-1.5",
        compact
          ? "min-w-0 flex-nowrap overflow-hidden"
          : "flex-wrap gap-y-1",
      )}
    >
      <WriterAvatar name={name} src={avatarSrc} size={16} />
      <span className={compact ? "min-w-0 truncate" : undefined}>{name}</span>
      <span aria-hidden="true">·</span>
      <time className={compact ? "shrink-0" : undefined} dateTime={date}>
        {formatBlogDate(date)}
      </time>
    </div>
  );
}

export function ReadMinutes({ minutes }: { minutes: number }) {
  return (
    <span className="blog-read-minutes type-caption text-syn-comment shrink-0 font-bold">
      {`// ${minutes}m`}
    </span>
  );
}

export function categoryPillStyle(category: BlogCategory, filled = false) {
  return categoryTone(category, filled);
}

type BlogNoteCardProps = {
  post: BlogIndexPost;
  id?: string;
  className?: string;
};

export function BlogNoteCard({ post, id, className }: BlogNoteCardProps) {
  return (
    <article id={id} className={cn("min-w-0 h-full", className)}>
      <Link
        href={`/blog/${post.slug}`}
        data-category={post.category}
        className="blog-note-link flex h-full flex-col border border-border-ide p-5 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none"
      >
        <p
          data-category-label={post.category}
          className="type-label inline-flex w-fit rounded-[4px] border px-2 py-0.5"
          style={categoryTone(post.category, false)}
        >
          {BLOG_CATEGORY_LABELS[post.category]}
        </p>
        <h2 className="type-subhead mt-3 tracking-tight text-balance">
          {post.title}
        </h2>
        <p className="type-body-sm mt-3 flex-1">{post.excerpt}</p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <WriterMeta
            name={post.writerName}
            avatarSrc={post.avatarSrc}
            date={post.date}
          />
          <ReadMinutes minutes={post.readMinutes} />
        </div>
      </Link>
    </article>
  );
}
