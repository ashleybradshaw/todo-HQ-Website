"use client";

import { PageShell } from "@/components/PageShell";
import { BrandSpec } from "@/components/ui-docs/spec/sections/BrandSpec";
import { ColourSpec } from "@/components/ui-docs/spec/sections/ColourSpec";
import { TypeSpec } from "@/components/ui-docs/spec/sections/TypeSpec";
import { GridSpacingSpec } from "@/components/ui-docs/spec/sections/GridSpacingSpec";
import { HeroesSpec } from "@/components/ui-docs/spec/sections/HeroesSpec";
import { FramesMediaSpec } from "@/components/ui-docs/spec/sections/FramesMediaSpec";
import { WorkPartsSpec } from "@/components/ui-docs/spec/sections/WorkPartsSpec";
import { BlogAboutSpec } from "@/components/ui-docs/spec/sections/BlogAboutSpec";
import { IconographySpec } from "@/components/ui-docs/spec/sections/IconographySpec";
import { ButtonsSpec } from "@/components/ui-docs/spec/sections/ButtonsSpec";
import { InputsSpec } from "@/components/ui-docs/spec/sections/InputsSpec";
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
      <HeroesSpec />
      <FramesMediaSpec />
      <WorkPartsSpec />
      <BlogAboutSpec />
      <IconographySpec />
      <ButtonsSpec />
      <InputsSpec />
      <MotionSpec />
      <RulesBand />
    </PageShell>
  );
}
