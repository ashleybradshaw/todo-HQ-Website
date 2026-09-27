"use client";

import { cn } from "@/lib/cn";
import { homePage } from "@/content/pages/home";
import { MirageSpinner } from "@/components/ide/MirageSpinner";
import {
  useTelemetryRotation,
  type StatusTone,
} from "@/hooks/useTelemetryRotation";
import { useFactoryStream } from "@/hooks/useFactoryStream";
import type { IdeTabId } from "@/components/ide/IdeTabBar";

const { statusStrip, chrome } = homePage;

type IdeStatusStripProps = {
  line: number;
  col?: number;
  activeTab: IdeTabId;
  /** 0-based active pipeline stage index. */
  pipelineIndex: number;
  pipelineTotal: number;
};

function StatusDot({
  tone,
  pulse,
}: {
  tone: StatusTone;
  pulse: boolean;
}) {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      className="shrink-0"
      aria-hidden="true"
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

/** Document-flow status bar — agents + rotating project telemetry live here. */
export function IdeStatusStrip({
  line,
  col = 1,
  activeTab,
  pipelineIndex,
  pipelineTotal,
}: IdeStatusStripProps) {
  const feed = useFactoryStream();
  const telem = useTelemetryRotation();

  const lnLabel = statusStrip.lnCol
    .replace("{line}", String(line))
    .replace("{col}", String(col));

  const pipelineRest = chrome.pipelineLabel
    .replace("{n}", String(pipelineIndex + 1).padStart(2, "0"))
    .replace("{total}", String(pipelineTotal).padStart(2, "0"));

  const agentsLabel = `${chrome.agentsPrefix} ${String(feed.agents).padStart(2, "0")}`;
  const language = chrome.languageByTab[activeTab];

  const fadeClass = cn(
    "transition-opacity ease-out",
    telem.reduceMotion || telem.visible ? "opacity-100" : "opacity-0",
  );
  const fadeStyle = { transitionDuration: `${telem.fadeMs}ms` } as const;

  return (
    <div
      className="ide-boot-status bg-ide-chrome border-border-ide-strong font-jetbrains flex shrink-0 items-center justify-between gap-x-3 border-t px-3 py-1 text-[10px] tracking-wide tabular-nums lg:text-[11px]"
      aria-label={`${statusStrip.ariaPrefix}${lnLabel}`}
    >
      <p className="sr-only">{telem.rosterSummary}</p>

      <span className="text-muted flex min-w-0 shrink items-center gap-x-1.5 overflow-hidden">
        <span className="shrink-0">{chrome.statusBranch}</span>
        <span className="hidden opacity-40 md:inline" aria-hidden="true">
          ·
        </span>
        <span className="hidden shrink-0 md:inline">{chrome.statusProblems}</span>
        <span className="hidden opacity-40 md:inline" aria-hidden="true">
          ·
        </span>
        <span className="text-foreground hidden shrink-0 md:inline">
          {agentsLabel}
        </span>
      </span>

      <span className="text-muted flex min-w-0 shrink items-center gap-x-1.5 overflow-hidden">
        <span
          aria-hidden="true"
          className={cn(
            "text-foreground hidden shrink-0 items-center gap-1.5 md:inline-flex",
            fadeClass,
          )}
          style={fadeStyle}
        >
          <MirageSpinner
            className="text-foreground"
            style={{ ["--mirage-size" as string]: "18px" }}
          />
          <StatusDot tone={telem.infra.tone} pulse={!telem.reduceMotion} />
          <span>{telem.infra.label}</span>
          <span className="opacity-40">·</span>
          <span>{telem.projectName}</span>
        </span>
        <span className="hidden shrink-0 opacity-40 md:inline" aria-hidden="true">
          ·
        </span>
        <span className="shrink-0">{lnLabel}</span>
        <span className="hidden shrink-0 opacity-40 md:inline" aria-hidden="true">
          ·
        </span>
        <span className="hidden shrink-0 md:inline">{statusStrip.utf8}</span>
        <span className="hidden shrink-0 opacity-40 md:inline" aria-hidden="true">
          ·
        </span>
        <span className="hidden shrink-0 md:inline">{language}</span>
        <span className="hidden shrink-0 opacity-40 md:inline" aria-hidden="true">
          ·
        </span>
        <span
          className="text-muted hidden shrink-0 items-center gap-1 md:inline-flex"
          aria-live="polite"
        >
          <span className="text-syn-string" aria-hidden="true">
            {chrome.pipelineDot}
          </span>
          <span>{pipelineRest}</span>
        </span>
      </span>
    </div>
  );
}
