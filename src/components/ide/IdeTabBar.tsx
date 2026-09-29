"use client";

import {
  useCallback,
  useRef,
  type KeyboardEvent,
} from "react";
import { homePage } from "@/content/pages/home";

export type IdeTabId = "todo" | "offer" | "discovery";

type TabMeta = {
  id: IdeTabId;
  label: string;
  panelId: string;
  badge: string;
  /** md → syn-string tint; ts → accent */
  badgeTone: "md" | "ts";
  dirty?: boolean;
};

const TABS: readonly TabMeta[] = [
  {
    id: "todo",
    label: homePage.ideTabs.tabs.todo,
    panelId: "ide-panel-todo",
    badge: "md",
    badgeTone: "md",
  },
  {
    id: "offer",
    label: homePage.ideTabs.tabs.offer,
    panelId: "ide-panel-offer",
    badge: "md",
    badgeTone: "md",
  },
  {
    id: "discovery",
    label: homePage.ideTabs.tabs.discovery,
    panelId: "ide-panel-discovery",
    badge: "ts",
    badgeTone: "ts",
    dirty: true,
  },
];

type IdeTabBarProps = {
  activeTab: IdeTabId;
  onChange: (tab: IdeTabId) => void;
};

function FileBadge({
  label,
  tone,
}: {
  label: string;
  tone: "md" | "ts";
}) {
  const tint =
    tone === "md"
      ? "color-mix(in srgb, var(--syn-string) 18%, transparent)"
      : "color-mix(in srgb, var(--brand-logo) 18%, transparent)";
  const ink = tone === "md" ? "text-syn-string" : "text-brand-logo";

  return (
    <span
      aria-hidden="true"
      className={`font-jetbrains ${ink} rounded-[4px] px-1.5 py-0.5 text-[9px] leading-none tracking-wide uppercase`}
      style={{ backgroundColor: tint }}
    >
      {label}
    </span>
  );
}

/** Editor-feel tab strip — chrome tint, type badges, top accent on active. */
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
      className="ide-boot-tabs bg-ide-chrome flex min-w-0 shrink-0 items-stretch overflow-hidden"
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
            className={`font-jetbrains relative flex min-h-9 min-w-0 flex-1 items-center gap-1.5 overflow-hidden border-r border-border-ide px-2 py-2 text-xs transition-[color,background-color,opacity] duration-[400ms] ease-in-out focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none sm:px-3 ${
              selected
                ? "bg-bg-canvas text-syn-keyword font-medium"
                : "text-syn-comment hover:bg-foreground/5 font-normal"
            }`}
          >
            {selected ? (
              <span
                aria-hidden="true"
                className="bg-foreground absolute inset-x-0 top-0 h-0.5"
              />
            ) : null}
            <FileBadge label={tab.badge} tone={tab.badgeTone} />
            <span className="min-w-0 truncate">{tab.label}</span>
            {tab.dirty ? (
              <span
                aria-hidden="true"
                className="bg-syn-string ml-0.5 inline-block size-1.5 shrink-0 rounded-full opacity-80"
              />
            ) : null}
          </button>
        );
      })}
      <div className="min-w-0 flex-1" aria-hidden="true" />
    </div>
  );
}
