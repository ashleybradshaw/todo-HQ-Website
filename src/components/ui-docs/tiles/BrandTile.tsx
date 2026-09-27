"use client";

import type { ReactNode } from "react";
import { LOGO_PATHS, LOGO_VIEWBOX } from "@/components/LogoStatic";
import { UiTile } from "@/components/ui-docs/UiTile";
import { uiPage } from "@/content/pages/ui";

const PRODUCT_MARKS = [
  { name: "RepDaily", src: "/logos/repdaily.svg" },
  { name: "ReadyGo", src: "/logos/readygo.svg" },
  { name: "Contentic", src: "/logos/contentic.svg" },
] as const;

function ConstructionGrid({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-[4px] border border-dashed border-[color-mix(in_srgb,#4545FF_35%,transparent)]"
      style={{
        backgroundImage: `
          linear-gradient(to right, color-mix(in srgb, #4545FF 18%, transparent) 1px, transparent 1px),
          linear-gradient(to bottom, color-mix(in srgb, #4545FF 18%, transparent) 1px, transparent 1px)
        `,
        backgroundSize: "24px 24px",
      }}
    >
      {/* Corner crosshairs */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-2 left-2 size-3 border-t border-l border-[#4545FF]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-2 right-2 size-3 border-t border-r border-[#4545FF]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-2 left-2 size-3 border-b border-l border-[#4545FF]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-2 bottom-2 size-3 border-r border-b border-[#4545FF]"
      />
      {children}
    </div>
  );
}

export function BrandTile() {
  const { brand } = uiPage.tiles;

  return (
    <UiTile title={brand.title} description={brand.description}>
      <div className="flex min-w-0 flex-col gap-4">
        <ConstructionGrid>
          <svg
            viewBox={LOGO_VIEWBOX}
            className="relative z-[1] h-10 w-auto text-[var(--brand-logo)] sm:h-12"
            aria-label="//TODO lockup"
          >
            {LOGO_PATHS.map((glyph) => (
              <path key={glyph.id} d={glyph.d} fill="currentColor" />
            ))}
          </svg>
        </ConstructionGrid>
        <ul className="flex min-w-0 flex-wrap items-center gap-4">
          {PRODUCT_MARKS.map((mark) => (
            <li
              key={mark.name}
              className="flex min-w-0 items-center gap-2"
            >
              <span
                className="size-7 shrink-0 bg-foreground"
                style={{
                  maskImage: `url(${mark.src})`,
                  WebkitMaskImage: `url(${mark.src})`,
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                }}
                aria-hidden="true"
              />
              <span className="font-jetbrains text-muted text-[10px] tracking-wider uppercase">
                {mark.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </UiTile>
  );
}
