"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { cn } from "@/lib/cn";

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
 * At rest the string is in the DOM once. While scrambling, that copy is
 * visibility-hidden (layout) and the glyph layer is aria-hidden.
 */
export function DecodeLabel({
  text,
  playKey,
  chroma = false,
  wrap = false,
  settleColor,
  className,
}: {
  text: string;
  playKey: number;
  chroma?: boolean;
  /** Allow soft wrap (helper copy on narrow viewports). */
  wrap?: boolean;
  /** Override settle color (default syn-comment). */
  settleColor?: string;
  className?: string;
}) {
  const settle = settleColor ?? SETTLE_COLOR;
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- settle scramble cells from text/playKey
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
        wrap ? "block w-full max-w-full" : "inline-block",
        className,
      )}
    >
      <span
        className={cn(whiteSpace, scrambling && "invisible")}
        style={!scrambling && chroma ? { color: settle } : undefined}
      >
        {text}
      </span>
      {scrambling ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0",
            whiteSpace,
            wrap && "text-center",
          )}
        >
          {inheritOnly
            ? cells.map((cell) => cell.ch).join("")
            : cells.map((cell, i) => (
                <span key={i} style={{ color: cell.color }}>
                  {cell.ch}
                </span>
              ))}
        </span>
      ) : null}
    </span>
  );
}
