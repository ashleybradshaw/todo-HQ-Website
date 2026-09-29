"use client";

import { homePage } from "@/content/pages/home";
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

/**
 * Editor chrome status bar — branch / problems / Ln / UTF-8 / language.
 * Quiet live signal: checkpoint chip (also shown in full on telemetry).
 */
export function IdeStatusStrip({
  line,
  col = 1,
  activeTab,
  pipelineIndex,
  pipelineTotal,
}: IdeStatusStripProps) {
  const lnLabel = statusStrip.lnCol
    .replace("{line}", String(line))
    .replace("{col}", String(col));

  const pipelineRest = chrome.pipelineLabel
    .replace("{n}", String(pipelineIndex + 1).padStart(2, "0"))
    .replace("{total}", String(pipelineTotal).padStart(2, "0"));

  const language = chrome.languageByTab[activeTab];

  return (
    <div
      className="ide-boot-status bg-ide-chrome border-border-ide font-jetbrains flex shrink-0 items-center justify-between gap-x-3 border-t px-3 py-1 text-[10px] tracking-wide tabular-nums lg:text-[11px]"
      aria-label={`${statusStrip.ariaPrefix}${lnLabel}`}
    >
      <span className="text-muted flex min-w-0 shrink items-center gap-x-1.5 overflow-hidden">
        <span className="shrink-0">{chrome.statusBranch}</span>
        <span className="hidden opacity-40 md:inline" aria-hidden="true">
          ·
        </span>
        <span className="hidden shrink-0 md:inline">{chrome.statusProblems}</span>
      </span>

      <span className="text-muted flex min-w-0 shrink items-center gap-x-1.5 overflow-hidden">
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
        <span className="text-muted hidden shrink-0 items-center gap-1 md:inline-flex">
          <span className="text-syn-string" aria-hidden="true">
            {chrome.pipelineDot}
          </span>
          <span>{pipelineRest}</span>
        </span>
      </span>
    </div>
  );
}
