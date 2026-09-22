"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { HAWK_CHARSET, hash2 } from "@/lib/ascii-hawk";

/** Wallpaper opacity — readable only as atmospheric texture. */
const FIELD_OPACITY = 0.08;
/** Sparse–medium: cell size in CSS px. */
const CELL_PX = 16;
/** Fraction of cells that draw a glyph (rest stay empty). */
const FILL_RATE = 0.42;
/** Scroll distance (px) that advances one full phase unit. */
const SCROLL_PHASE_PX = 420;

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function paintField(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cols: number,
  rows: number,
  cellW: number,
  cellH: number,
  phaseX: number,
  phaseY: number,
  fg: string,
) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = fg;
  ctx.globalAlpha = FIELD_OPACITY;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontPx = Math.max(2.5, Math.min(cellW, cellH) * 0.78);
  ctx.font = `700 ${fontPx}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;

  const len = HAWK_CHARSET.length;
  const ox = Math.floor(phaseX) % cols;
  const oy = Math.floor(phaseY) % rows;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const sx = ((col + ox) % cols + cols) % cols;
      const sy = ((row + oy) % rows + rows) % rows;
      if (hash2(sx, sy) > FILL_RATE) {
        continue;
      }
      const gi = Math.min(
        len - 1,
        Math.floor(hash2(sx + 17, sy + 31) * (len - 0.0001)),
      );
      const ch = HAWK_CHARSET[gi];
      if (!ch || ch === " ") {
        continue;
      }
      ctx.fillText(ch, col * cellW + cellW * 0.5, row * cellH + cellH * 0.5);
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * Subtle ASCII wallpaper behind About copy. Scroll gently shifts phase —
 * not a dissolve curtain. Spray-safe via currentColor / --foreground.
 */
export function AsciiScrollField() {
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let raf = 0;
    let pending = false;
    let cancelled = false;

    const readFg = () => {
      const styles = getComputedStyle(canvas);
      return (
        styles.getPropertyValue("--foreground").trim() ||
        styles.color ||
        "#4545FF"
      );
    };

    const draw = () => {
      if (cancelled) {
        return;
      }

      const parent = canvas.parentElement;
      const width = Math.max(
        1,
        Math.round(parent?.clientWidth ?? window.innerWidth),
      );
      const height = Math.max(
        1,
        Math.round(parent?.clientHeight ?? window.innerHeight),
      );
      const dpr = Math.min(2, window.devicePixelRatio || 1);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.max(12, Math.floor(width / CELL_PX));
      const rows = Math.max(12, Math.floor(height / CELL_PX));
      const cellW = width / cols;
      const cellH = height / rows;

      const scrollY = window.scrollY || 0;
      const phaseY = scrollY / SCROLL_PHASE_PX;
      const phaseX = scrollY / (SCROLL_PHASE_PX * 1.7);

      paintField(
        ctx,
        width,
        height,
        cols,
        rows,
        cellW,
        cellH,
        phaseX,
        phaseY,
        readFg(),
      );
    };

    const schedule = () => {
      if (pending || cancelled) {
        return;
      }
      pending = true;
      raf = requestAnimationFrame(() => {
        pending = false;
        draw();
      });
    };

    draw();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    const mo =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(schedule)
        : null;
    // Spray flips tokens on <html>; redraw so wash tracks --foreground.
    mo?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });

    return () => {
      cancelled = true;
      if (raf) {
        cancelAnimationFrame(raf);
      }
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mo?.disconnect();
    };
  }, [reduceMotion]);

  if (reduceMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full text-foreground"
    />
  );
}
