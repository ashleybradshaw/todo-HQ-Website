"use client";

import { useCallback, useState, useSyncExternalStore, type ReactNode } from "react";
import { IdeBoneOverlay } from "@/components/ide/IdeBoneOverlay";
import { Telemetry } from "@/components/Telemetry";
import { UiSectionFrame } from "@/components/ui-docs/UiSectionFrame";
import { SNIPPETS } from "@/lib/ui-docs/snippets";
import type { IdeBootPhase } from "@/hooks/useIdeBoot";
import { cn } from "@/lib/cn";

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function ReplayButton({
  label,
  onReplay,
}: {
  label: string;
  onReplay: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onReplay}
      className="font-jetbrains rounded-[4px] border border-border-ide px-2 py-1 text-[10px] tracking-wider uppercase transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none"
    >
      Replay {label}
    </button>
  );
}

function DemoCard({
  title,
  children,
  onReplay,
}: {
  title: string;
  children: ReactNode;
  onReplay?: () => void;
}) {
  return (
    <div className="min-w-0 rounded-[4px] border border-border-ide">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-ide px-3 py-2">
        <h3 className="type-label text-muted">{title}</h3>
        {onReplay ? <ReplayButton label={title} onReplay={onReplay} /> : null}
      </div>
      <div className="p-3 min-w-0">{children}</div>
    </div>
  );
}

function BoneBootDemo({ reduceMotion }: { reduceMotion: boolean }) {
  const [phase, setPhase] = useState<IdeBootPhase>(
    reduceMotion ? "done" : "bones",
  );
  const [key, setKey] = useState(0);

  const replay = useCallback(() => {
    if (reduceMotion) return;
    setKey((k) => k + 1);
    setPhase("bones");
    window.setTimeout(() => setPhase("tabs"), 400);
    window.setTimeout(() => setPhase("content"), 800);
    window.setTimeout(() => setPhase("done"), 1400);
  }, [reduceMotion]);

  return (
    <DemoCard title="bone / boot" onReplay={reduceMotion ? undefined : replay}>
      {reduceMotion ? (
        <p className="type-caption text-syn-comment">
          {/* // TEST COPY */}
          prefers-reduced-motion — static editor chrome (no bone morph).
        </p>
      ) : (
        <div
          key={key}
          className="relative h-40 overflow-hidden rounded-[4px] border border-border-ide"
          data-ide-boot={phase}
        >
          <IdeBoneOverlay phase={phase === "done" ? "bones" : phase} />
          {phase === "done" ? (
            <p className="font-jetbrains absolute inset-0 flex items-center justify-center text-xs text-foreground">
              boot complete
            </p>
          ) : null}
        </div>
      )}
    </DemoCard>
  );
}

function SectionFadeDemo({ reduceMotion }: { reduceMotion: boolean }) {
  const [key, setKey] = useState(0);
  return (
    <DemoCard
      title="section fade"
      onReplay={reduceMotion ? undefined : () => setKey((k) => k + 1)}
    >
      {reduceMotion ? (
        <p className="type-body-sm text-foreground">Static section content.</p>
      ) : (
        <p
          key={key}
          className="st-content--fade type-body-sm text-foreground"
        >
          {/* // TEST COPY */}
          Section content fades in (~st-fade / 400ms family).
        </p>
      )}
    </DemoCard>
  );
}

function StatusPulseDemo({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <DemoCard title="status pulse">
      <div className="flex items-center gap-3">
        <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
          <circle
            cx="4"
            cy="4"
            r="3"
            className={cn(
              "fill-syn-string",
              !reduceMotion && "status-dot-pulse",
            )}
          />
        </svg>
        <span className="font-jetbrains text-xs text-foreground">
          {reduceMotion ? "ONLINE (static)" : "ONLINE (pulse)"}
        </span>
      </div>
    </DemoCard>
  );
}

function SprayShineDemo() {
  return (
    <DemoCard title="spray shine">
      <button
        type="button"
        className="relative inline-flex overflow-hidden rounded-[4px] border border-current px-4 py-2 font-jetbrains text-xs font-bold tracking-wider uppercase"
      >
        <span className="relative z-10">Shine CTA</span>
        <span aria-hidden="true" className="spray-shine-wash" />
        <span aria-hidden="true" className="spray-shine-edge" />
      </button>
    </DemoCard>
  );
}

export function MotionSection() {
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );

  return (
    <UiSectionFrame
      comment="// Motion — 400ms CSS demos. Replay each. TEST COPY."
      code={SNIPPETS.motion}
      example={
        <div className="space-y-4 min-w-0">
          <p className="type-caption text-syn-comment">
            {/* // TEST COPY */}
            Timing: 400ms ease-in-out for UI; reveals ~0.4s ease-out + 10px Y.
            {reduceMotion
              ? " Reduced motion is on — demos show static states."
              : ""}
          </p>
          <BoneBootDemo reduceMotion={reduceMotion} />
          <SectionFadeDemo reduceMotion={reduceMotion} />
          <StatusPulseDemo reduceMotion={reduceMotion} />
          <DemoCard title="sprint ticker">
            <div className="max-w-sm overflow-hidden rounded-[4px] border border-border-ide">
              <Telemetry agents={3} />
            </div>
          </DemoCard>
          <SprayShineDemo />
        </div>
      }
    />
  );
}
