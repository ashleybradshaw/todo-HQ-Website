"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { DecodeLabel } from "@/components/DecodeLabel";
import { homePage } from "@/content/pages/home";
import {
  buildReadmeSourceLines,
  methodologySourceLineIndex,
} from "@/components/ide/readmeSource";
import {
  renderTokens,
  tokenizeMarkdownLine,
} from "@/components/ide/ideHighlight";
import { IdePaneCollapse } from "@/components/ide/IdePaneCollapse";
import type { OutlineEntry } from "@/components/ide/IdeOutline";

const { todoHq } = homePage;

const HEADING_SCRAMBLE_STAGGER_MS = 60;

export type ReadmeLiveState = {
  activeLine: number;
  sectionHeading: string | null;
  sectionId: string | null;
  sectionPlayKey: number;
};

type ReadmeCodePaneProps = {
  onExecutePipeline: () => void;
  onActiveLineChange: (line: number) => void;
  /** IDE reveal play key — scrambles ## headings once. */
  scramblePlayKey?: number;
  /** Fired when section-in-view or centre line changes (IO only). */
  onLiveChange?: (state: ReadmeLiveState) => void;
  /** When false, current-line band stays off (IDE out of viewport). */
  ideInView?: boolean;
};

function indentLevel(line: string): number {
  const match = /^( *)/.exec(line);
  if (!match) return 0;
  return Math.floor(match[1].length / 2);
}

function isMarkdownHeading(line: string): boolean {
  return /^## /.test(line);
}

