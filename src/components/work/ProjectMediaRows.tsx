import { BrowserFrame } from "@/components/work/BrowserFrame";
import { FrameReveal } from "@/components/work/FrameReveal";
import { cn } from "@/lib/cn";
import type { ProjectMediaItem, ProjectMediaRow } from "@/lib/projects";

const SIZES = {
  full: "(min-width: 800px) 752px, calc(100vw - 48px)",
  pair: "(min-width: 800px) 368px, (min-width: 640px) calc(50vw - 32px), calc(100vw - 48px)",
} as const;

/** Trio data becomes pairs, with a trailing full row when the count is odd. */
function expandRows(rows: readonly ProjectMediaRow[]): ProjectMediaRow[] {
  return rows.flatMap((row) => {
    if (row.layout !== "trio") return [row];
    const expanded: ProjectMediaRow[] = [];
    let index = 0;
    let pair = 0;
    while (index < row.items.length) {
      const remaining = row.items.length - index;
      if (remaining === 1) {
        expanded.push({
          id: `${row.id}-full`,
          layout: "full",
          items: [row.items[index]],
        });
        break;
      }
      expanded.push({
        id: `${row.id}-pair-${pair}`,
        layout: "pair",
        items: [row.items[index], row.items[index + 1]],
      });
      pair += 1;
      index += 2;
    }
    return expanded;
  });
}

function sizesFor(row: ProjectMediaRow) {
  return row.layout === "full" ? SIZES.full : SIZES.pair;
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
  const expanded = expandRows(rows);
  if (expanded.length === 0) return null;

  return (
    <section className="mt-16 flex min-w-0 flex-col gap-4" aria-label={label}>
      {expanded.map((row, rowIndex) => {
        const offset = frameOffset(expanded, rowIndex);
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
