"use client";

/**
 * Soft powder ASCII atmosphere behind RSVP FitWord.
 * Sparse mono marks only — never renders manifesto text.
 */

import { useEffect, useRef } from "react";

const CHARSET = ".:·+*x";
const GAP = 22;
const POWDER = "#DDDDFF";
/** Peak mark opacity — stays subordinate to Unbounded type. */
const ALPHA = 0.11;

function hash2(ix: number, iy: number) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

type IntroGlyphBedProps = {
  className?: string;
};

export function IntroGlyphBed({ className }: IntroGlyphBedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let frame = 0;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let running = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / GAP) + 1;
      rows = Math.ceil(height / GAP) + 1;
    };

    const draw = (time: number) => {
      const t = reduceMotion ? 0 : time / 1000;
      ctx.clearRect(0, 0, width, height);
      ctx.font = `500 ${Math.max(9, GAP * 0.42)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = POWDER;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const seed = hash2(col, row);
          // Sparse — leave most cells empty so FitWord stays primary.
          if (seed > 0.28) {
            continue;
          }

          const ch = CHARSET[Math.floor(hash2(col + 3, row + 7) * CHARSET.length)]!;
          const drift = reduceMotion
            ? 0
            : Math.sin(t * 0.35 + seed * 6.2) * 1.2;
          const x = col * GAP + GAP * 0.5 + (hash2(col, row + 11) - 0.5) * 4;
          const y =
            row * GAP + GAP * 0.5 + (hash2(col + 5, row) - 0.5) * 4 + drift;
          const breath = reduceMotion
            ? 1
            : 0.85 + 0.15 * Math.sin(t * 0.55 + seed * 8);
          ctx.globalAlpha = ALPHA * breath * (0.55 + seed * 0.45);
          ctx.fillText(ch, x, y);
        }
      }

      ctx.globalAlpha = 1;
    };

    const stop = () => {
      running = false;
      window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const tick = (now: number) => {
      draw(now);
      if (running && !reduceMotion) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    const start = () => {
      if (reduceMotion || running || document.hidden) {
        return;
      }
      running = true;
      frame = window.requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
        return;
      }
      draw(performance.now());
      start();
    };

    resize();
    draw(reduceMotion ? 0 : performance.now());
    start();

    const observer = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    observer.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={
        className ??
        "pointer-events-none absolute inset-0 z-[1] h-full w-full"
      }
    />
  );
}
