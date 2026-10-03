"use client";

import { PageShell } from "@/components/PageShell";
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
import { uiPage } from "@/content/pages/ui";

/**
 * TODO UI showcase. Hero A on the frame track, then the live spec sections.
 */
export function UiShowcase() {
  const { header } = uiPage;

  return (
    <PageShell
      variant="index"
      eyebrow={header.eyebrow}
      title={
        <>
          {header.titleLine1}
          <br className="md:hidden" /> {header.titleLine2}
        </>
      }
      lede={header.subtitle}
    >
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
    </PageShell>
  );
}
