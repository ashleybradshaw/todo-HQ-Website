"use client";

import {
  useCallback,
  useRef,
  type KeyboardEvent,
} from "react";
import { homePage } from "@/content/pages/home";

export type IdeTabId = "todo" | "offer" | "discovery";

const TABS: readonly {
  id: IdeTabId;
  label: string;
  panelId: string;
  accent: string;
  dirty?: boolean;
}[] = [
  {
    id: "todo",
    label: homePage.ideTabs.tabs.todo,
    panelId: "ide-panel-todo",
    accent: "var(--foreground)",
  },
  {
    id: "offer",
    label: homePage.ideTabs.tabs.offer,
    panelId: "ide-panel-offer",
    accent: "var(--blog-cat-agents)",
  },
  {
    id: "discovery",
    label: homePage.ideTabs.tabs.discovery,
    panelId: "ide-panel-discovery",
    accent: "var(--syn-string)",
    dirty: true,
  },
];

type IdeTabBarProps = {
  activeTab: IdeTabId;
  onChange: (tab: IdeTabId) => void;
};

/** Flat Zed-style tab strip — no sticky, no file-type badges. */
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
      aria-label={homePage.ideTabs.aria}
      onKeyDown={onKeyDown}
      className="ide-boot-tabs border-border-ide flex shrink-0 items-stretch border-b"
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
            className={`font-jetbrains relative -mb-px flex min-h-9 items-center gap-1.5 border-b-2 px-3 py-2 text-xs transition-[color,border-color,opacity] duration-[400ms] ease-in-out focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none ${
              selected
                ? "text-syn-keyword font-medium"
                : "text-syn-comment border-transparent font-normal"
            }`}
            style={
              selected
                ? { borderBottomColor: tab.accent }
                : undefined
            }
          >
            <span>{tab.label}</span>
            {tab.dirty ? (
              <span
                aria-hidden="true"
                className="ml-0.5 text-[10px] leading-none opacity-70"
              >
                ●
              </span>
            ) : null}
          </button>
        );
      })}
      <div className="min-w-0 flex-1" aria-hidden="true" />
    </div>
  );
}
