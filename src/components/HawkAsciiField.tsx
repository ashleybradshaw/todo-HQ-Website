"use client";

import { useEffect, useRef, useState } from "react";
import {
  HAWK_ACCENT_RATE,
  HAWK_ATLAS_BIN,
  HAWK_ATLAS_JSON,
  HAWK_ATLAS_VERSION,
  HAWK_CHARSET,
  HAWK_FRAME_MS,
  HAWK_GLYPH_ALPHA,
  HAWK_LOAD_TIMEOUT_MS,
  HAWK_LUMA_SKIP,
  HAWK_TARGET_COLS,
  HAWK_VIDEO_SRC,
  atlasCoverLayout,
  colorForCell,
  coverRect,
  drawLumaGrid,
  glyphFontSize,
  gridForViewport,
  hash2,
  hawkFrameIntervalMs,
  hawkNeedsReducedFps,
  hawkVideoAllowed,
  pingPongIndex,
  sampleLumaGrid,
  type HawkAtlasMeta,
} from "@/lib/ascii-hawk";

type HawkAsciiFieldProps = {
  /**
   * Dev-only video tune fallback when atlas is missing.
   * Ignored in production unless NEXT_PUBLIC_HAWK_ALLOW_VIDEO=1.
   */
  allowVideo?: boolean;
  onFallback?: () => void;
};

