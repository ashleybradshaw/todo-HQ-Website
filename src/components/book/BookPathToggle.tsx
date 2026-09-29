"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { bookPage } from "@/content/pages/book";
import { DecodeLabel } from "@/components/DecodeLabel";
import { cn } from "@/lib/cn";

export type BookPathId = "quick" | "brief";

const PATHS = [bookPage.paths.quick, bookPage.paths.brief] as const;

type BookPathToggleProps = {
  value: BookPathId;
  onChange: (next: BookPathId) => void;
};

export function BookPathToggle({ value, onChange }: BookPathToggleProps) {
  const labelId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = PATHS.findIndex((path) => path.id === value);
  const [playKey, setPlayKey] = useState(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    setPlayKey((n) => n + 1);
  }, [value]);

  const selectIndex = useCallback(
    (index: number) => {
      const next = PATHS[index];
      if (!next) return;
      onChange(next.id);
      tabRefs.current[index]?.focus();
    },
    [onChange],
  );

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (activeIndex + delta + PATHS.length) % PATHS.length;
    selectIndex(nextIndex);
  }

  const helper =
    value === "quick"
      ? bookPage.paths.quick.helper
      : bookPage.paths.brief.helper;

  return (
    <div className="w-full max-w-xl">
      <p id={labelId} className="sr-only">
        Booking path
      </p>
      <div
        role="tablist"
        aria-labelledby={labelId}
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="relative grid grid-cols-2 gap-1 rounded-[4px] border border-border-ide bg-[color-mix(in_srgb,var(--foreground)_6%,var(--background))] p-1 transition-[background-color,border-color,color] duration-[400ms] ease-in-out"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-[4px] bg-foreground transition-[transform,background-color] duration-[400ms] ease-in-out motion-reduce:transition-none"
          style={{
            transform:
              activeIndex <= 0
                ? "translateX(0)"
                : "translateX(calc(100% + 0.25rem))",
          }}
        />
        {PATHS.map((path, index) => {
          const selected = path.id === value;
          const label = path.label.toUpperCase();
          return (
            <button
              key={path.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`book-path-tab-${path.id}`}
              aria-label={path.label}
              aria-selected={selected}
              aria-controls={`book-path-panel-${path.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(path.id)}
              className={cn(
                "font-jetbrains relative z-10 min-h-11 cursor-pointer rounded-[4px] px-3 py-2 text-xs font-bold tracking-wider uppercase transition-colors duration-[400ms] ease-in-out focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none",
                selected ? "text-background" : "text-on-tint",
              )}
            >
              {selected ? (
                <DecodeLabel text={label} playKey={playKey} />
              ) : (
                label
              )}
            </button>
          );
        })}
      </div>
      <p className="font-jetbrains mt-3 max-w-full text-center text-xs tracking-wide text-syn-comment text-pretty">
        <span className="sr-only">{helper}</span>
        <span aria-hidden="true">
          <DecodeLabel text={helper} playKey={playKey} chroma wrap />
        </span>
      </p>
    </div>
  );
}
