"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { MirageSpinner } from "@/components/ide/MirageSpinner";
import { DecodeLabel } from "@/components/DecodeLabel";
import { cn } from "@/lib/cn";
import {
  useTelemetryRotation,
  type StatusTone,
} from "@/hooks/useTelemetryRotation";
import { homePage } from "@/content/pages/home";

const { telemetry, chrome } = homePage;

/** Agents tick 03↔04 on this cadence (// TEST COPY simulation). */
const AGENTS_TICK_MS = 10_000;

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function StatusDot({
  tone,
  pulse,
  delayMs = 0,
}: {
  tone: StatusTone;
  pulse: boolean;
  delayMs?: number;
}) {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      className="shrink-0"
      aria-hidden="true"
      style={delayMs ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      <circle
        cx="4"
        cy="4"
        r="3"
        className={cn(
          pulse && "status-dot-pulse",
          tone === "online" && "fill-syn-string",
          tone === "building" && "fill-foreground",
          tone === "pending" && "fill-status-pending",
        )}
      />
    </svg>
  );
}

type TelemetryProps = {
  /** 0-based active pipeline stage index. */
  pipelineIndex: number;
  pipelineTotal: number;
  /** Bump when IDE reveal should scramble sidecar labels. */
  revealPlayKey?: number;
};

/**
 * Restored factory telemetry panel (from pre-Zed Telemetry.tsx at 231cc3a).
 * Header folds agents count + spinner; no aria-live on ticking values.
 */
export function Telemetry({
  pipelineIndex,
  pipelineTotal,
  revealPlayKey = 0,
}: TelemetryProps) {
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );
  const telem = useTelemetryRotation();
  const [agents, setAgents] = useState(3);
  const [agentsPlayKey, setAgentsPlayKey] = useState(0);
  const [infraPlayKey, setInfraPlayKey] = useState(0);
  const [sprintPlayKey, setSprintPlayKey] = useState(0);
  const [checkpointPlayKey, setCheckpointPlayKey] = useState(0);

  const checkpoint = chrome.pipelineLabel
    .replace("{n}", String(pipelineIndex + 1).padStart(2, "0"))
    .replace("{total}", String(pipelineTotal).padStart(2, "0"));

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    const id = window.setInterval(() => {
      setAgents((current) => {
        const next = current === 3 ? 4 : 3;
        setAgentsPlayKey((k) => k + 1);
        return next;
      });
    }, AGENTS_TICK_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  useEffect(() => {
    if (telem.reduceMotion) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- scramble when rotating project/infra changes
    setInfraPlayKey((k) => k + 1);
    setSprintPlayKey((k) => k + 1);
  }, [telem.infra.label, telem.projectName, telem.reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- scramble when checkpoint advances
    setCheckpointPlayKey((k) => k + 1);
  }, [checkpoint, reduceMotion]);

  const agentsValue = String(agents).padStart(2, "0");
  const fadeClass = cn(
    "transition-opacity ease-out",
    telem.reduceMotion || telem.visible ? "opacity-100" : "opacity-0",
  );
  const fadeStyle = { transitionDuration: `${telem.fadeMs}ms` } as const;

  return (
    <section
      className="shrink-0 border-t border-border-ide"
      aria-label={telemetry.sectionAria}
    >
      <p className="sr-only">{telem.rosterSummary}</p>

      {/* Combined header: quiet label + agents spinner/count (no drift meter) */}
      <div className="border-b border-border-ide flex items-center justify-between gap-3 px-2 py-1.5">
        <p className="font-jetbrains text-muted text-[10px] tracking-wide lg:text-[11px]">
          <DecodeLabel
            text={telemetry.header}
            playKey={revealPlayKey}
            settleColor="var(--text-muted)"
          />
        </p>
        <p
          className="font-jetbrains text-foreground flex shrink-0 items-center gap-1.5 text-[10px] tabular-nums lg:text-[11px]"
          title={telemetry.keys.agents}
        >
          <MirageSpinner
            className="text-foreground"
            style={{ ["--mirage-size" as string]: "24px" }}
          />
          <span className="text-muted sr-only">{telemetry.keys.agents}</span>
          <DecodeLabel text={agentsValue} playKey={agentsPlayKey} />
        </p>
      </div>

      <dl className="font-jetbrains text-[10px] leading-5 lg:text-[11px]">
        <div className="border-b border-border-ide flex items-center justify-between gap-3 px-2 py-2">
          <dt className="text-muted shrink-0">{telemetry.keys.infra}</dt>
          <dd
            className={cn(
              "text-foreground flex shrink-0 items-center gap-1.5 tabular-nums",
              fadeClass,
            )}
            style={fadeStyle}
          >
            <StatusDot
              tone={telem.infra.tone}
              pulse={!telem.reduceMotion}
              delayMs={0}
            />
            <DecodeLabel text={telem.infra.label} playKey={infraPlayKey} />
          </dd>
        </div>

        <div className="border-b border-border-ide flex items-center justify-between gap-3 px-2 py-2">
          <dt className="text-muted shrink-0">{telemetry.keys.sprint}</dt>
          <dd
            className={cn(
              "text-foreground shrink-0 text-right tabular-nums",
              fadeClass,
            )}
            style={fadeStyle}
          >
            <DecodeLabel text={telem.projectName} playKey={sprintPlayKey} />
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3 px-2 py-2">
          <dt className="text-muted shrink-0">{telemetry.keys.checkpoint}</dt>
          <dd className="text-foreground flex shrink-0 items-center gap-1.5 tabular-nums">
            <StatusDot
              tone="online"
              pulse={!reduceMotion}
              delayMs={800}
            />
            <span className="text-syn-string" aria-hidden="true">
              {chrome.pipelineDot}
            </span>
            <DecodeLabel text={checkpoint} playKey={checkpointPlayKey} />
          </dd>
        </div>
      </dl>
    </section>
  );
}