function drawAtlasFrame(
  ctx: CanvasRenderingContext2D,
  atlasData: Uint8Array,
  meta: HawkAtlasMeta,
  frameIndex: number,
  width: number,
  height: number,
) {
  const { cols, rows, charset } = meta;
  const { cellW, cellH, ox, oy } = atlasCoverLayout(cols, rows, width, height);
  const chars = charset || HAWK_CHARSET;
  const base = frameIndex * cols * rows;
  const maxGi = Math.max(1, chars.length - 1);

  ctx.clearRect(0, 0, width, height);
  ctx.font = `700 ${glyphFontSize(cellH)}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const minSide = Math.min(cellW, cellH);
  const pad = minSide;

  const rowStart = Math.max(0, Math.floor((-oy - pad) / cellH));
  const rowEnd = Math.min(rows, Math.ceil((height - oy + pad) / cellH));
  const colStart = Math.max(0, Math.floor((-ox - pad) / cellW));
  const colEnd = Math.min(cols, Math.ceil((width - ox + pad) / cellW));

  for (let row = rowStart; row < rowEnd; row += 1) {
    for (let col = colStart; col < colEnd; col += 1) {
      const gi = atlasData[base + row * cols + col] ?? 0;
      if (gi <= 0) {
        continue;
      }
      const ch = chars[gi];
      if (!ch || ch === " ") {
        continue;
      }
      const v = gi / maxGi;
      if (v < HAWK_LUMA_SKIP) {
        continue;
      }
      const accent = hash2(col, row) < HAWK_ACCENT_RATE;
      ctx.globalAlpha = HAWK_GLYPH_ALPHA * (0.88 + v * 0.12);
      ctx.fillStyle = colorForCell(v, accent);

      const px = ox + col * cellW + cellW * 0.5;
      const py = oy + row * cellH + cellH * 0.5;
      const mark = Math.max(1.6, minSide * (0.62 + v * 0.4));
      ctx.fillRect(px - mark / 2, py - mark / 2, mark, mark);
      if (minSide >= 2.4 && gi >= 2) {
        ctx.fillText(ch, px, py);
      }
    }
  }

  ctx.globalAlpha = 1;
}

export function HawkAsciiField({
  allowVideo = false,
  onFallback,
}: HawkAsciiFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const onFallbackRef = useRef(onFallback);
  const [visible, setVisible] = useState(false);
  const videoEnabled = hawkVideoAllowed(allowVideo);

  useEffect(() => {
    onFallbackRef.current = onFallback;
  }, [onFallback]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) {
      onFallbackRef.current?.();
      return;
    }

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let cellW = 0;
    let cellH = 0;
    let raf = 0;
    let running = false;
    let disposed = false;
    let lastSample = 0;
    let gotFrame = false;

    let luma = new Float32Array(0);
    const sampleCanvas = document.createElement("canvas");
    let sampleCtx = sampleCanvas.getContext("2d", {
      willReadFrequently: true,
      alpha: false,
    });

    let atlasMeta: HawkAtlasMeta | null = null;
    let atlasData: Uint8Array | null = null;
    let atlasTick = 0;
    let mode: "atlas" | "video" = "atlas";
    let bakedFps = 14;
    let frameMs = HAWK_FRAME_MS;
    /** Mobile: advance 2 atlas indices per draw (skip every other frame). */
    let atlasStep = 1;

    let video: HTMLVideoElement | null = null;
    let videoDir: 1 | -1 = 1;
    let videoDuration = 0;

    const syncPlaybackRate = () => {
      frameMs = hawkFrameIntervalMs(bakedFps);
      atlasStep = hawkNeedsReducedFps() ? 2 : 1;
    };

    const stop = () => {
      running = false;
      window.cancelAnimationFrame(raf);
      raf = 0;
    };

    const fail = () => {
      if (disposed) {
        return;
      }
      stop();
      onFallbackRef.current?.();
    };

    let loadTimeout = 0;
    const markReady = () => {
      gotFrame = true;
      window.clearTimeout(loadTimeout);
      setVisible(true);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (atlasMeta && mode === "atlas") {
        cols = atlasMeta.cols;
        rows = atlasMeta.rows;
        const layout = atlasCoverLayout(cols, rows, width, height);
        cellW = layout.cellW;
        cellH = layout.cellH;
      } else {
        const grid = gridForViewport(width, height, HAWK_TARGET_COLS);
        cols = grid.cols;
        rows = grid.rows;
        cellW = grid.cellW;
        cellH = grid.cellH;
      }

      luma = new Float32Array(cols * rows);
      sampleCanvas.width = cols;
      sampleCanvas.height = rows;
      sampleCtx = sampleCanvas.getContext("2d", {
        willReadFrequently: true,
        alpha: false,
      });
      syncPlaybackRate();
    };

    const sampleVideoFrame = () => {
      if (!video || !sampleCtx || video.readyState < 2) {
        return false;
      }
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) {
        return false;
      }

      const cover = coverRect(vw, vh, cols, rows);
      sampleCtx.fillStyle = "#000";
      sampleCtx.fillRect(0, 0, cols, rows);
      sampleCtx.drawImage(video, cover.dx, cover.dy, cover.dw, cover.dh);
      const image = sampleCtx.getImageData(0, 0, cols, rows);
      sampleLumaGrid(image.data, cols, rows, luma);
      drawLumaGrid(ctx, luma, cols, rows, cellW, cellH, HAWK_CHARSET);
      return true;
    };

    const advanceVideo = (dtSec: number) => {
      if (!video || !videoDuration) {
        return;
      }
      let t = video.currentTime + videoDir * dtSec;
      if (t >= videoDuration) {
        t = videoDuration;
        videoDir = -1;
      } else if (t <= 0) {
        t = 0;
        videoDir = 1;
      }
      video.currentTime = t;
    };

    const tick = (now: number) => {
      if (!running) {
        return;
      }

      if (now - lastSample >= frameMs) {
        const dt = lastSample ? (now - lastSample) / 1000 : frameMs / 1000;
        lastSample = now;

        if (mode === "atlas" && atlasMeta && atlasData) {
          const frameIndex = pingPongIndex(atlasTick, atlasMeta.frameCount);
          drawAtlasFrame(ctx, atlasData, atlasMeta, frameIndex, width, height);
          atlasTick += atlasStep;
          gotFrame = true;
        } else if (mode === "video") {
          advanceVideo(dt);
          if (sampleVideoFrame()) {
            gotFrame = true;
          }
        }
      }

      raf = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || document.hidden || disposed) {
        return;
      }
      running = true;
      lastSample = 0;
      raf = window.requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
        return;
      }
      start();
    };

    const loadAtlas = async () => {
      const bust = `?v=${HAWK_ATLAS_VERSION}`;
      const metaRes = await fetch(`${HAWK_ATLAS_JSON}${bust}`, {
        cache: "no-cache",
      });
      if (!metaRes.ok) {
        throw new Error("atlas meta missing");
      }
      const meta = (await metaRes.json()) as HawkAtlasMeta;
      const binRes = await fetch(`${HAWK_ATLAS_BIN}${bust}`, {
        cache: "no-cache",
      });
      if (!binRes.ok) {
        throw new Error("atlas bin missing");
      }
      const buf = await binRes.arrayBuffer();
      const expected = meta.cols * meta.rows * meta.frameCount;
      if (buf.byteLength < expected) {
        throw new Error("atlas bin truncated");
      }
      atlasMeta = meta;
      atlasData = new Uint8Array(buf);
      mode = "atlas";
      bakedFps = meta.fps || 14;
      syncPlaybackRate();
      resize();
      drawAtlasFrame(ctx, atlasData, atlasMeta, 0, width, height);
      markReady();
      start();
    };

    const loadVideo = () =>
      new Promise<void>((resolve, reject) => {
        const el = videoRef.current;
        if (!el) {
          reject(new Error("no video element"));
          return;
        }
        video = el;

        const onReady = () => {
          videoDuration = video?.duration || 0;
          if (!videoDuration || !video?.videoWidth) {
            reject(new Error("video not ready"));
            return;
          }
          mode = "video";
          resize();
          video.currentTime = Math.min(videoDuration * 0.35, videoDuration);
          const paint = () => {
            if (sampleVideoFrame()) {
              markReady();
              start();
              resolve();
            } else {
              reject(new Error("sample failed"));
            }
          };
          if (typeof video.requestVideoFrameCallback === "function") {
            video.requestVideoFrameCallback(() => paint());
          } else {
            video.addEventListener("seeked", paint, { once: true });
          }
        };

        el.muted = true;
        el.playsInline = true;
        el.preload = "auto";
        el.loop = false;
        // Local tune only — source plate lives in assets/ascii-hawk/, not public/.
        el.src = HAWK_VIDEO_SRC;

        if (el.readyState >= 2) {
          onReady();
        } else {
          el.addEventListener("loadeddata", onReady, { once: true });
          el.addEventListener(
            "error",
            () => reject(new Error("video error")),
            { once: true },
          );
          el.load();
        }
      });

    loadTimeout = window.setTimeout(() => {
      if (!gotFrame) {
        fail();
      }
    }, HAWK_LOAD_TIMEOUT_MS);

    const boot = async () => {
      try {
        await loadAtlas();
      } catch {
        if (!videoEnabled) {
          fail();
          return;
        }
        try {
          await loadVideo();
        } catch {
          fail();
        }
      }
    };

    resize();
    void boot();

    const observer = new ResizeObserver(() => {
      resize();
      if (mode === "atlas" && atlasMeta && atlasData) {
        const frameIndex = pingPongIndex(atlasTick, atlasMeta.frameCount);
        drawAtlasFrame(ctx, atlasData, atlasMeta, frameIndex, width, height);
      } else if (mode === "video") {
        sampleVideoFrame();
      }
    });
    observer.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      window.clearTimeout(loadTimeout);
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [videoEnabled]);

  return (
    <>
      {videoEnabled ? (
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          className="pointer-events-none absolute h-px w-px opacity-0"
        />
      ) : null}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-0 h-full w-full transition-opacity duration-700 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}
