/**
 * Dark → light. High end is visually heavy for bright feathers.
 * Includes compact "x" for 2px dither weight without spelling words.
 */
export const HAWK_CHARSET = " .,:;-+*x%#@&$";

/** Landing video ASCII — WebGL field grid (matched to former atlas bake). */
export const HAWK_ATLAS_COLS = 400;
export const HAWK_ATLAS_ROWS = 225;

/**
 * Mobile / coarse: target ~6.5 CSS px square cells.
 * Nominal 16:9 at 390-wide is 60×34; on tall phones we size the grid to the
 * viewport (≈60×130) so atlasCoverLayout fills without cropping to ~16 cells.
 */
export const HAWK_CELL_CSS_MOBILE = 6.5;
export const HAWK_ATLAS_COLS_MOBILE = 60;
export const HAWK_ATLAS_ROWS_MOBILE = 34;

export const HAWK_VIDEO_WEBM = "/ascii-hawk/video/hawk-480.webm";
export const HAWK_VIDEO_MP4 = "/ascii-hawk/video/hawk-480.mp4";
export const HAWK_VIDEO_POSTER = "/ascii-hawk/video/hawk-poster.webp";

/** Cap for non-RVFC rAF loop. */
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
    const w = Math.max(
      1,
      cssW ?? (typeof window !== "undefined" ? window.innerWidth : 390),
    );
    const h = Math.max(
      1,
      cssH ?? (typeof window !== "undefined" ? window.innerHeight : 844),
    );
    // Prefer viewport fill at ~CELL px so the hawk stays readable on portrait.
    // Locked 60×34 + cover only showed ~16 huge cells on a 390×844 screen.
    const cols = Math.max(
      24,
      Math.min(120, Math.round(w / HAWK_CELL_CSS_MOBILE)),
    );
    const rows = Math.max(
      12,
      Math.min(200, Math.round(h / HAWK_CELL_CSS_MOBILE)),
    );
    return { cols, rows };
  }
  return { cols: HAWK_ATLAS_COLS, rows: HAWK_ATLAS_ROWS };
}

export function lumaFromRgb(r: number, g: number, b: number) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

export function glyphIndexFromLuma(luma: number, charsetLen: number) {
  if (charsetLen <= 1) {
    return 0;
  }
  return Math.min(charsetLen - 1, Math.floor(luma * (charsetLen - 0.0001)));
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
