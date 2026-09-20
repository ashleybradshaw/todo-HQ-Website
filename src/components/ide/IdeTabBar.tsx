"use client";

import {
  useCallback,
  useRef,
  type KeyboardEvent,
} from "react";

export type IdeTabId = "todo" | "offer" | "discovery";

const TABS: readonly {
  id: IdeTabId;
  label: string;
  panelId: string;
  accent: string;
}[] = [
  {
    id: "todo",
    label: "TODO_HQ.ts",
    panelId: "ide-panel-todo",
    accent: "var(--foreground)",
  },
  {
    id: "offer",
    label: "offer.md",
    panelId: "ide-panel-offer",
    accent: "var(--blog-cat-agents)",
  },
  {
    id: "discovery",
    label: "discovery.ts",
    panelId: "ide-panel-discovery",
    accent: "var(--syn-string)",
  },
];

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
        const wash = selected ? 16 : 8;
        const washMid = selected ? 5 : 2;
        const edge = selected ? 34 : 22;

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
            className={`font-jetbrains relative -mb-px min-h-11 border border-b-0 px-4 py-3 text-xs transition-[background,border-color,opacity,color] duration-[400ms] ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--foreground)] ${
              selected
                ? "z-[1] rounded-t-[4px] text-syn-keyword"
                : "rounded-t-[4px] border-transparent text-syn-comment opacity-55 hover:opacity-85"
            }`}
            style={
              selected
                ? {
                    borderColor: `color-mix(in srgb, ${tab.accent} ${edge}%, transparent)`,
                    backgroundImage: `linear-gradient(105deg, color-mix(in srgb, ${tab.accent} ${wash}%, transparent) 0%, color-mix(in srgb, ${tab.accent} ${washMid}%, transparent) 55%, transparent 100%)`,
                    backgroundColor: "var(--bg-canvas)",
                  }
                : {
                    borderColor: "transparent",
                    backgroundImage: `linear-gradient(105deg, color-mix(in srgb, ${tab.accent} ${wash}%, transparent) 0%, color-mix(in srgb, ${tab.accent} ${washMid}%, transparent) 55%, transparent 100%)`,
                  }
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
