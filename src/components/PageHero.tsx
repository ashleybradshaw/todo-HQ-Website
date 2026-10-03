import type { ReactNode } from "react";
import { TypeComment } from "@/components/TypeComment";
import { cn } from "@/lib/cn";

export type HeadingLevel = "h1" | "h2" | "h3";

export type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  lede: string | readonly string[];
  className?: string;
  /** Page heroes stay h1. Specimens pass h2 or h3. */
  headingLevel?: HeadingLevel;
};

/** Hero A. Centred on the track. Label top is the shell’s pt-28 (112px). */
export function PageHero({
  eyebrow,
  title,
  lede,
  className,
  headingLevel = "h1",
}: PageHeroProps) {
  const paragraphs = typeof lede === "string" ? [lede] : lede;
  const Title = headingLevel;

  return (
    <header data-hero className={cn("text-center", className)}>
      <div data-hero-label className="type-label">
        <TypeComment text={eyebrow} />
        <div className="border-border-ide mt-3 border-t" />
      </div>
      <Title
        data-hero-title
        className="type-display mx-auto mt-4 text-center font-bold tracking-tight text-balance"
      >
        {title}
      </Title>
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
