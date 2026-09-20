"use client";

import {
  useCallback,
  useRef,
  type KeyboardEvent,
} from "react";

export type IdeTabId = "todo" | "offer" | "discovery";

const TABS: readonly { id: IdeTabId; label: string; panelId: string }[] = [
  { id: "todo", label: "TODO_HQ.ts", panelId: "ide-panel-todo" },
  { id: "offer", label: "offer.md", panelId: "ide-panel-offer" },
  { id: "discovery", label: "discovery.ts", panelId: "ide-panel-discovery" },
];

const ACTIVE_TAB_BG =
  "bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)]";

type IdeTabBarProps = {
  activeTab: IdeTabId;
  onChange: (tab: IdeTabId) => void;
};

export function IdeTabBar({ activeTab, onChange }: IdeTabBarProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = useCallback(
    (index: number) => {
      const next = ((index % TABS.length) + TABS.length) % TABS.length;
      refs.current[next]?.focus();
      onChange(TABS[next].id);
    },
    [onChange],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const current = TABS.findIndex((tab) => tab.id === activeTab);
      if (current < 0) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        focusTab(current + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        focusTab(current - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        focusTab(0);
      } else if (event.key === "End") {
        event.preventDefault();
        focusTab(TABS.length - 1);
      }
    },
    [activeTab, focusTab],
  );

  return (
    <div
      role="tablist"
      aria-label="IDE source files"
      onKeyDown={onKeyDown}
      className="ide-boot-tabs flex shrink-0 items-stretch border-b border-border-ide"
    >
      {TABS.map((tab, index) => {
        const selected = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`ide-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={tab.panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`font-jetbrains min-h-11 border-b-2 px-4 py-3 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--foreground)] ${
              selected
                ? `border-border-ide text-syn-keyword ${ACTIVE_TAB_BG}`
                : "border-transparent text-syn-comment opacity-50 hover:opacity-80"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
