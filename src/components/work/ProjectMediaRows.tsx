import { BrowserFrame } from "@/components/work/BrowserFrame";
import { FrameReveal } from "@/components/work/FrameReveal";
import { cn } from "@/lib/cn";
import type {
  MediaRatio,
  ProjectMediaItem,
  ProjectMediaRow,
} from "@/lib/projects";

const SIZES = {
  full: "(min-width:1384px) 1334px, calc(100vw - 50px)",
  pairStack:
    "(min-width:1384px) 658px, (min-width:640px) calc(50vw - 34px), calc(100vw - 50px)",
  pairStay: "(min-width:1384px) 658px, calc(50vw - 34px)",
  trio: "(min-width:1384px) 433px, (min-width:768px) calc((100vw - 80px) / 3 - 2px), calc(100vw - 50px)",
} as const;

function sizesFor(row: ProjectMediaRow) {
  if (row.layout === "full") return SIZES.full;
  if (row.layout === "trio") return SIZES.trio;
  return row.items[0]?.ratio === "1:1" ? SIZES.pairStay : SIZES.pairStack;
}

function frameOffset(rows: readonly ProjectMediaRow[], rowIndex: number) {
  return rows
    .slice(0, rowIndex)
    .reduce((sum, row) => sum + row.items.length, 0);
}

function gridFor(row: ProjectMediaRow) {
  if (row.layout === "full") return "grid grid-cols-1 items-start";
  if (row.layout === "trio") {
    return "grid grid-cols-1 items-start gap-4 md:grid-cols-3";
  }
  const ratio: MediaRatio | undefined = row.items[0]?.ratio;
  if (ratio === "1:1") return "grid grid-cols-2 items-start gap-4";
  return "grid grid-cols-1 items-start gap-4 sm:grid-cols-2";
}

function stillSrc(item: ProjectMediaItem) {
  return item.kind === "video" ? (item.poster ?? item.src) : item.src;
}

export function CaseHero({ item }: { item: ProjectMediaItem }) {
  return (
    <BrowserFrame
      src={stillSrc(item)}
      alt={item.alt}
      caption={item.caption}
      ratio="16:9"
      sizes={SIZES.full}
      priority
      className="mt-8 w-full"
    />
  );
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
    <section className="mt-12 flex min-w-0 flex-col gap-4" aria-label={label}>
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
