"use client";

import {
  useCallback,
  useRef,
  type KeyboardEvent,
} from "react";
import { homePage } from "@/content/pages/home";
import { SHOW_X_FEED } from "@/lib/site";

export type IdeTabId = "todo" | "offer" | "discovery" | "feed";

type TabMeta = {
  id: IdeTabId;
  label: string;
  shortLabel: string;
  panelId: string;
  badge: "md" | "ts" | "x";
  dirty?: boolean;
};

const TABS: readonly TabMeta[] = [
  {
    id: "todo",
    label: homePage.ideTabs.tabs.todo,
    shortLabel: homePage.ideTabs.shortTabs.todo,
    panelId: "ide-panel-todo",
    badge: "md",
  },
  {
    id: "offer",
    label: homePage.ideTabs.tabs.offer,
    shortLabel: homePage.ideTabs.shortTabs.offer,
    panelId: "ide-panel-offer",
    badge: "md",
  },
  {
    id: "discovery",
    label: homePage.ideTabs.tabs.discovery,
    shortLabel: homePage.ideTabs.shortTabs.discovery,
    panelId: "ide-panel-discovery",
    badge: "ts",
    dirty: true,
  },
  ...(SHOW_X_FEED
    ? [
        {
          id: "feed" as const,
          label: homePage.ideTabs.tabs.feed,
          shortLabel: homePage.ideTabs.shortTabs.feed,
          panelId: "ide-panel-feed",
          badge: "x" as const,
        },
      ]
    : []),
];

type IdeTabBarProps = {
  activeTab: IdeTabId;
  onChange: (tab: IdeTabId) => void;
};

function FileBadge({ tone }: { tone: "md" | "ts" }) {
  const tint =
    tone === "md"
      ? "color-mix(in srgb, var(--syn-string) 18%, transparent)"
      : "color-mix(in srgb, var(--brand-logo) 18%, transparent)";
  const ink = tone === "md" ? "text-badge-md-ink" : "text-badge-ts-ink";

  return (
    <span
      aria-hidden="true"
      className={`font-jetbrains ${ink} rounded-[4px] px-1 py-0.5 text-[9px] leading-none tracking-wide uppercase`}
      style={{ backgroundColor: tint }}
    >
      {tone}
    </span>
  );
}

function XBadge() {
  return (
    <span aria-hidden="true" className="text-foreground inline-flex shrink-0">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
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
            aria-label={tab.label}
            className={`font-jetbrains relative flex min-h-9 shrink-0 items-center gap-0.5 overflow-hidden border-r border-border-ide px-1 py-2 text-xs transition-[color,background-color,opacity] duration-[400ms] ease-in-out focus-visible:ring-inset focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none min-[480px]:min-w-0 min-[480px]:flex-1 min-[480px]:gap-1.5 min-[480px]:px-2 sm:px-3 ${
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
            {tab.badge === "x" ? (
              <span className="hidden shrink-0 min-[480px]:inline-flex">
                <XBadge />
              </span>
            ) : (
              <FileBadge tone={tab.badge} />
            )}
            <span className="hidden min-w-0 truncate min-[480px]:inline">
              {tab.label}
            </span>
            <span className="shrink-0 min-[480px]:hidden" aria-hidden="true">
              {tab.shortLabel}
            </span>
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
