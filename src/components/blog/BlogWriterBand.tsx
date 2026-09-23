import Link from "next/link";
import { WriterAvatar } from "@/components/blog/WriterAvatar";
import {
  BLOG_CATEGORY_VARS,
  formatBlogDate,
} from "@/lib/blog-shared";
import type { BlogPost } from "@/lib/blog";

type BlogWriterBandProps = {
  post: BlogPost;
  more: readonly BlogPost[];
};

export function BlogWriterBand({ post, more }: BlogWriterBandProps) {
  return (
    <section
      id="blog-writer-band"
      className="mt-16 border border-border-ide"
      aria-labelledby="blog-writer-band-heading"
    >
      <div className="flex items-center justify-between border-b border-border-ide px-4 py-2">
        <p className="type-label text-syn-keyword">// writer</p>
        <p className="type-label text-syn-comment font-normal">
          {post.writer.role}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-[auto_1fr] sm:items-start">
        <div
          className="flex size-20 shrink-0 items-center justify-center border border-border-ide bg-[color-mix(in_srgb,var(--foreground)_6%,var(--background))] sm:size-24"
          aria-hidden="true"
        >
          <span className="opacity-70">
            <WriterAvatar
              name={post.writer.name}
              src={post.avatarSrc}
              size={64}
            />
          </span>
        </div>

        <div className="min-w-0">
          <h2
            id="blog-writer-band-heading"
            className="type-subhead tracking-tight"
          >
            {post.writer.name}
          </h2>
          <p className="type-body-sm mt-3 text-balance">{post.writer.about}</p>
        </div>
      </div>

      {more.length > 0 ? (
        <div className="border-t border-border-ide">
          <p className="type-label border-b border-border-ide px-4 py-2 text-syn-comment">
            More by {post.writer.name}
          </p>
          <ul className="flex flex-col gap-2 p-3">
            {more.map((item) => {
              const accent = `var(${BLOG_CATEGORY_VARS[item.category]})`;
              return (
                <li key={item.slug}>
                  <Link
                    href={`/blog/${item.slug}`}
                    className="blog-more-link flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-[4px] border border-solid px-3 py-2.5 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none"
                    style={{
                      borderColor: `color-mix(in srgb, ${accent} 34%, transparent)`,
                      backgroundImage: `linear-gradient(105deg, color-mix(in srgb, ${accent} 16%, transparent) 0%, color-mix(in srgb, ${accent} 5%, transparent) 55%, transparent 100%)`,
                    }}
                  >
                    <span className="type-body-sm min-w-0 font-bold text-balance">
                      {item.title}
                    </span>
                    <time
                      className="blog-more-date type-caption inline-flex min-w-[7.5rem] shrink-0 items-center justify-center rounded-[4px] border border-border-ide bg-background/50 px-3 py-1.5 text-syn-comment"
                      dateTime={item.date}
                    >
                      {formatBlogDate(item.date)}
                    </time>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
