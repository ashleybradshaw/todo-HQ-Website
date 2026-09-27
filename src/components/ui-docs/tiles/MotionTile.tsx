"use client";

import {
  useCallback,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { IdeBoneOverlay } from "@/components/ide/IdeBoneOverlay";
import { UiTile } from "@/components/ui-docs/UiTile";
import type { IdeBootPhase } from "@/hooks/useIdeBoot";
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
    <div className="border-border-ide min-w-0 rounded-[4px] border">
      <div className="border-border-ide flex flex-wrap items-center justify-between gap-2 border-b px-2.5 py-1.5">
        <h3 className="type-label text-muted">{title}</h3>
        {onReplay ? (
          <button
            type="button"
            onClick={onReplay}
            className="font-jetbrains rounded-[4px] border border-border-ide px-2 py-0.5 text-[10px] tracking-wider uppercase transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none"
          >
            Replay
          </button>
        ) : null}
      </div>
      <div className="min-w-0 p-2.5">{children}</div>
    </div>
  );
}

function TransitionDemo({ reduceMotion }: { reduceMotion: boolean }) {
  const [on, setOn] = useState(false);
  return (
    <DemoCard title="400ms">
      <button
        type="button"
        onClick={() => !reduceMotion && setOn((v) => !v)}
        className={cn(
          "font-jetbrains w-full rounded-[4px] border border-current px-3 py-3 text-xs font-bold tracking-wider uppercase",
          reduceMotion
            ? "bg-foreground/10"
            : "transition-[background-color,color,opacity] duration-[400ms] ease-in-out",
          on
            ? "bg-foreground text-background"
            : "bg-transparent text-foreground",
        )}
      >
        {reduceMotion ? "Static" : on ? "On" : "Toggle"}
      </button>
    </DemoCard>
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
    <DemoCard title="bone load-in" onReplay={reduceMotion ? undefined : replay}>
      {reduceMotion ? (
        <p className="type-caption text-syn-comment">
          {/* // TEST COPY */}
          prefers-reduced-motion — static.
        </p>
      ) : (
        <div
          key={key}
          className="border-border-ide relative h-28 overflow-hidden rounded-[4px] border"
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

function SelectionDemo() {
  return (
    <DemoCard title="selection">
      <p className="type-body-sm text-foreground select-text">
        {/* // TEST COPY */}
        Select this text — uses --selection-bg / --selection-fg.
      </p>
    </DemoCard>
  );
}

export function MotionTile() {
  const { motion } = uiPage.tiles;
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );

  return (
    <UiTile title={motion.title} description={motion.description}>
      <div className="flex min-w-0 flex-col gap-3">
        <TransitionDemo reduceMotion={reduceMotion} />
        <BoneBootDemo reduceMotion={reduceMotion} />
        <SelectionDemo />
      </div>
    </UiTile>
  );
}
