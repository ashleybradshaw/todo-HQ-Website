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

function BranchIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      className="shrink-0"
      aria-hidden="true"
    >
      <circle cx="2.5" cy="2.5" r="1.4" fill="currentColor" />
      <circle cx="2.5" cy="7.5" r="1.4" fill="currentColor" />
      <circle cx="7.5" cy="5" r="1.4" fill="currentColor" />
      <path
        d="M2.5 3.9v1.8M2.5 5.7c0 0 0-1.2 2.5-1.2H6"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      className="shrink-0"
      aria-hidden="true"
    >
      <circle
        cx="5"
        cy="5"
        r="3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path d="M3.2 3.2l3.6 3.6M6.8 3.2L3.2 6.8" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d="M5 1.5L9 8.5H1L5 1.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path d="M5 4v2.2" stroke="currentColor" strokeWidth="1" />
      <circle cx="5" cy="7.2" r="0.5" fill="currentColor" />
    </svg>
  );
}

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
      className="ide-boot-status bg-ide-chrome border-border-ide font-jetbrains flex shrink-0 items-center justify-between gap-x-3 border-t border-b px-3 py-1 text-[10px] tracking-wide tabular-nums lg:text-[11px]"
      aria-label={`${statusStrip.ariaPrefix}${lnLabel}`}
    >
      <span className="text-muted flex min-w-0 shrink items-center gap-x-1.5 overflow-hidden">
        <span className="flex shrink-0 items-center gap-1">
          <BranchIcon />
          <span>{chrome.statusBranch}</span>
        </span>
        <span className="hidden opacity-40 md:inline" aria-hidden="true">
          ·
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 md:inline-flex">
          <span className="inline-flex items-center gap-0.5">
            <ErrorIcon />
            <span>0</span>
          </span>
          <span className="inline-flex items-center gap-0.5">
            <WarnIcon />
            <span>0</span>
          </span>
        </span>
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
          <span
            aria-hidden="true"
            className="bg-syn-string inline-block size-1.5 shrink-0 rounded-full"
          />
          <span>{pipelineRest}</span>
        </span>
      </span>
    </div>
  );
}
