"use client";

import { LOGO_PATHS, LOGO_VIEWBOX } from "@/components/LogoStatic";
import { MetricChips } from "@/components/ui-docs/spec/MetricChips";
import { SpecBox } from "@/components/ui-docs/spec/SpecBox";
import { SpecGrid } from "@/components/ui-docs/spec/SpecGrid";
import { SpecSection } from "@/components/ui-docs/spec/SpecSection";
import { uiPage } from "@/content/pages/ui";
import type { ReactNode } from "react";

const PRODUCT_MARKS = [
  { name: "RepDaily", src: "/logos/repdaily.svg" },
  { name: "ReadyGo", src: "/logos/readygo.svg" },
  { name: "Contentic", src: "/logos/contentic.svg" },
] as const;

function ConstructionGrid({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative flex min-h-[200px] items-center justify-center overflow-hidden rounded-[4px]"
      style={{
        backgroundImage: `
          linear-gradient(to right, color-mix(in srgb, #4545FF 18%, transparent) 1px, transparent 1px),
          linear-gradient(to bottom, color-mix(in srgb, #4545FF 18%, transparent) 1px, transparent 1px)
        `,
        backgroundSize: "24px 24px",
      }}
    >
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

export function BrandSpec() {
  const { brand } = uiPage.sections;

  return (
    <SpecSection
      id="ui-brand"
      eyebrow={brand.eyebrow}
      metric={brand.metric}
      title={brand.title}
      description={brand.description}
    >
      <div className="flex min-w-0 flex-col gap-4">
        <SpecBox variant="master" caption="// lockup">
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
          <div className="mt-4 flex flex-wrap gap-2">
            <MetricChips name="clear" values={["24px"]} />
            <MetricChips name="min" values={["120×35"]} />
          </div>
        </SpecBox>

        <SpecGrid cols={3}>
          {PRODUCT_MARKS.map((mark) => (
            <SpecBox key={mark.name} caption={mark.name}>
              <div className="flex items-center gap-3">
                <span
                  className="size-8 shrink-0 bg-foreground"
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
              </div>
            </SpecBox>
          ))}
        </SpecGrid>
      </div>
    </SpecSection>
  );
}
