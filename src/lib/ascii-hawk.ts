import {
  GATEWAY_ACCENT,
  HAWK_GLYPH_TONES,
} from "@/lib/gateway-field-palette";

/**
 * Dark → light. High end is visually heavy for bright feathers.
 * Includes compact "x" for 2px dither weight without spelling words.
 */
export const HAWK_CHARSET = " .,:;-+*x%#@&$";

export const HAWK_VIDEO_SRC = "/ascii-hawk/hawk-source.mp4";
export const HAWK_ATLAS_JSON = "/ascii-hawk/atlas.json";
export const HAWK_ATLAS_BIN = "/ascii-hawk/atlas.bin";
/** Bump when rebaking so clients bypass stale force-cache. */
export const HAWK_ATLAS_VERSION = 2;

/**
 * Live video-tune sample width only (dev `allowVideo` path).
 * Shipped `/` uses the baked atlas at HAWK_ATLAS_COLS×HAWK_ATLAS_ROWS (400×225) —
 * do not expect TARGET_COLS to match atlas geometry.
 */
export const HAWK_TARGET_COLS = 480;

/** Atlas bake resolution (keep scripts/bake-hawk-ascii.mjs in sync). */
export const HAWK_ATLAS_COLS = 400;
export const HAWK_ATLAS_ROWS = 225;

/** Skip fillText below this graded luma (near-black void). */
export const HAWK_LUMA_SKIP = 0.05;

/** Global glyph opacity — 40% below D1 peak (0.95) so Yes/No stay readable. */
export const HAWK_GLYPH_ALPHA = 0.57;

/** Accent share of lit cells (~8% when dense). */
export const HAWK_ACCENT_RATE = 0.08;

/** Desktop ASCII redraw cap (ms); mobile uses hawkFrameIntervalMs(). */
export const HAWK_FRAME_MS = 1000 / 14;

/** Mobile / coarse-pointer atlas playback ceiling. */
export const HAWK_MOBILE_MAX_FPS = 8;

/** Fail closed to Stipple if no frame within this window. */
export const HAWK_LOAD_TIMEOUT_MS = 5000;

/** Minimum cell size (px) when deriving live video grid. */
export const HAWK_MIN_CELL_PX = 2;

