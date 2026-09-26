import Image from "next/image";
import { cn } from "@/lib/cn";
import type { ProjectMediaAspect } from "@/lib/projects";
import { PlaceholderStill } from "@/components/work/PlaceholderStill";

const ASPECT_CLASS: Record<ProjectMediaAspect, string> = {
  landscape: "aspect-video",
  portrait: "aspect-[3/4]",
  square: "aspect-square",
};

export type BrowserFrameProps = {
  src: string;
  alt: string;
  caption: string;
  aspect: ProjectMediaAspect;
  className?: string;
  priority?: boolean;
};

/**
 * Faux-browser chrome for a project still.
 * Paths under /work/placeholders/ render PlaceholderStill (inline currentColor).
 * Other src values use next/image.
 */
export function BrowserFrame({
  src,
  alt,
  caption,
  aspect,
  className,
  priority = false,
}: BrowserFrameProps) {
  const placeholder = src.startsWith("/work/placeholders/");

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
        <figcaption className="font-jetbrains min-w-0 flex-1 truncate text-xs tracking-wide text-foreground uppercase">
          {caption}
        </figcaption>
      </div>
      <div
        className={cn(
          "relative bg-[color-mix(in_srgb,var(--foreground)_5%,var(--background))]",
          ASPECT_CLASS[aspect],
        )}
      >
        {placeholder ? (
          <div role="img" aria-label={alt} className="absolute inset-0">
            <PlaceholderStill aspect={aspect} />
          </div>
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width:768px) 688px, 100vw"
            priority={priority}
            className="object-cover"
          />
        )}
      </div>
    </figure>
  );
}
