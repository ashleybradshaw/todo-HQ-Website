"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import { bookPage } from "@/content/pages/book";
import { cn } from "@/lib/cn";

export type BookPathId = "quick" | "brief";

const PATHS = [bookPage.paths.quick, bookPage.paths.brief] as const;

/** Dense mono set — reads as terminal noise, not emoji. */
const DECODE_GLYPHS = "#*+%/@$&:;·";

/** IDE syntax flash while scrambling — settles to one color when done. */
const SCRAMBLE_COLORS = [
  "var(--syn-keyword)",
  "var(--syn-string)",
  "var(--syn-number)",
  "var(--syn-property)",
  "var(--syn-bracket)",
] as const;

const SETTLE_COLOR = "var(--syn-comment)";

const FRAME_MS = 28;
const HOLD_FRAMES = 3;
const RESOLVE_PER_FRAME = 1;

type DecodeCell = { ch: string; color: string };

type BookPathToggleProps = {
  value: BookPathId;
  onChange: (next: BookPathId) => void;
};

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrambleCells(
  target: string,
  resolved: number,
  chroma: boolean,
): DecodeCell[] {
  const cells: DecodeCell[] = [];
  for (let i = 0; i < target.length; i += 1) {
    const source = target[i] ?? "";
    if (source === " ") {
      cells.push({ ch: " ", color: SETTLE_COLOR });
      continue;
    }
    if (i < resolved) {
      cells.push({ ch: source, color: SETTLE_COLOR });
      continue;
    }
    const glyph =
      DECODE_GLYPHS[Math.floor(Math.random() * DECODE_GLYPHS.length)] ?? "#";
    const color = chroma
      ? (SCRAMBLE_COLORS[Math.floor(Math.random() * SCRAMBLE_COLORS.length)] ??
        SETTLE_COLOR)
      : "currentColor";
    cells.push({ ch: glyph, color });
  }
  return cells;
}

function settleCells(target: string): DecodeCell[] {
  return Array.from(target, (ch) => ({ ch, color: SETTLE_COLOR }));
}

/**
 * Short LTR decode — TypeComment kinship.
 * `chroma`: syntax-color noise while scrambling; settles to syn-comment.
 * Skips on first paint and under prefers-reduced-motion.
 */
function DecodeLabel({
  text,
  playKey,
  chroma = false,
  wrap = false,
  className,
}: {
  text: string;
  playKey: number;
  chroma?: boolean;
  /** Allow soft wrap (helper copy on narrow viewports). */
  wrap?: boolean;
  className?: string;
}) {
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );
  const [cells, setCells] = useState<DecodeCell[]>(() => settleCells(text));
  const [scrambling, setScrambling] = useState(false);
  const targetRef = useRef(text);

  useEffect(() => {
    targetRef.current = text;
    if (reduceMotion || playKey === 0) {
      setCells(settleCells(text));
      setScrambling(false);
      return;
    }

    let frame = 0;
    let resolved = 0;
    let timer = 0;
    setScrambling(true);

    const tick = () => {
      const target = targetRef.current;
      if (frame < HOLD_FRAMES) {
        setCells(scrambleCells(target, 0, chroma));
        frame += 1;
        timer = window.setTimeout(tick, FRAME_MS);
        return;
      }
      resolved = Math.min(target.length, resolved + RESOLVE_PER_FRAME);
      setCells(scrambleCells(target, resolved, chroma));
      if (resolved >= target.length) {
        setCells(settleCells(target));
        setScrambling(false);
        return;
      }
      frame += 1;
      timer = window.setTimeout(tick, FRAME_MS);
    };

    tick();
    return () => window.clearTimeout(timer);
  }, [text, playKey, reduceMotion, chroma]);

  const inheritOnly = !chroma;
  const whiteSpace = wrap ? "whitespace-pre-wrap" : "whitespace-pre";

  return (
    <span
      className={cn(
        "relative",
        wrap
          ? "block w-full max-w-full"
          : "inline-grid justify-items-stretch",
        className,
      )}
    >
      <span
        className={cn(
          "invisible",
          wrap ? "block" : "col-start-1 row-start-1",
          whiteSpace,
        )}
      >
        {text}
      </span>
      <span
        className={cn(
          wrap
            ? "absolute inset-0 text-center"
            : "col-start-1 row-start-1",
          whiteSpace,
        )}
        aria-hidden="true"
        style={
          chroma && !scrambling ? { color: SETTLE_COLOR } : undefined
        }
      >
        {inheritOnly
          ? cells.map((cell) => cell.ch).join("")
          : cells.map((cell, i) => (
              <span
                key={i}
                style={scrambling ? { color: cell.color } : undefined}
              >
                {cell.ch}
              </span>
            ))}
      </span>
    </span>
  );
}

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
        <DecodeLabel text={helper} playKey={playKey} chroma wrap />
      </p>
    </div>
  );
}
