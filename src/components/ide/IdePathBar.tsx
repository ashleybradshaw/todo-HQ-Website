"use client";

import { DecodeLabel } from "@/components/DecodeLabel";
import { homePage } from "@/content/pages/home";
import type { IdeTabId } from "@/components/ide/IdeTabBar";

const { chrome, ideTabs } = homePage;

type IdePathBarProps = {
  activeTab: IdeTabId;
  /** README ## heading currently in view (null when not applicable). */
  sectionHeading?: string | null;
  sectionPlayKey?: number;
};

export function IdePathBar({
  activeTab,
  sectionHeading = null,
  sectionPlayKey = 0,
}: IdePathBarProps) {
  const file = ideTabs.tabs[activeTab];
  const showSection = activeTab === "todo" && sectionHeading;

  return (
    <nav
      aria-label={chrome.pathAria}
      className="ide-boot-chrome border-border-ide font-jetbrains text-muted flex shrink-0 items-center gap-1.5 border-b px-3 py-1.5 text-[11px] lg:text-xs"
    >
      <span>{chrome.pathRoot}</span>
      <span aria-hidden="true">{chrome.pathSeparator}</span>
      <span>{chrome.pathFolder}</span>
      <span aria-hidden="true">{chrome.pathSeparator}</span>
      <span
        className={`truncate ${showSection ? "text-muted" : "text-syn-property"}`}
        aria-current={showSection ? undefined : "page"}
      >
        {file}
      </span>
      {showSection ? (
        <>
          <span aria-hidden="true">{chrome.pathSeparator}</span>
          <span className="text-syn-property flex min-w-0 items-center gap-1 truncate" aria-current="page">
            <span aria-hidden="true" className="text-syn-keyword shrink-0">
              ##
            </span>
            <DecodeLabel
              text={sectionHeading}
              playKey={sectionPlayKey}
              settleColor="var(--syn-heading)"
            />
          </span>
        </>
      ) : null}
    </nav>
  );
}
