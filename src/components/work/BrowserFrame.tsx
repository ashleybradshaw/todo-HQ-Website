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
};

/**
 * Faux-browser chrome for a project still.
 * Placeholder SVGs are inlined so currentColor tracks Spray — an external
 * SVG in <img> cannot inherit page tokens.
 * Raster stills use <img>. A later pass can swap that slot for <video>
 * with no autoplay, and a static frame under prefers-reduced-motion.
 */
export function BrowserFrame({
  src,
  alt,
  caption,
  aspect,
  className,
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
        <figcaption className="font-jetbrains text-syn-comment min-w-0 flex-1 truncate text-[10px] tracking-wide uppercase">
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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
    </figure>
  );
}
