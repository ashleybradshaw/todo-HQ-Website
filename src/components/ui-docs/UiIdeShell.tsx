"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { useSpray } from "@/components/SprayProvider";
import { ColorsSection } from "@/components/ui-docs/sections/ColorsSection";
import { ComponentsSection } from "@/components/ui-docs/sections/ComponentsSection";
import { IconsSection } from "@/components/ui-docs/sections/IconsSection";
import { MotionSection } from "@/components/ui-docs/sections/MotionSection";
import { ReadmeSection } from "@/components/ui-docs/sections/ReadmeSection";
import { RulesSection } from "@/components/ui-docs/sections/RulesSection";
import { SpacingSection } from "@/components/ui-docs/sections/SpacingSection";
import { TypeSection } from "@/components/ui-docs/sections/TypeSection";
import { cn } from "@/lib/cn";
import { isInnerBrandPair } from "@/lib/accessibleColorPair";
import {
  UI_SECTIONS,
  type UiSectionId,
} from "@/lib/ui-docs/sections";
import {
  TOKEN_REGISTRY,
  UI_DOCS_VERSION,
} from "@/lib/ui-docs/tokenRegistry";

const GUTTER_LINES = 48;

function SectionBody({ id }: { id: UiSectionId }) {
  switch (id) {
    case "readme":
      return <ReadmeSection />;
    case "colors":
      return <ColorsSection />;
    case "type":
      return <TypeSection />;
    case "spacing":
      return <SpacingSection />;
    case "motion":
      return <MotionSection />;
    case "icons":
      return <IconsSection />;
    case "components":
      return <ComponentsSection />;
    case "rules":
      return <RulesSection />;
  }
}

function ResetButton() {
  const { reset, pair } = useSpray();
  const isBrand = isInnerBrandPair(pair);

  return (
    <button
      type="button"
      onClick={reset}
      disabled={isBrand}
      aria-label="Reset colour palette to brand"
      className={cn(
        "font-jetbrains inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-current px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none disabled:cursor-default disabled:opacity-40",
      )}
    >
      Reset
    </button>
  );
}

