"use client";

import Link from "next/link";
import { homePage } from "@/content/pages/home";
import { HOME_FRAME } from "@/components/ide/homeFrame";

const { hero } = homePage;

const sharedCta =
  "inline-flex h-9 w-fit cursor-pointer items-center justify-center rounded-[4px] px-4 font-jetbrains text-xs font-bold tracking-wider uppercase transition-[background-color,border-color,color] duration-[400ms] ease-in-out focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none";

const primaryCta = `${sharedCta} border border-transparent bg-foreground text-bg-canvas hover:bg-[color-mix(in_srgb,var(--foreground)_90%,var(--bg-canvas))]`;

const secondaryCta = `${sharedCta} border border-foreground bg-transparent text-foreground hover:bg-ide-chrome`;

export function HomeHero() {
  return (
    <section
      className={`${HOME_FRAME} relative z-10 flex flex-col items-center pt-[12vh] pb-0 text-center md:pt-[24vh]`}
    >
      <h1 className="type-title text-foreground max-w-[18ch] text-balance tracking-tight md:max-w-[22ch]">
        {hero.h1}
      </h1>
      <p className="type-body text-foreground mt-5 max-w-[40rem]">
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