/** True when atlas draw rate should drop (narrow viewport or touch). */
export function hawkNeedsReducedFps() {
  if (typeof window === "undefined") {
    return false;
  }
  return (
    window.matchMedia("(max-width: 767px)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

/** Playback interval from baked fps; halves on mobile, capped at HAWK_MOBILE_MAX_FPS. */
export function hawkFrameIntervalMs(bakedFps: number) {
  const fps = Math.max(1, bakedFps || 14);
  if (!hawkNeedsReducedFps()) {
    return 1000 / fps;
  }
  const mobileFps = Math.min(HAWK_MOBILE_MAX_FPS, fps / 2);
  return 1000 / Math.max(1, mobileFps);
}

/**
 * Video decode is opt-in for local tuning only.
 * Production always atlas-only unless NEXT_PUBLIC_HAWK_ALLOW_VIDEO=1.
 */
export function hawkVideoAllowed(allowVideo = false) {
  if (process.env.NEXT_PUBLIC_HAWK_ALLOW_VIDEO === "1") {
    return true;
  }
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return allowVideo;
}

export type HawkAtlasMeta = {
  version: number;
  cols: number;
  rows: number;
  frameCount: number;
  fps: number;
  charset: string;
  pingPong: boolean;
  cellW: number;
  cellH: number;
};

export function lumaFromRgb(r: number, g: number, b: number) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/**
 * Plate bg sits ~0.1–0.2 luma (not pure black). Floor cuts the void;
 * stretch remaining range so eye/beak/feather highs hit heavy glyphs.
 */
export function gradeLuma(raw: number) {
  const lo = 0.18;
  const hi = 0.7;
  if (raw <= lo) {
    return 0;
  }
  const t = Math.min(1, (raw - lo) / (hi - lo));
  return Math.pow(t, 0.55);
}

export function glyphIndexFromLuma(luma: number, charsetLen: number) {
  if (charsetLen <= 1) {
    return 0;
  }
  return Math.min(charsetLen - 1, Math.floor(luma * (charsetLen - 0.0001)));
}

export function toneIndexFromLuma(luma: number) {
  // Statue-style: mostly FG #DDDDFF on #4545FF; soft edge / highlight only.
  if (luma < 0.28) {
    return 1; // #C6C6FF
  }
  if (luma < 0.72) {
    return 2; // #DDDDFF
  }
  return 3; // #F0F0FF
}

export function colorForCell(luma: number, accent: boolean) {
  if (accent && luma > HAWK_LUMA_SKIP) {
    return GATEWAY_ACCENT;
  }
  return HAWK_GLYPH_TONES[toneIndexFromLuma(luma)];
}

export function hash2(ix: number, iy: number) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** object-fit: cover source rect into dest size. */
export function coverRect(
  srcW: number,
  srcH: number,
  destW: number,
  destH: number,
) {
  const scale = Math.max(destW / srcW, destH / srcH);
  const drawW = srcW * scale;
  const drawH = srcH * scale;
  return {
    dx: (destW - drawW) / 2,
    dy: (destH - drawH) / 2,
    dw: drawW,
    dh: drawH,
  };
}

/**
 * Map a fixed atlas grid onto the viewport with object-fit: cover.
 * Keeps cells square (no portrait stretch); crops overflow on the long axis.
 */
export function atlasCoverLayout(
  cols: number,
  rows: number,
  width: number,
  height: number,
) {
  const atlasAspect = cols / Math.max(1, rows);
  const viewAspect = width / Math.max(1, height);

  let cell: number;
  let ox: number;
  let oy: number;

  if (viewAspect > atlasAspect) {
    // Wider than atlas — fill width, crop top/bottom
    cell = width / cols;
    ox = 0;
    oy = (height - rows * cell) / 2;
  } else {
    // Taller (typical mobile) — fill height, crop left/right
    cell = height / rows;
    ox = (width - cols * cell) / 2;
    oy = 0;
  }

  return { cellW: cell, cellH: cell, ox, oy };
}

export function gridForViewport(
  width: number,
  height: number,
  targetCols = HAWK_TARGET_COLS,
) {
  const maxCols = Math.max(24, Math.floor(width / HAWK_MIN_CELL_PX));
  const cols = Math.max(24, Math.min(targetCols, maxCols));
  const cellW = width / cols;
  const cellH = cellW * 1.05;
  const rows = Math.max(12, Math.ceil(height / cellH));
  return { cols, rows, cellW, cellH: height / rows };
}

/**
 * Sample ImageData → write graded luma 0–1 into `out` (length cols*rows).
 * Uses center-of-cell pixels from a buffer already sized cols×rows.
 */
export function sampleLumaGrid(
  data: Uint8ClampedArray,
  cols: number,
  rows: number,
  out: Float32Array,
) {
  const stride = cols * 4;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const i = row * stride + col * 4;
      const raw = lumaFromRgb(data[i], data[i + 1], data[i + 2]);
      out[row * cols + col] = gradeLuma(raw);
    }
  }
}

export function glyphFontSize(cellH: number) {
  // Allow sub-8px fonts so ~2–3px cells pack like dither, not sparse type.
  return Math.max(1.5, cellH * 0.98);
}

export function drawLumaGrid(
  ctx: CanvasRenderingContext2D,
  luma: Float32Array,
  cols: number,
  rows: number,
  cellW: number,
  cellH: number,
  charset = HAWK_CHARSET,
) {
  ctx.clearRect(0, 0, cols * cellW, rows * cellH);
  const fontPx = glyphFontSize(cellH);
  ctx.font = `700 ${fontPx}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const minSide = Math.min(cellW, cellH);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const v = luma[row * cols + col];
      if (v < HAWK_LUMA_SKIP) {
        continue;
      }

      const gi = glyphIndexFromLuma(v, charset.length);
      const ch = charset[gi];
      if (ch === " ") {
        continue;
      }

      const accent = hash2(col, row) < HAWK_ACCENT_RATE;
      ctx.globalAlpha = HAWK_GLYPH_ALPHA * (0.88 + v * 0.12);
      ctx.fillStyle = colorForCell(v, accent);

      const px = col * cellW + cellW * 0.5;
      const py = row * cellH + cellH * 0.5;
      // Packed ~2px dither mark; char on top when cells are large enough to read.
      const mark = Math.max(1.6, minSide * (0.62 + v * 0.4));
      ctx.fillRect(px - mark / 2, py - mark / 2, mark, mark);
      if (minSide >= 2.4 && gi >= 2) {
        ctx.fillText(ch, px, py);
      }
    }
  }

  ctx.globalAlpha = 1;
}

/** Ping-pong frame index over [0, frameCount). */
export function pingPongIndex(tick: number, frameCount: number) {
  if (frameCount <= 1) {
    return 0;
  }
  const cycle = frameCount * 2 - 2;
  const t = ((tick % cycle) + cycle) % cycle;
  return t < frameCount ? t : cycle - t;
}
