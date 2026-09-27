"use client";

import type { ReactNode } from "react";
import { UiTile } from "@/components/ui-docs/UiTile";
import { SPACING_STEPS } from "@/lib/ui-docs/tokenRegistry";
import { uiPage } from "@/content/pages/ui";

function CrosshairField({ children }: { children: ReactNode }) {
  return (
    <div className="border-border-ide relative min-h-[160px] overflow-hidden rounded-[4px] border p-4">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1 left-1 size-3 border-t border-l border-[#4545FF]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1 right-1 size-3 border-t border-r border-[#4545FF]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1 left-1 size-3 border-b border-l border-[#4545FF]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-1 bottom-1 size-3 border-r border-b border-[#4545FF]"
      />
      {/* Guide lines */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-1/2 border-t border-dashed border-[color-mix(in_srgb,#4545FF_30%,transparent)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-4 left-1/2 border-l border-dashed border-[color-mix(in_srgb,#4545FF_30%,transparent)]"
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

export function GridSpacingTile() {
  const { grid } = uiPage.tiles;

  return (
    <UiTile title={grid.title} description={grid.description}>
      <div className="flex min-w-0 flex-col gap-5">
        <CrosshairField>
          <p className="type-caption text-muted text-center">
            {/* // TEST COPY */}
            layout grid · crosshair corners
          </p>
        </CrosshairField>

        <ul className="space-y-2">
          {SPACING_STEPS.map((step) => (
            <li
              key={step.token}
              className="font-jetbrains flex min-w-0 items-center gap-2 text-[10px] sm:gap-3 sm:text-xs"
            >
              <span className="text-muted w-8 shrink-0 tabular-nums sm:w-10">
                {step.token}
              </span>
              <span
                className="bg-foreground h-2.5 max-w-[min(100%,12rem)] shrink-0 rounded-[1px] sm:h-3"
                style={{ width: step.rem }}
                aria-hidden="true"
              />
              <span className="text-foreground shrink-0 tabular-nums">
                {step.px}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <p className="type-label text-muted mb-2">Radius · 4px</p>
            <div className="border-border-ide bg-foreground/15 size-14 rounded-[4px] border" />
          </div>
          <div>
            <p className="type-label text-muted mb-2">Focus · 3px</p>
            <button
              type="button"
              className="font-jetbrains rounded-[4px] border border-current px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none"
            >
              Tab here
            </button>
          </div>
        </div>
      </div>
    </UiTile>
  );
}
