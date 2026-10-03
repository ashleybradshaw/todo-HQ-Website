import { categoryPillStyle } from "@/components/blog/BlogNoteCard";
import { blogPage } from "@/content/pages/blog";
import { cn } from "@/lib/cn";
import {
  BLOG_CATEGORIES,
  BLOG_CATEGORY_LABELS,
  type BlogCategory,
} from "@/lib/blog-shared";

export const BLOG_FILTERS: readonly { id: "all" | BlogCategory; label: string }[] =
  [
    { id: "all", label: blogPage.allFilter },
    ...BLOG_CATEGORIES.map((id) => ({
      id,
      label: BLOG_CATEGORY_LABELS[id],
    })),
  ];

export type BlogFilterId = (typeof BLOG_FILTERS)[number]["id"];

const pillClass =
  "type-label cursor-pointer rounded-[4px] border px-3 py-1.5 transition-[color,background-color,border-color,opacity] duration-[400ms] ease-in-out focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none";

export function BlogFilterPills({
  value,
  onChange,
}: {
  value: BlogFilterId;
  onChange: (id: BlogFilterId) => void;
}) {
  return (
    <div role="group" aria-label={blogPage.filterAria}>
      <ul className="flex flex-wrap gap-2">
        {BLOG_FILTERS.map((item) => {
          const active = value === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={active}
                data-category={item.id}
                onClick={() => onChange(item.id)}
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
  );
}
