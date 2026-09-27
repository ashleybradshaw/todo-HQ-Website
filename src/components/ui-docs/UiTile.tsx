import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type UiTileProps = {
  title: string;
  description: string;
  children: ReactNode;
  /** Full-width on md+ grid. */
  span?: "half" | "full";
  className?: string;
  /** Extra classes on the preview region. */
  previewClassName?: string;
};

/**
 * Single showcase cell: preview on top, title + one-line description below.
 * Borders come from the parent shared-edge grid — this cell has no outer border.
 */
export function UiTile({
  title,
  description,
  children,
  span = "half",
  className,
  previewClassName,
}: UiTileProps) {
  return (
    <article
      className={cn(
        "flex min-w-0 flex-col bg-canvas",
        span === "full" && "md:col-span-2",
        className,
      )}
    >
      <div
        className={cn(
          "min-h-0 min-w-0 flex-1 overflow-hidden p-4 sm:p-5",
          previewClassName,
        )}
      >
        {children}
      </div>
      <div className="border-border-ide min-w-0 border-t px-4 py-3 sm:px-5">
        <h2 className="type-subhead text-foreground min-w-0 break-words">
          {title}
        </h2>
        <p className="type-meta text-muted mt-1 min-w-0 break-words">
          {description}
        </p>
      </div>
    </article>
  );
}
