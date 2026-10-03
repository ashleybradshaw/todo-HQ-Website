import { BrowserFrame } from "@/components/work/BrowserFrame";
import { FrameReveal } from "@/components/work/FrameReveal";
import { cn } from "@/lib/cn";
import type { ProjectMediaItem, ProjectMediaRow } from "@/lib/projects";

export const MEDIA_FRAME_SIZES = {
  full: "(min-width: 800px) 752px, calc(100vw - 48px)",
  pair: "(min-width: 800px) 368px, (min-width: 640px) calc(50vw - 32px), calc(100vw - 48px)",
} as const;

function sizesFor(row: ProjectMediaRow) {
  return row.layout === "full" ? MEDIA_FRAME_SIZES.full : MEDIA_FRAME_SIZES.pair;
}

function frameOffset(rows: readonly ProjectMediaRow[], rowIndex: number) {
  return rows
    .slice(0, rowIndex)
    .reduce((sum, row) => sum + row.items.length, 0);
}

function gridFor(row: ProjectMediaRow) {
  if (row.layout === "full") return "grid grid-cols-1 items-start";
  return "grid grid-cols-1 items-start gap-4 sm:grid-cols-2";
}

function stillSrc(item: ProjectMediaItem) {
  return item.kind === "video" ? (item.poster ?? item.src) : item.src;
}

export function ProjectMediaRows({
  rows,
  label,
}: {
  rows: readonly ProjectMediaRow[];
  label: string;
}) {
  if (rows.length === 0) return null;

  return (
    <section className="mt-16 flex min-w-0 flex-col gap-4" aria-label={label}>
      {rows.map((row, rowIndex) => {
        const offset = frameOffset(rows, rowIndex);
        return (
          <div
            key={row.id}
            data-media-layout={row.layout}
            className={cn("min-w-0", gridFor(row))}
          >
            {row.items.map((item, itemIndex) => {
              const index = offset + itemIndex;
              return (
                <FrameReveal key={item.id} index={index}>
                  <BrowserFrame
                    src={stillSrc(item)}
                    alt={item.alt}
                    caption={item.caption}
                    ratio={item.ratio}
                    sizes={sizesFor(row)}
                    pinCaption={row.layout === "pair"}
                    className="w-full"
                  />
                </FrameReveal>
              );
            })}
          </div>
        );
      })}
    </section>
  );
}
