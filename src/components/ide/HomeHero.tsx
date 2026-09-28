"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { homePage } from "@/content/pages/home";
import { HeroFlowField } from "@/components/ide/HeroFlowField";
import { HOME_FRAME } from "@/components/ide/homeFrame";

const { hero } = homePage;

const sharedCta =
  "inline-flex h-9 w-fit cursor-pointer items-center justify-center rounded-[4px] px-4 font-jetbrains text-xs font-bold tracking-wider uppercase transition-[background-color,border-color,color] duration-[400ms] ease-in-out focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none";

const primaryCta = `${sharedCta} border border-transparent bg-foreground text-bg-canvas hover:bg-[color-mix(in_srgb,var(--foreground)_90%,var(--bg-canvas))]`;

const secondaryCta = `${sharedCta} border border-foreground bg-transparent text-foreground hover:bg-ide-chrome`;

/**
 * Sets --home-hero-rule-top so the shared hero/strip hairline + crosshairs
 * sit on the hero bottom edge (strip is flush beneath).
 */
export function HomeHero() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const sync = () => {
      const grid = el
        .closest("main")
        ?.querySelector<HTMLElement>("[data-home-grid]");
      if (!grid) return;
      const top = Math.round(
        el.getBoundingClientRect().bottom - grid.getBoundingClientRect().top,
      );
      grid.style.setProperty("--home-hero-rule-top", `${top}px`);
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className={`${HOME_FRAME} relative z-10 flex flex-col items-center pt-[12vh] pb-10 text-center md:pt-[24vh] md:pb-12`}
    >
      <HeroFlowField />
      {/*
        Mobile: ~28px at 360 → ~30–32px at 390 so line 1 stays one line.
        Line 2 may wrap after "Working"; "software out." stays nowrap.
        Desktop: two lines at 36/40.
      */}
      <h1 className="font-unbounded text-foreground w-full max-w-none text-[clamp(1.75rem,7.78vw,2.25rem)] leading-[1.12] font-bold tracking-tight md:max-w-[22ch] md:text-[36px] md:leading-[40px]">
        <span className="block whitespace-nowrap">{hero.h1Lines[0]}</span>
        <span className="block md:whitespace-nowrap">
          {hero.h1Line2.word}{" "}
          <span className="whitespace-nowrap">{hero.h1Line2.rest}</span>
        </span>
      </h1>
      <p className="type-body text-foreground mt-5 max-w-[40rem] text-balance">
        {hero.lead}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href={hero.primaryCta.href} className={primaryCta}>
          {hero.primaryCta.label}
        </Link>
        <Link href={hero.secondaryCta.href} className={secondaryCta}>
          {hero.secondaryCta.label}
        </Link>
      </div>
    </section>
  );
}
