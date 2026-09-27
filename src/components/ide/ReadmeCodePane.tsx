"use client";

import {
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { homePage } from "@/content/pages/home";
import {
  buildReadmeSourceLines,
  methodologySourceLineIndex,
} from "@/components/ide/readmeSource";
import {
  renderTokens,
  tokenizeMarkdownLine,
} from "@/components/ide/ideHighlight";

const { todoHq } = homePage;

type ReadmeCodePaneProps = {
  onExecutePipeline: () => void;
  onActiveLineChange: (line: number) => void;
};

function indentLevel(line: string): number {
  const match = /^( *)/.exec(line);
  if (!match) return 0;
  return Math.floor(match[1].length / 2);
}

export function ReadmeCodePane({
  onExecutePipeline,
  onActiveLineChange,
}: ReadmeCodePaneProps) {
  const lines = useMemo(() => buildReadmeSourceLines(), []);
  const methodIndex = methodologySourceLineIndex(lines);
  const [activeIndex, setActiveIndex] = useState(methodIndex);

  const setActive = useCallback(
    (index: number) => {
      setActiveIndex(index);
      onActiveLineChange(index + 1);
    },
    [onActiveLineChange],
  );

  const onLineEnter = useCallback(
    (index: number) => {
      setActive(index);
    },
    [setActive],
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

  return (
    <div
      className="font-jetbrains flex flex-col py-3 text-xs leading-6 lg:text-sm lg:leading-7"
      data-readme-source="true"
    >
      {lines.map((line, index) => {
        const active = index === activeIndex;
        const isMethod = index === methodIndex;
        const indents = indentLevel(line);

        return (
          <div
            key={index}
            role="row"
            tabIndex={active ? 0 : -1}
            className="ide-boot-line group/line grid min-w-0 outline-none"
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
              className={`ide-readme-gutter w-8 shrink-0 border-r border-border-ide pr-2 text-right tabular-nums select-none lg:w-10 lg:pr-3 ${
                active ? "text-foreground" : "text-syn-number"
              }`}
            >
              {index + 1}
            </span>
            <pre className="relative min-w-0 whitespace-pre-wrap pr-6 pl-4">
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
  );
}
