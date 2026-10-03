"use client";

import { useSyncExternalStore } from "react";
import { CountUp } from "@/components/work/CountUp";
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
      id="ui-motion"
      eyebrow={motion.eyebrow}
      metric={motion.metric}
      title={motion.title}
      description={motion.description}
    >
      <div className="flex min-w-0 flex-col gap-6">
        <SpecBox variant="master" caption="// reveal curve">
          <EaseCurve />
          <MetricChips
            name="curve"
            values={["400ms", "cubic-bezier(0.22, 1, 0.36, 1)"]}
            className="mt-3"
          />
          <p className="type-caption text-muted mt-3">
            Demos loop so you can see the curve. Live reveals play once.
            Reduced motion: animation off.
          </p>
        </SpecBox>

        <SpecGrid cols={3}>
          <SpecBox caption="// fade">
            <div className="border-border-ide flex h-24 items-center justify-center rounded-[4px] border">
              <Bone
                className={cn("size-12", !reduceMotion && "ui-spec-fade")}
              />
            </div>
            <MetricChips
              name="fade"
              values={["400ms", "cubic-bezier(0.22, 1, 0.36, 1)"]}
              className="mt-3"
            />
          </SpecBox>

          <SpecBox caption="// slide">
            <div className="border-border-ide flex h-24 items-center justify-center overflow-hidden rounded-[4px] border">
              <Bone
                className={cn("size-12", !reduceMotion && "ui-spec-slide")}
              />
            </div>
            <MetricChips
              name="slide"
              values={["400ms", "cubic-bezier(0.22, 1, 0.36, 1)"]}
              className="mt-3"
            />
          </SpecBox>

          <SpecBox caption="// bone morph">
            <div className="border-border-ide flex h-24 items-center justify-center rounded-[4px] border">
              <Bone
                className={cn("h-8 w-20", !reduceMotion && "ui-spec-bone")}
              />
            </div>
            <MetricChips
              name="bone"
              values={["400ms", "cubic-bezier(0.22, 1, 0.36, 1)"]}
              className="mt-3"
            />
          </SpecBox>
        </SpecGrid>

        <SpecGrid cols={3}>
          <SpecBox caption="// status pulse">
            <span
              className="status-dot-pulse bg-syn-string inline-block size-2 rounded-full"
              aria-hidden="true"
            />
            <p className="type-caption text-muted mt-3">
              2.4s cubic-bezier(0.4, 0, 0.6, 1). Reduced motion: animation off.
            </p>
          </SpecBox>

          <SpecBox caption="// count up">
            <CountUp value={48} variant="stat" />
            <p className="type-caption text-muted mt-3">
              400ms when it enters. Reduced motion stays on the final value.
            </p>
          </SpecBox>

          <SpecBox caption="// type comment">
            <p className="type-body-sm text-foreground">
              {"// titles type in, 18 to 34ms per character, capped at 480ms. Reduced motion shows the full string."}
            </p>
          </SpecBox>
        </SpecGrid>
      </div>
    </SpecSection>
  );
}
