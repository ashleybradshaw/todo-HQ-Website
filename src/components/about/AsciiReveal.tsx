"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  glyphIndexFromLuma,
  lumaFromRgb,
} from "@/lib/ascii-hawk";
import { cn } from "@/lib/cn";

/** Denser than gateway HAWK_CHARSET — light→heavy for photo reveals. */
const REVEAL_CHARSET =
  " .'`^\",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
/** Packed grid — rows derived from 4:5 aspect. */
const COLS = 54;
const SCRAMBLE_MS = 550;
const SETTLE_MS = 200;
const FADE_MS = 250;

type AsciiRevealProps = {
  src: string;
  alt: string;
  className?: string;
  children?: ReactNode;
};

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readTokens(el: HTMLElement) {
  const styles = getComputedStyle(el);
  return {
    bg: styles.getPropertyValue("--bg-canvas").trim() || styles.backgroundColor,
    fg: styles.getPropertyValue("--foreground").trim() || styles.color,
  };
}

function sampleGlyphs(
  img: HTMLImageElement,
  cols: number,
  rows: number,
): Uint8Array {
  const off = document.createElement("canvas");
  off.width = cols;
  off.height = rows;
  const ctx = off.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return new Uint8Array(cols * rows);
  }

  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(cols / iw, rows / ih);
  const sw = cols / scale;
  const sh = rows / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
  const { data } = ctx.getImageData(0, 0, cols, rows);

  const out = new Uint8Array(cols * rows);
  const len = REVEAL_CHARSET.length;
  for (let i = 0; i < cols * rows; i += 1) {
    const o = i * 4;
    const raw = lumaFromRgb(data[o], data[o + 1], data[o + 2]);
    // Slightly wider mid-tone ramp so denser grids still read structure.
    const luma = Math.pow(Math.min(1, Math.max(0, (raw - 0.06) / 0.88)), 0.75);
    out[i] = glyphIndexFromLuma(luma, len);
  }
  return out;
}

function drawGlyphFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cols: number,
  rows: number,
  indices: Uint8Array,
  bg: string,
  fg: string,
  scramble: boolean,
) {
  const cellW = width / cols;
  const cellH = height / rows;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Sub-cell font so 54-col glyphs pack like dither, not sparse type.
  ctx.font = `700 ${Math.max(2.5, Math.min(cellW, cellH) * 0.82)}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;

  const len = REVEAL_CHARSET.length;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const i = row * cols + col;
      const gi = scramble
        ? Math.floor(Math.random() * len)
        : indices[i];
      const ch = REVEAL_CHARSET[gi];
      if (!ch || ch === " ") {
        continue;
      }
      const t = gi / Math.max(1, len - 1);
      ctx.globalAlpha = 0.38 + t * 0.62;
      ctx.fillText(ch, col * cellW + cellW * 0.5, row * cellH + cellH * 0.5);
    }
  }
  ctx.globalAlpha = 1;
}

export function AsciiReveal({
  src,
  alt,
  className,
  children,
}: AsciiRevealProps) {
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );
  const shellRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [showImage, setShowImage] = useState(false);
  const [canvasGone, setCanvasGone] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    let raf = 0;
    let scrambleTimer = 0;
    let settleTimer = 0;
    let fadeTimer = 0;
    let observer: IntersectionObserver | null = null;
    let cancelled = false;

    const teardownCanvas = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      window.clearTimeout(scrambleTimer);
      window.clearTimeout(settleTimer);
      window.clearTimeout(fadeTimer);
      setCanvasGone(true);
    };

    const runReveal = async () => {
      if (startedRef.current || cancelled) {
        return;
      }
      startedRef.current = true;
      observer?.disconnect();

      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img) {
        setShowImage(true);
        setCanvasGone(true);
        return;
      }

      try {
        if (!img.complete || img.naturalWidth === 0) {
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("img"));
          });
        }
      } catch {
        setShowImage(true);
        setCanvasGone(true);
        return;
      }

      if (cancelled) {
        return;
      }

      const rect = shell.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const rows = Math.max(12, Math.round((COLS * 5) / 4));
      const dpr = Math.min(2, window.devicePixelRatio || 1);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setShowImage(true);
        setCanvasGone(true);
        return;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      let glyphs: Uint8Array;
      try {
        glyphs = sampleGlyphs(img, COLS, rows);
      } catch {
        setShowImage(true);
        setCanvasGone(true);
        return;
      }

      const paint = (scramble: boolean) => {
        const { bg, fg } = readTokens(shell);
        drawGlyphFrame(ctx, width, height, COLS, rows, glyphs, bg, fg, scramble);
      };

      const scrambleLoop = () => {
        paint(true);
        raf = requestAnimationFrame(scrambleLoop);
      };
      paint(true);
      raf = requestAnimationFrame(scrambleLoop);

      scrambleTimer = window.setTimeout(() => {
        cancelAnimationFrame(raf);
        raf = 0;
        paint(false);
        settleTimer = window.setTimeout(() => {
          setShowImage(true);
          fadeTimer = window.setTimeout(() => {
            teardownCanvas();
          }, FADE_MS);
        }, SETTLE_MS);
      }, SCRAMBLE_MS);
    };

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void runReveal();
        }
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.2 },
    );
    observer.observe(shell);

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (raf) {
        cancelAnimationFrame(raf);
      }
      window.clearTimeout(scrambleTimer);
      window.clearTimeout(settleTimer);
      window.clearTimeout(fadeTimer);
    };
  }, [reduceMotion]);

  const fadeStyle = {
    ["--ascii-fade-ms" as string]: `${FADE_MS}ms`,
  } satisfies CSSProperties;

  const imageVisible = reduceMotion || showImage;

  return (
    <div
      ref={shellRef}
      className={cn(
        "blog-post-hero relative aspect-[4/5] w-full border border-border-ide bg-background text-foreground",
        className,
      )}
      style={fadeStyle}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- same-origin sample + reveal */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        decoding="async"
        className={cn(
          "absolute inset-0 z-[1] h-full w-full object-cover object-center saturate-[0.8] transition-opacity ease-out",
          imageVisible ? "opacity-100" : "opacity-0",
          "motion-reduce:opacity-100 motion-reduce:transition-none",
        )}
        style={{ transitionDuration: "var(--ascii-fade-ms)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)]"
      />
      {!reduceMotion && !canvasGone ? (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 z-[3] h-full w-full transition-opacity ease-out",
            showImage ? "opacity-0" : "opacity-100",
          )}
          style={{ transitionDuration: "var(--ascii-fade-ms)" }}
        />
      ) : null}
      {children ? (
        <div className="pointer-events-none absolute inset-0 z-[4]">{children}</div>
      ) : null}
    </div>
  );
}
