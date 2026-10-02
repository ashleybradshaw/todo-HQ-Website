import Image from "next/image";
import { PlaceholderStill } from "@/components/work/PlaceholderStill";

const SIZES = "(min-width: 800px) 752px, calc(100vw - 48px)";

export type DetailHeroProps = {
  src: string;
  alt: string;
  caption?: string;
  id?: string;
  priority?: boolean;
};

/** Shared 16:9 hero on the reading track (752). Caption sits below the frame. */
export function DetailHero({
  src,
  alt,
  caption,
  id,
  priority = true,
}: DetailHeroProps) {
  const placeholder = src.startsWith("/work/placeholders/");

  return (
    <div className="mt-10">
      <figure
        data-detail-hero
        id={id}
        className="border-border-ide relative aspect-video w-full overflow-hidden rounded-[4px] border"
      >
        {placeholder ? (
          <div role="img" aria-label={alt} className="absolute inset-0">
            <PlaceholderStill ratio="16:9" fit="slice" />
          </div>
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={SIZES}
            className="object-cover object-center"
          />
        )}
      </figure>
      {caption ? (
        <p className="font-jetbrains text-foreground mt-2 text-xs tracking-wide uppercase">
          {caption}
        </p>
      ) : null}
    </div>
  );
}
