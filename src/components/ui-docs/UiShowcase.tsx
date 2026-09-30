"use client";

import { UiShowcaseHeader } from "@/components/ui-docs/UiShowcaseChrome";
import { BrandSpec } from "@/components/ui-docs/spec/sections/BrandSpec";
import { ColourSpec } from "@/components/ui-docs/spec/sections/ColourSpec";
import { TypeSpec } from "@/components/ui-docs/spec/sections/TypeSpec";
import { GridSpacingSpec } from "@/components/ui-docs/spec/sections/GridSpacingSpec";
import { IconographySpec } from "@/components/ui-docs/spec/sections/IconographySpec";
import { ButtonsSpec } from "@/components/ui-docs/spec/sections/ButtonsSpec";
import { InputsSpec } from "@/components/ui-docs/spec/sections/InputsSpec";
import { ComponentsSpec } from "@/components/ui-docs/spec/sections/ComponentsSpec";
import { MotionSpec } from "@/components/ui-docs/spec/sections/MotionSpec";
import { RulesBand } from "@/components/ui-docs/tiles/RulesBand";

/**
 * TODO UI showcase — stacked IDE-frame spec sections on powder HQ canvas.
 */
export function UiShowcase() {
  return (
    <main id="main" className="bg-bg-canvas text-foreground min-h-dvh min-w-0 overflow-x-hidden">
      <div className="mx-auto max-w-[1336px] px-6 pt-28 pb-16">
        <UiShowcaseHeader />
        <BrandSpec />
        <ColourSpec />
        <TypeSpec />
        <GridSpacingSpec />
        <IconographySpec />
        <ButtonsSpec />
        <InputsSpec />
        <ComponentsSpec />
        <MotionSpec />
        <RulesBand />
      </div>
    </main>
  );
}
