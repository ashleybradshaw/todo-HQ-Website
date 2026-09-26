/**
 * Dark → light. High end is visually heavy for bright feathers.
 * Includes compact "x" for 2px dither weight without spelling words.
 */
export const HAWK_CHARSET = " .,:;-+*x%#@&$";

/** Landing video ASCII — WebGL field grid (matched to former atlas bake). */
export const HAWK_ATLAS_COLS = 400;
export const HAWK_ATLAS_ROWS = 225;

/**
 * Mobile / coarse: ~5.75 CSS px cells → ≈68 cols at 390px (60–75 target).
 * Tall phones size the grid to the viewport so cover stays readable.
 */
export const HAWK_CELL_CSS_MOBILE = 5.2;
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

/**
 * Soft load budget — after poster paints, expiry keeps the still hawk
 * (gesture may still unlock play). Does not Stipple.
 */
export const HAWK_LOAD_TIMEOUT_MS = 5000;

/**
 * Landscape / tablet-landscape focus (source 0–1). Eye + head mass on
 * the mid-cycle open-eye profile.
 */
export const HAWK_FOCUS: { x: number; y: number } = { x: 0.52, y: 0.42 };

/**
 * Portrait focus — eye centre from the poster; x biased left so the beak
 * can reach the right edge when the tall crop allows.
 */
export const HAWK_FOCUS_PORTRAIT: { x: number; y: number } = {
  x: 0.47,
  y: 0.45,
};

/** Viewport Y (0–1) where the portrait eye should sit — above //TODO / First time?. */
export const HAWK_PORTRAIT_EYE_VIEW_Y = 0.34;

/**
 * Portrait cover zoom (>1) so there is vertical crop room to pin the eye
 * near HAWK_PORTRAIT_EYE_VIEW_Y without letterboxing.
 */
export const HAWK_PORTRAIT_COVER_ZOOM = 1.22;

export type HawkFrameConfig = {
  /** Source-frame focus for cover crop. */
  focus: { x: number; y: number };
  /**
   * Where that source focus lands in the viewport/grid (0–1).
   * Portrait pins the eye near the upper third; landscape uses focus itself
   * (classic object-position).
   */
  anchor: { x: number; y: number };
  /** Extra uniform scale on top of cover (≥1). Portrait only. */
  coverZoom: number;
};

/**
 * Per-aspect framing. Aspect = cssW / cssH.
 * All bands: full cover (no letterbox / empty blue). Portrait uses a dedicated
 * eye focus + viewport anchor so the head clears the CTA.
 */
export function hawkFrameForAspect(aspect: number): HawkFrameConfig {
  if (aspect < 0.75) {
    return {
      focus: HAWK_FOCUS_PORTRAIT,
      // Bias X left of centre so beak reads toward the right edge.
      anchor: { x: 0.4, y: HAWK_PORTRAIT_EYE_VIEW_Y },
      coverZoom: HAWK_PORTRAIT_COVER_ZOOM,
    };
  }
  // Tablet + desktop landscape: landscape focus, object-position style anchor.
  return {
    focus: HAWK_FOCUS,
    anchor: { x: HAWK_FOCUS.x, y: HAWK_FOCUS.y },
    coverZoom: 1,
  };
}

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

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

/**
 * Map a fixed grid onto the viewport with object-fit: cover, focus-weighted.
 * Keeps cells square; leftover crop follows focus (0–1).
 */
export function atlasCoverLayout(
  cols: number,
  rows: number,
  width: number,
  height: number,
  focusX = HAWK_FOCUS.x,
  focusY = HAWK_FOCUS.y,
) {
  const atlasAspect = cols / Math.max(1, rows);
  const viewAspect = width / Math.max(1, height);
  const fx = clamp01(focusX);
  const fy = clamp01(focusY);

  let cell: number;
  let ox: number;
  let oy: number;

  if (viewAspect > atlasAspect) {
    cell = width / cols;
    ox = 0;
    oy = (height - rows * cell) * fy;
  } else {
    cell = height / rows;
    ox = (width - cols * cell) * fx;
    oy = 0;
  }

  return { cellW: cell, cellH: cell, ox, oy };
}

/**
 * Video → grid sample: always full cover (max-fit). Places source focus at
 * the given viewport/grid anchor, clamped so no empty edges appear.
 *
 * focus / anchor are CSS-style (origin top-left, y down). The GL grid grows
 * from the bottom and the shader flips video V, so Y is converted here.
 */
export function hawkVideoSampleLayout(
  gridCols: number,
  gridRows: number,
  vidW: number,
  vidH: number,
  frame: HawkFrameConfig,
) {
  const vw = Math.max(1, vidW);
  const vh = Math.max(1, vidH);
  const fx = clamp01(frame.focus.x);
  // Source focus in pre-flip vu space (shader does tuv.y = 1 - vu.y).
  const fyVu = 1 - clamp01(frame.focus.y);
  const ax = clamp01(frame.anchor.x);
  // Anchor from top → grid row from bottom.
  const ayGl = 1 - clamp01(frame.anchor.y);

  const sFit =
    Math.max(gridCols / vw, gridRows / vh) * Math.max(1, frame.coverZoom);
  const vsX = vw * sFit;
  const vsY = vh * sFit;

  // Ideal: source (fx, fyVu) lands at grid (ax*cols, ayGl*rows).
  let offX = ax * gridCols - fx * vsX;
  let offY = ayGl * gridRows - fyVu * vsY;

  // Cover clamp — vs ≥ grid on the cropped axis; keep sample inside the frame.
  const minOffX = Math.min(0, gridCols - vsX);
  const maxOffX = Math.max(0, gridCols - vsX);
  const minOffY = Math.min(0, gridRows - vsY);
  const maxOffY = Math.max(0, gridRows - vsY);
  offX = clamp(offX, minOffX, maxOffX);
  offY = clamp(offY, minOffY, maxOffY);

  return { vsX, vsY, offX, offY };
}
