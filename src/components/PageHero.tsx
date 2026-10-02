import type { ReactNode } from "react";
import { TypeComment } from "@/components/TypeComment";

export type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  lede: string;
};

/** Hero A. Centred on the track. Label top is the shell’s pt-28 (112px). */
export function PageHero({ eyebrow, title, lede }: PageHeroProps) {
  return (
    <header data-hero className="text-center">
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
      <p
        data-hero-sub
        className="type-body mx-auto mt-6 max-w-[592px] text-center text-pretty"
      >
        {lede}
      </p>
    </header>
  );
}
