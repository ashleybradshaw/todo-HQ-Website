"use client";

import { useSyncExternalStore } from "react";
import { Bone } from "@/components/ui-docs/spec/Bone";
import { MetricChips } from "@/components/ui-docs/spec/MetricChips";
import { SpecBox } from "@/components/ui-docs/spec/SpecBox";
import { SpecGrid } from "@/components/ui-docs/spec/SpecGrid";
import { SpecSection } from "@/components/ui-docs/spec/SpecSection";
import { cn } from "@/lib/cn";
import { uiPage } from "@/content/pages/ui";

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function EaseCurve() {
  return (
    <svg
      viewBox="0 0 200 100"
      className="text-foreground h-28 w-full max-w-md"
      aria-hidden="true"
    >
      <path
        d="M10 90 C 70 90, 130 10, 190 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="10" cy="90" r="2.5" fill="currentColor" />
      <circle cx="190" cy="10" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function MotionSpec() {
  const { motion } = uiPage.sections;
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );

  return (
    <SpecSection
      eyebrow={motion.eyebrow}
      metric={motion.metric}
      title={motion.title}
      description={motion.description}
    >
      <div className="flex min-w-0 flex-col gap-6">
        <SpecBox variant="master" caption="// ease-in-out">
          <EaseCurve />
          <MetricChips
            name="curve"
            values={["400ms", "ease-in-out"]}
            className="mt-3"
          />
        </SpecBox>

        <SpecGrid cols={3}>
          <SpecBox caption="// fade">
            <div className="border-border-ide flex h-24 items-center justify-center rounded-[4px] border">
              <Bone
                className={cn(
                  "size-12",
                  !reduceMotion && "ui-spec-fade",
                )}
              />
            </div>
            <MetricChips
              name="fade"
              values={["400ms", "ease-in-out"]}
              className="mt-3"
            />
          </SpecBox>

          <SpecBox caption="// slide">
            <div className="border-border-ide flex h-24 items-center justify-center overflow-hidden rounded-[4px] border">
              <Bone
                className={cn(
                  "size-12",
                  !reduceMotion && "ui-spec-slide",
                )}
              />
            </div>
            <MetricChips
              name="slide"
              values={["400ms", "ease-in-out"]}
              className="mt-3"
            />
          </SpecBox>

          <SpecBox caption="// bone morph">
            <div className="border-border-ide flex h-24 items-center justify-center rounded-[4px] border">
              <Bone
                className={cn(
                  "h-8 w-20",
                  !reduceMotion && "ui-spec-bone",
                )}
              />
            </div>
            <MetricChips
              name="bone"
              values={["400ms", "ease-in-out"]}
              className="mt-3"
            />
          </SpecBox>
        </SpecGrid>
      </div>
    </SpecSection>
  );
}
