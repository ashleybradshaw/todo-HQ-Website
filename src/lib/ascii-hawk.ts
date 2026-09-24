import {
  GATEWAY_ACCENT,
  HAWK_GLYPH_TONES,
} from "@/lib/gateway-field-palette";

/**
 * Dark → light. High end is visually heavy for bright feathers.
 * Includes compact "x" for 2px dither weight without spelling words.
 */
export const HAWK_CHARSET = " .,:;-+*x%#@&$";

/** Landing video ASCII — WebGL field grid (matched to former atlas bake). */
export const HAWK_ATLAS_COLS = 400;
export const HAWK_ATLAS_ROWS = 225;

/**
 * Mobile / coarse: target ~6.5 CSS px cells filling the viewport
 * (390÷6.5 ≈ 60 cols). Not locked to 16:9 cover — that left ~16 huge cells on screen.
 */
export const HAWK_CELL_CSS_MOBILE = 6.5;
/** Reference dims at 390×844 with HAWK_CELL_CSS_MOBILE (for docs / sanity). */
export const HAWK_ATLAS_COLS_MOBILE = 60;
export const HAWK_ATLAS_ROWS_MOBILE = 130;

export const HAWK_VIDEO_WEBM = "/ascii-hawk/video/hawk-480.webm";
export const HAWK_VIDEO_MP4 = "/ascii-hawk/video/hawk-480.mp4";
export const HAWK_VIDEO_POSTER = "/ascii-hawk/video/hawk-poster.webp";

/** Cap for non-RVFC rAF loop (proto / reference.html). */
export const HAWK_VIDEO_FPS = 24;

/** Skip near-black void in graded luma. */
export const HAWK_LUMA_SKIP = 0.05;

/** Global glyph opacity — keeps Yes/No readable on #4545FF. */
export const HAWK_GLYPH_ALPHA = 0.57;

/** Accent share of lit cells (~8% when dense). */
export const HAWK_ACCENT_RATE = 0.08;

/** Fail closed to Stipple if video never becomes ready after load starts. */
export const HAWK_LOAD_TIMEOUT_MS = 5000;

/** True on narrow viewport or coarse pointer — DPR 1, etc. */
export function hawkNeedsReducedFps() {
  if (typeof window === "undefined") {
    return false;
  }
  return (
    window.matchMedia("(max-width: 767px)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

/** Active ASCII grid for the current viewport (dense desktop / coarse mobile). */
export function hawkAtlasGrid(cssW?: number, cssH?: number) {
  if (hawkNeedsReducedFps()) {
    const w = Math.max(1, cssW ?? (typeof window !== "undefined" ? window.innerWidth : 390));
    const h = Math.max(1, cssH ?? (typeof window !== "undefined" ? window.innerHeight : 844));
    return {
      cols: Math.max(24, Math.round(w / HAWK_CELL_CSS_MOBILE)),
      rows: Math.max(12, Math.round(h / HAWK_CELL_CSS_MOBILE)),
      fillViewport: true as const,
    };
  }
  return {
    cols: HAWK_ATLAS_COLS,
    rows: HAWK_ATLAS_ROWS,
    fillViewport: false as const,
  };
}

export function lumaFromRgb(r: number, g: number, b: number) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/**
 * Plate bg sits ~0.1–0.2 luma (not pure black). Floor cuts the void;
 * stretch remaining range so eye/beak/feather highs hit heavy glyphs.
 * Used by AsciiReveal sampling (About); landing WebGL inlines the same curve.
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

/**
 * Map a fixed grid onto the viewport with object-fit: cover.
 * Keeps cells square; crops overflow on the long axis.
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
    cell = width / cols;
    ox = 0;
    oy = (height - rows * cell) / 2;
  } else {
    cell = height / rows;
    ox = (width - cols * cell) / 2;
    oy = 0;
  }

  return { cellW: cell, cellH: cell, ox, oy };
}