function slugifyHeading(title: string): string {
  return `readme-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Build outline entries from README source lines. */
export function buildReadmeOutline(lines: readonly string[]): OutlineEntry[] {
  const entries: OutlineEntry[] = [];
  lines.forEach((line, index) => {
    if (!isMarkdownHeading(line)) return;
    const title = line.slice(3).trim();
    entries.push({
      id: slugifyHeading(title),
      title,
      line: index + 1,
    });
  });
  return entries;
}

export function ReadmeCodePane({
  onExecutePipeline,
  onActiveLineChange,
  scramblePlayKey = 0,
  onLiveChange,
  ideInView = true,
}: ReadmeCodePaneProps) {
  const lines = useMemo(() => buildReadmeSourceLines(), []);
  const methodIndex = methodologySourceLineIndex(lines);
  const [activeIndex, setActiveIndex] = useState(methodIndex);
  const [headingPlayKeys, setHeadingPlayKeys] = useState<
    Record<number, number>
  >({});
  const [sectionPlayKey, setSectionPlayKey] = useState(0);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [sectionHeading, setSectionHeading] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );

  const headingOrder = useMemo(() => {
    const map = new Map<number, number>();
    let order = 0;
    lines.forEach((line, index) => {
      if (isMarkdownHeading(line)) {
        map.set(index, order);
        order += 1;
      }
    });
    return map;
  }, [lines]);

  const outline = useMemo(() => buildReadmeOutline(lines), [lines]);

  useEffect(() => {
    if (scramblePlayKey === 0) return;
    const timers: number[] = [];
    headingOrder.forEach((order, lineIndex) => {
      timers.push(
        window.setTimeout(() => {
          setHeadingPlayKeys((prev) => ({
            ...prev,
            [lineIndex]: scramblePlayKey,
          }));
        }, order * HEADING_SCRAMBLE_STAGGER_MS),
      );
    });
    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [scramblePlayKey, headingOrder]);

  const setActive = useCallback(
    (index: number) => {
      setActiveIndex(index);
      onActiveLineChange(index + 1);
    },
    [onActiveLineChange],
  );

  // Heading IO → breadcrumb section; centre-line IO only while IDE in view.
  useEffect(() => {
    const headingEls = outline
      .map((entry) => {
        const lineIndex = entry.line - 1;
        return { entry, el: lineRefs.current[lineIndex] };
      })
      .filter((row): row is { entry: OutlineEntry; el: HTMLDivElement } =>
        Boolean(row.el),
      );

    if (headingEls.length === 0) return;

    const headingIo = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible.length === 0) return;
        const top = visible[0].target as HTMLElement;
        const id = top.id;
        const match = outline.find((e) => e.id === id);
        if (!match) return;
        setSectionId((prev) => {
          if (prev === match.id) return prev;
          if (!reduceMotion) setSectionPlayKey((k) => k + 1);
          setSectionHeading(match.title);
          return match.id;
        });
      },
      { root: null, rootMargin: "-20% 0px -55% 0px", threshold: 0 },
    );

    for (const { el } of headingEls) headingIo.observe(el);

    return () => headingIo.disconnect();
  }, [outline, reduceMotion, lines.length]);

  // Centre-line band: only while IDE in viewport; no scroll listeners.
  useEffect(() => {
    if (!ideInView || reduceMotion) {
      onLiveChange?.({
        activeLine: activeIndex + 1,
        sectionHeading,
        sectionId,
        sectionPlayKey,
      });
      return;
    }

    const els = lineRefs.current.filter(Boolean) as HTMLDivElement[];
    if (els.length === 0) return;

    const lineIo = new IntersectionObserver(
      (entries) => {
        const mid = window.innerHeight / 2;
        let best: { index: number; dist: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const rect = entry.boundingClientRect;
          const center = rect.top + rect.height / 2;
          const dist = Math.abs(center - mid);
          const index = Number(
            (entry.target as HTMLElement).dataset.lineIndex,
          );
          if (!Number.isFinite(index)) continue;
          if (!best || dist < best.dist) best = { index, dist };
        }
        if (best) setActive(best.index);
      },
      { root: null, rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    for (const el of els) lineIo.observe(el);
    return () => lineIo.disconnect();
  }, [
    ideInView,
    reduceMotion,
    lines.length,
    setActive,
    activeIndex,
    sectionHeading,
    sectionId,
    sectionPlayKey,
    onLiveChange,
  ]);

  useEffect(() => {
    onLiveChange?.({
      activeLine: activeIndex + 1,
      sectionHeading,
      sectionId,
      sectionPlayKey,
    });
  }, [
    activeIndex,
    sectionHeading,
    sectionId,
    sectionPlayKey,
    onLiveChange,
  ]);

  const onLineEnter = useCallback(
    (index: number) => {
      if (!ideInView) return;
      setActive(index);
    },
    [ideInView, setActive],
  );

  const onLineKey = useCallback(
    (index: number, event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        if (index === methodIndex) {
          event.preventDefault();
          onExecutePipeline();
        }
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        const next = Math.min(lines.length - 1, index + 1);
        setActive(next);
        (
          event.currentTarget.parentElement?.children[next] as
            | HTMLElement
            | undefined
        )?.focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const next = Math.max(0, index - 1);
        setActive(next);
        (
          event.currentTarget.parentElement?.children[next] as
            | HTMLElement
            | undefined
        )?.focus();
      }
    },
    [lines.length, methodIndex, onExecutePipeline, setActive],
  );

  const showBand = ideInView && !reduceMotion;

  return (
    <IdePaneCollapse lineCount={lines.length}>
      <div
        ref={rootRef}
        className="font-jetbrains relative flex min-h-0 flex-col text-xs leading-6 lg:text-sm lg:leading-6"
        data-readme-source="true"
      >
        {/* Full-height gutter rule — absolute so it isn’t cut by row padding */}
        <span
          aria-hidden="true"
          className="border-border-ide pointer-events-none absolute top-0 bottom-0 w-8 border-r lg:w-10"
        />
        {lines.map((line, index) => {
          const active = showBand && index === activeIndex;
          const isMethod = index === methodIndex;
          const indents = indentLevel(line);
          const isHeading = headingOrder.has(index);
          const headingTitle = isHeading ? line.slice(3).trim() : "";
          const headingId = isHeading ? slugifyHeading(headingTitle) : undefined;
          const isH1 = /^# /.test(line) && !/^## /.test(line);

          return (
            <div
              key={index}
              id={headingId}
              ref={(node) => {
                lineRefs.current[index] = node;
              }}
              data-line-index={index}
              role="row"
              tabIndex={activeIndex === index ? 0 : -1}
              className={`ide-boot-line group/line grid min-w-0 outline-none ${
                isHeading || isH1 ? "ide-readme-heading" : ""
              }`}
              style={
                {
                  "--i": index,
                  gridTemplateColumns: "auto 1fr",
                  backgroundColor: active
                    ? "color-mix(in srgb, var(--foreground) 6%, transparent)"
                    : undefined,
                } as CSSProperties
              }
              onMouseEnter={() => onLineEnter(index)}
              onFocus={() => onLineEnter(index)}
              onKeyDown={(event) => onLineKey(index, event)}
            >
              <span
                aria-hidden="true"
                className={`ide-readme-gutter w-8 shrink-0 pr-2 text-right tabular-nums select-none lg:w-10 lg:pr-3 ${
                  active ? "text-foreground" : "text-syn-number"
                }`}
              >
                {index + 1}
              </span>
              <pre className="relative min-w-0 whitespace-pre-wrap py-0.5 pr-6 pl-4">
                {indents > 0 ? (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-4 hidden md:block"
                  >
                    {Array.from({ length: indents }, (_, i) => (
                      <span
                        key={i}
                        className="absolute inset-y-0 w-px bg-border-ide"
                        style={{ left: `${i * 2}ch` }}
                      />
                    ))}
                  </span>
                ) : null}
                {isMethod ? (
                  <button
                    type="button"
                    onClick={onExecutePipeline}
                    onMouseEnter={(event: MouseEvent) => {
                      event.stopPropagation();
                      onExecutePipeline();
                    }}
                    aria-label={todoHq.methodologyAria}
                    className="relative rounded-[4px] bg-transparent p-0 font-medium text-[color:var(--blog-cat-agents)] transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none"
                  >
                    {todoHq.methodologyLabel}
                  </button>
                ) : isHeading ? (
                  <code className="relative inline-block">
                    <span className="text-syn-keyword">## </span>
                    <DecodeLabel
                      text={headingTitle}
                      playKey={headingPlayKeys[index] ?? 0}
                      chroma
                      settleColor="var(--syn-heading)"
                    />
                  </code>
                ) : isH1 ? (
                  <code className="relative inline-block">
                    <span className="text-syn-keyword"># </span>
                    <span className="text-syn-heading font-semibold">
                      {line.slice(2)}
                    </span>
                  </code>
                ) : (
                  <code className="relative">
                    {renderTokens(tokenizeMarkdownLine(line))}
                  </code>
                )}
                {active ? (
                  <span
                    aria-hidden="true"
                    className="ide-caret bg-foreground ml-0.5 inline-block h-[0.85em] w-px translate-y-px align-text-bottom"
                  />
                ) : null}
              </pre>
            </div>
          );
        })}
      </div>
    </IdePaneCollapse>
  );
}
