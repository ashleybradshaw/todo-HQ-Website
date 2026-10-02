import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { MediaRatio } from "@/lib/projects";
import { PlaceholderStill } from "@/components/work/PlaceholderStill";

const ASPECT_CLASS: Record<MediaRatio, string> = {
  "16:9": "aspect-video",
  "4:5": "aspect-[4/5]",
  "1:1": "aspect-square",
};

export type BrowserFrameProps = {
  alt: string;
  caption: string;
  ratio: MediaRatio;
  /** Slot width for next/image. Required so each layout passes its own sizes. */
  sizes: string;
  className?: string;
  priority?: boolean;
  /**
   * Still image path. Required when `children` is omitted.
   * Paths under /work/placeholders/ render PlaceholderStill.
   */
  src?: string;
  /** Custom media slot. When set, `src` is ignored. */
  children?: ReactNode;
};

/**
 * Faux-browser chrome for a project still.
 * Paths under /work/placeholders/ render PlaceholderStill (inline currentColor).
 * Other src values use next/image. Optional children replace the media slot.
 */
export function BrowserFrame({
  src,
  alt,
  caption,
  ratio,
  sizes,
  className,
  priority = false,
  children,
}: BrowserFrameProps) {
  const placeholder = Boolean(src?.startsWith("/work/placeholders/"));

  return (
    <figure
      className={cn(
        "border-border-ide min-w-0 overflow-hidden rounded-[4px] border bg-background",
        className,
      )}
    >
      <div className="border-border-ide flex min-w-0 items-center gap-2 border-b px-2.5 py-1.5">
        <span className="flex shrink-0 gap-1" aria-hidden="true">
          <span className="bg-foreground/25 size-1.5 rounded-full" />
          <span className="bg-foreground/25 size-1.5 rounded-full" />
          <span className="bg-foreground/25 size-1.5 rounded-full" />
        </span>
        <figcaption className="font-jetbrains min-w-0 flex-1 text-xs tracking-wide break-words text-foreground uppercase">
          {caption}
        </figcaption>
      </div>
      <div
        data-ratio={ratio}
        className={cn(
          "relative bg-[color-mix(in_srgb,var(--foreground)_5%,var(--background))]",
          ASPECT_CLASS[ratio],
        )}
      >
        {children ? (
          <div className="absolute inset-0 min-w-0 overflow-hidden">
            {children}
          </div>
        ) : placeholder && src ? (
          <div role="img" aria-label={alt} className="absolute inset-0">
            <PlaceholderStill ratio={ratio} />
          </div>
        ) : src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
        ) : null}
      </div>
    </figure>
  );
}
