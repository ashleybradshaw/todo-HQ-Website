import Link from "next/link";
import { FloorGhostDuo } from "@/components/ide/FloorGhost";
import { TypeComment } from "@/components/TypeComment";
import { aboutPage } from "@/content/pages/about";
import { cn } from "@/lib/cn";

/**
 * Book coffee chrome on invert band — tokens against --background (band text).
 * Spray remaps the pair; never paint with --foreground (band fill) on this surface.
 * Opaque border/fill so CTAs stay readable under global NoiseOverlay grain (z-50).
 */
const bandBtn =
  "font-jetbrains relative inline-flex min-h-11 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border px-4 py-2 text-xs font-bold tracking-wider transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--background)]";

const secondaryBtn = cn(
  bandBtn,
  "border-background bg-transparent text-background",
);

/** Primary: solid band-text fill so grain can’t muddy the label. */
const primaryBtn = cn(
  bandBtn,
  "border-background bg-background text-foreground",
);

export function WorkTogetherBand() {
  const { workTogether } = aboutPage;

  return (
    <section
      aria-label="Work together"
      className="relative left-1/2 mt-16 w-screen -translate-x-1/2 border-t border-[color-mix(in_srgb,var(--background)_20%,transparent)] bg-foreground text-background"
    >
      <div className="mx-auto grid max-w-[1336px] grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-16">
        <div className="lg:col-span-8">
          <TypeComment text={workTogether.eyebrow} />
          <h2 className="type-heading mt-3 text-balance">{workTogether.title}</h2>
          <p className="type-subhead mt-4 text-background">
            {workTogether.subtitle}
          </p>
          <p className="type-body mt-4 max-w-[40rem] text-background">
            {workTogether.body}
          </p>
          <div className="relative z-[60] mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link href={workTogether.ctaHref} className={primaryBtn}>
              <span className="relative z-10">{workTogether.ctaLabel}</span>
              <span aria-hidden="true" className="spray-shine-wash" />
              <span aria-hidden="true" className="spray-shine-edge" />
            </Link>
            <Link href={workTogether.secondary.href} className={secondaryBtn}>
              {workTogether.secondary.label}
            </Link>
          </div>
        </div>

        <div className="flex justify-start lg:col-span-4 lg:justify-center lg:pr-6 xl:pr-10">
          <FloorGhostDuo />
        </div>
      </div>
    </section>
  );
}
