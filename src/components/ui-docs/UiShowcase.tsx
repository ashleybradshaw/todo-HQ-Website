"use client";

import {
  UiShowcaseGrid,
  UiShowcaseHeader,
} from "@/components/ui-docs/UiShowcaseChrome";
import { BrandTile } from "@/components/ui-docs/tiles/BrandTile";
import { ColourTile } from "@/components/ui-docs/tiles/ColourTile";
import { ComponentsTile } from "@/components/ui-docs/tiles/ComponentsTile";
import { GridSpacingTile } from "@/components/ui-docs/tiles/GridSpacingTile";
import { HawkTile } from "@/components/ui-docs/tiles/HawkTile";
import { IconsTile } from "@/components/ui-docs/tiles/IconsTile";
import { InTheWildTile } from "@/components/ui-docs/tiles/InTheWildTile";
import { MotionTile } from "@/components/ui-docs/tiles/MotionTile";
import { RulesBand } from "@/components/ui-docs/tiles/RulesBand";
import { TypeTile } from "@/components/ui-docs/tiles/TypeTile";

/**
 * TODO UI showcase — Geist-style shared-edge tile grid on powder HQ canvas.
 * Tile order (md+): Brand|Colour → Hawk → Type|Icons → Components → Grid|Motion → In the wild.
 */
export function UiShowcase() {
  return (
    <div className="bg-canvas text-foreground min-h-dvh min-w-0 overflow-x-hidden">
      <div className="mx-auto w-full max-w-6xl min-w-0 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <UiShowcaseHeader />
        <UiShowcaseGrid>
          <BrandTile />
          <ColourTile />
          <HawkTile />
          <TypeTile />
          <IconsTile />
          <ComponentsTile />
          <GridSpacingTile />
          <MotionTile />
          <InTheWildTile />
        </UiShowcaseGrid>
        <RulesBand />
      </div>
    </div>
  );
}