function FileTree({
  active,
  onSelect,
  idPrefix,
}: {
  active: UiSectionId;
  onSelect: (id: UiSectionId) => void;
  idPrefix: string;
}) {
  return (
    <nav aria-label="Design system files" className="min-w-0">
      <p className="font-jetbrains text-muted mb-2 px-3 text-[10px] tracking-wider uppercase">
        explorer
      </p>
      <ul className="font-jetbrains text-xs">
        {UI_SECTIONS.map((section) => {
          const selected = section.id === active;
          return (
            <li key={section.id}>
              <button
                type="button"
                id={`${idPrefix}-tree-${section.id}`}
                aria-current={selected ? "page" : undefined}
                onClick={() => onSelect(section.id)}
                className={cn(
                  "flex w-full min-w-0 cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-foreground transition-colors duration-[400ms] ease-in-out focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-current focus-visible:outline-none",
                  selected
                    ? "bg-foreground text-background"
                    : "hover:bg-foreground/5",
                )}
              >
                <span
                  className={cn(
                    "shrink-0",
                    selected ? "text-background/70" : "text-syn-comment",
                  )}
                  aria-hidden="true"
                >
                  {section.file.endsWith("/") ? "▸" : "·"}
                </span>
                <span className="truncate">{section.file}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function TabBar({
  active,
  onChange,
}: {
  active: UiSectionId;
  onChange: (id: UiSectionId) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeMeta = UI_SECTIONS.find((s) => s.id === active)!;

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const current = UI_SECTIONS.findIndex((s) => s.id === active);
      if (current < 0) return;
      let next = current;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next = (current + 1) % UI_SECTIONS.length;
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        next = (current - 1 + UI_SECTIONS.length) % UI_SECTIONS.length;
      } else if (event.key === "Home") {
        event.preventDefault();
        next = 0;
      } else if (event.key === "End") {
        event.preventDefault();
        next = UI_SECTIONS.length - 1;
      } else {
        return;
      }
      onChange(UI_SECTIONS[next].id);
      refs.current[next]?.focus();
    },
    [active, onChange],
  );

  return (
    <div
      role="tablist"
      aria-label="Open files"
      onKeyDown={onKeyDown}
      className="flex min-w-0 flex-1 items-stretch overflow-x-auto border-b border-border-ide"
    >
      <button
        type="button"
        role="tab"
        id={`ui-tab-${active}`}
        aria-selected="true"
        aria-controls={`ui-panel-${active}`}
        tabIndex={0}
        ref={(el) => {
          refs.current[UI_SECTIONS.findIndex((s) => s.id === active)] = el;
        }}
        className="font-jetbrains shrink-0 border-r border-border-ide border-b-2 border-b-foreground bg-foreground px-3 py-2 text-[11px] font-bold text-background focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-current focus-visible:outline-none"
      >
        {activeMeta.file}
      </button>
      {UI_SECTIONS.filter((s) => s.id !== active)
        .slice(0, 2)
        .map((section) => (
          <button
            key={section.id}
            type="button"
            role="tab"
            id={`ui-tab-${section.id}`}
            aria-selected="false"
            aria-controls={`ui-panel-${section.id}`}
            tabIndex={-1}
            onClick={() => onChange(section.id)}
            className="font-jetbrains shrink-0 border-r border-border-ide px-3 py-2 text-[11px] text-foreground transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-current focus-visible:outline-none"
          >
            {section.file}
          </button>
        ))}
    </div>
  );
}

function StatusStrip({ activeFile }: { activeFile: string }) {
  const tokenCount = TOKEN_REGISTRY.length;
  return (
    <div
      className="font-jetbrains flex shrink-0 items-center gap-x-2 overflow-x-auto border-t border-border-ide px-3 py-1 text-[10px] tracking-wide tabular-nums lg:text-xs"
      role="status"
      aria-label={`Editor status: ${tokenCount} tokens, main, UTF-8, ${UI_DOCS_VERSION}`}
    >
      <span className="text-syn-property shrink-0">{tokenCount} tokens</span>
      <span aria-hidden="true" className="text-syn-comment shrink-0 opacity-40">
        ·
      </span>
      <span className="text-syn-property shrink-0">main</span>
      <span aria-hidden="true" className="text-syn-comment shrink-0 opacity-40">
        ·
      </span>
      <span className="text-syn-property shrink-0">UTF-8</span>
      <span aria-hidden="true" className="text-syn-comment shrink-0 opacity-40">
        ·
      </span>
      <span className="text-syn-property shrink-0">{UI_DOCS_VERSION}</span>
      <span aria-hidden="true" className="text-syn-comment shrink-0 opacity-40">
        ·
      </span>
      <span className="text-muted min-w-0 truncate">{activeFile}</span>
    </div>
  );
}

export function UiIdeShell() {
  const [active, setActive] = useState<UiSectionId>("readme");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const treeId = useId();
  const activeMeta = useMemo(
    () => UI_SECTIONS.find((s) => s.id === active)!,
    [active],
  );

  const select = useCallback((id: UiSectionId) => {
    setActive(id);
    setDrawerOpen(false);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <main className="bg-bg-canvas text-foreground relative min-h-screen w-full max-w-[100vw] overflow-x-hidden transition-[background-color,color] duration-[400ms] ease-in-out">
      <div className="font-jetbrains relative z-10 flex min-h-[calc(100dvh-5rem)] w-full min-w-0 flex-col pt-20">
        {/* Title row + Reset — nav Spray stays in site header */}
        <div className="sticky top-16 z-30 flex min-w-0 items-center gap-2 border-b border-border-ide bg-bg-canvas px-3 py-2.5 sm:gap-3 sm:px-4">
          <button
            type="button"
            className="font-jetbrains inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-border-ide text-xs lg:hidden focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none"
            aria-expanded={drawerOpen}
            aria-controls={`${treeId}-drawer`}
            onClick={() => setDrawerOpen((o) => !o)}
          >
            <span className="sr-only">
              {drawerOpen ? "Close file tree" : "Open file tree"}
            </span>
            <span aria-hidden="true">{drawerOpen ? "✕" : "☰"}</span>
          </button>
          <div className="flex min-w-0 flex-1 items-baseline gap-2 sm:gap-3">
            <h1 className="type-title shrink-0 tracking-tight text-foreground">
              TODO UI
            </h1>
            <p className="type-caption text-muted min-w-0">
              {UI_DOCS_VERSION} · design system
            </p>
          </div>
          <ResetButton />
        </div>

        <div className="relative flex min-h-0 min-w-0 flex-1">
          {/* Desktop tree */}
          <aside className="hidden w-52 shrink-0 border-r border-border-ide lg:block xl:w-56">
            <div className="sticky top-[7.25rem] max-h-[calc(100dvh-8rem)] overflow-y-auto py-3">
              <FileTree
                active={active}
                onSelect={select}
                idPrefix={`${treeId}-desk`}
              />
            </div>
          </aside>

          {/* Mobile drawer — below title row so Reset stays free */}
          {drawerOpen ? (
            <div
              id={`${treeId}-drawer`}
              className="absolute inset-x-0 top-0 z-20 flex lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="File tree"
            >
              <div className="w-[min(16rem,85vw)] max-h-[calc(100dvh-8rem)] overflow-y-auto border-r border-border-ide bg-bg-canvas py-3 shadow-[4px_0_0_color-mix(in_srgb,var(--foreground)_8%,transparent)]">
                <FileTree
                  active={active}
                  onSelect={select}
                  idPrefix={`${treeId}-mob`}
                />
              </div>
              <button
                type="button"
                className="min-h-[12rem] flex-1 cursor-pointer bg-foreground/10"
                aria-label="Dismiss file tree"
                onClick={() => setDrawerOpen(false)}
              />
            </div>
          ) : null}

          {/* Editor column */}
          <section
            className="flex min-w-0 flex-1 flex-col"
            aria-label="Design system editor"
          >
            <div className="hidden min-w-0 sm:flex">
              <TabBar active={active} onChange={select} />
            </div>

            <div className="flex min-h-0 min-w-0 flex-1">
              <div
                className="text-syn-number hidden w-8 shrink-0 flex-col border-r border-border-ide py-4 text-right text-[10px] tabular-nums select-none sm:flex lg:w-10 lg:text-xs"
                aria-hidden="true"
              >
                {Array.from({ length: GUTTER_LINES }, (_, index) => (
                  <span
                    key={index}
                    className="pr-2 leading-6 lg:pr-3 lg:leading-7"
                    style={{ "--i": index } as CSSProperties}
                  >
                    {index + 1}
                  </span>
                ))}
              </div>

              <div
                id={`ui-panel-${active}`}
                role="tabpanel"
                aria-labelledby={`ui-tab-${active}`}
                className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 sm:px-4 lg:px-6"
              >
                <SectionBody id={active} />
              </div>
            </div>

            <StatusStrip activeFile={activeMeta.file} />
          </section>
        </div>
      </div>
    </main>
  );
}
