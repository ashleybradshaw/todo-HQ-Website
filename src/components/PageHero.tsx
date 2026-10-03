import type { ReactNode } from "react";
import { TypeComment } from "@/components/TypeComment";
import { cn } from "@/lib/cn";

export type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  lede: string | readonly string[];
  className?: string;
};

/** Hero A. Centred on the track. Label top is the shell’s pt-28 (112px). */
export function PageHero({ eyebrow, title, lede, className }: PageHeroProps) {
  const paragraphs = typeof lede === "string" ? [lede] : lede;

  return (
    <header data-hero className={cn("text-center", className)}>
      <div data-hero-label className="type-label">
        <TypeComment text={eyebrow} />
        <div className="border-border-ide mt-3 border-t" />
      </div>
      <h1
        data-hero-title
        className="type-display mx-auto mt-4 text-center font-bold tracking-tight text-balance"
      >
        {title}
      </h1>
      {paragraphs.map((paragraph, index) =>
        index === 0 ? (
          <p
            key={index}
            data-hero-sub
            className="type-body mx-auto mt-6 max-w-[592px] text-center text-pretty"
          >
            {paragraph}
          </p>
        ) : (
          <p
            key={index}
            className="type-body mx-auto mt-4 max-w-[592px] text-center text-pretty"
          >
            {paragraph}
          </p>
        ),
      )}
    </header>
  );
}
