"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useSpray } from "@/components/SprayProvider";
import { homePage } from "@/content/pages/home";
import { cn } from "@/lib/cn";

const { hero } = homePage;

/* Alpha budget */
const SOURCE_ALPHA = 0.3;
const SOURCE2_ALPHA = 0.18;
const FUNNEL_ALPHA = 0.14;
const FUNNEL_ALPHA_OUTER = 0.1;
const RUN_ALPHA = 0.08;
const TRAV_FUNNEL_ALPHA = 0.14;
const TRAV_RUN_ALPHA = 0.1;
const PULSE_ALPHA = 0.55;
const NODE_ALPHA = 0.35;
const NODE_FLASH_ALPHA = 0.6;
const DOT_ALPHA = 0.16;
const DOT_DIM_ALPHA = 0.08;
const DOT_LIT_ALPHA = 0.5;
const HUE2_ALPHA_MIN = 0.1;
const HUE2_ALPHA_MAX = 0.18;
/** Cap for everything behind the measured h1, lead, and buttons. */
const MASK_ALPHA = 0.04;
const FEATHER = 20;

/* Pools and lookups */
const FUN = 64;
const RUN_MAX = 300;
const S_MAX = FUN + RUN_MAX;
const TRACK_MAX = 40;
const CHAR_MAX = 32;
const CHAR2_MAX = 24;
const SRC_LINES = 3;
const DOT_COLS_MAX = 8;
const BAR_POOL = 80;
const TRAV_POOL = 80;
const POOL_PULSES = 3;
const BURST_SLOTS = 3;

/* Geometry */
const TRACKS_MOBILE = 8;
const TRAVELLERS_MOBILE = 10;
const FUNNEL_END_AT = 0.3;
const SOURCE_AT = 0.03;
const MIN_FUNNEL_LEN = 110;
const SOURCE_GAP = 24;
const BOTTLENECK_GAP = 8;
const BEZIER_PULL = 0.4;
const EDGE = 12;
const MOBILE_GAP = 8;
const MIN_BAND = 36;
const DOT_PITCH = 12;
const DOT_RADIUS = 1.25;
const DOT_GAP_TO_BARS = 24;
const OUT_GAP = 16;
/** Below this much room right of the text, the dot grid is dropped. */
const NARROW_ROOM = 140;
const BAR_H = 4;
const BAR_PITCH = 6;
const LABEL_GAP = 16;
const LABEL_GAP_BARS = 8;
const FIELD_TOP = 0.12;
const FIELD_BOT = 0.92;

/* Motion */
const BREATHE = 0.03;
const BREATHE_PERIOD = 40;
const TRAV_MIN = 30;
const TRAV_MAX = 50;
const PULSE_RUN_SPEED = 120;
const CROSS_MIN = 1.5;
const CROSS_MAX = 2.5;
const PULSE_FADE_MS = 160;
const LIT_MS = 600;
const NODE_FLASH_MS = 200;
const BIT_MIN = 0.8;
const BIT_SPAN = 0.6;
const DOT_TIMER_MIN = 0.4;
const DOT_TIMER_SPAN = 0.5;
const DOT_TAU_MIN = 0.2;
const DOT_TAU_SPAN = 0.2;
const BAR_SETTLE_MIN = 0.25;
const BAR_SETTLE_SPAN = 0.2;
const BAR_FORCE_HOLD = 0.4;
const IDLE_WAVE_T = 8;
const IDLE_WAVE_AMP = 4;
const BEAT_MIN = 1.6;
const BEAT_SPAN = 0.8;
const RIPPLE_STEP = 0.03;
const RIPPLE2_OFF = 0.04;
const FALL_OFF = [1, 0.7, 0.4, 0.2] as const;

const BAR_WIDTHS = [4, 8, 16, 24, 32] as const;
/** Alpha x 100 for the bar buckets (0.10 to 0.40). */
const BAR_LEVELS = [10, 16, 22, 30, 40] as const;
const TAIL_OFF = [0, 4.7, 9.3, 14] as const;
const TAIL_ALPHA = [1, 0.6, 0.3, 0.12] as const;
const GLYPH = ["0", "1"] as const;

const ALPHA_STEP = 0.01;
const LEVELS = 64;
const LEVEL_INSIDE = 255;
const LEVEL_SKIP = 254;

const FRAME_MS = 1000 / 30;
const BOOT_GRACE_MS = 100;
const MD_QUERY = "(min-width: 768px)";
const STILL_STEPS = 150;

type Rgba = { r: number; g: number; b: number; a: number };

type Rect = { x: number; y: number; w: number; h: number };

type Palette = { muted: Rgba; fg: Rgba; accent: Rgba; hue2: Rgba };

type Styles = {
  fg: string[];
  muted: string[];
  accent: string[];
  hue2: string[];
  fgSolid: string;
  mutedSolid: string;
  accentSolid: string;
};

type Traveller = {
  track: number;
  /** Distance along the track from the bottleneck. Negative = waiting. */
  s: number;
  speed: number;
  dash: boolean;
  len: number;
  seed: number;
};

type Pulse = {
  active: boolean;
  track: number;
  s: number;
  /** Speed while crossing the funnel, px/s. */
  fs: number;
  /** Time the fade started; 0 while travelling. */
  fading: number;
};

type Burst = { track: number; fireAt: number };

type Field = {
  width: number;
  height: number;
  mobile: boolean;
  plot: Rect;
  /** Text union: ink capped at MASK_ALPHA. */
  mask: Rect | null;
  /** Lead + buttons: body-size text at 4.5:1 leaves no headroom, so no ink. */
  clear: Rect | null;
  cy: number;
  y0: number;
  font: string;
  glyphW: number;
  chars: number;
  chars2: number;
  chars3: number;
  srcX: number;
  xB: number;
  xF: number;
  xEnd: number;
  tracks: number;
  mid: number;
  pitch: number;
  runN: number;
  stations: number;
  spread: number;
  breathe: boolean;
  cols: number;
  dotX0: number;
  barMax: number;
  barWMax: number;
  xBar: number;
  barRows: number;
  barTop: number;
  maxBarW: number;
  travellers: number;
  maxPulses: number;
};

function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function smoothstep(t: number) {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * (3 - 2 * c);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

function rgba(color: Rgba, alpha: number) {
  return `rgba(${color.r},${color.g},${color.b},${alpha})`;
}

function parseColor(input: string): Rgba | null {
  const s = input.trim();
  const hex = s.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = Number.parseInt(hex[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }

  const modern = s.match(
    /color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/i,
  );
  if (modern) {
    return {
      r: Math.round(Number(modern[1]) * 255),
      g: Math.round(Number(modern[2]) * 255),
      b: Math.round(Number(modern[3]) * 255),
      a: modern[4] != null ? Number(modern[4]) : 1,
    };
  }

  const rgb = s.match(
    /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)/i,
  );
  if (!rgb) return null;
  let a = 1;
  if (rgb[4] != null) {
    a = rgb[4].endsWith("%") ? Number.parseFloat(rgb[4]) / 100 : Number(rgb[4]);
  }
  return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]), a };
}

function readToken(token: string): Rgba | null {
  const probe = document.createElement("span");
  probe.style.cssText =
    "position:absolute;left:-9999px;top:0;pointer-events:none;";
  probe.style.color = `var(${token})`;
  document.body.appendChild(probe);
  const css = getComputedStyle(probe).color;
  probe.remove();
  return parseColor(css);
}

function readPalette(): Palette | null {
  const muted = readToken("--text-muted");
  const fg = readToken("--foreground");
  const accent = readToken("--brand-logo");
  const hue2 = readToken("--syn-number");
  if (!muted || !fg || !accent || !hue2) return null;
  return { muted, fg, accent, hue2 };
}

/** Style strings for every quantised alpha level, built once per palette. */
function buildStyles(palette: Palette): Styles {
  const fg: string[] = [];
  const muted: string[] = [];
  const accent: string[] = [];
  const hue2: string[] = [];
  for (let i = 0; i < LEVELS; i += 1) {
    const alpha = Math.round(i * ALPHA_STEP * 100) / 100;
    fg.push(rgba(palette.fg, alpha));
    muted.push(rgba(palette.muted, alpha));
    accent.push(rgba(palette.accent, alpha));
    hue2.push(rgba(palette.hue2, alpha));
  }
  return {
    fg,
    muted,
    accent,
    hue2,
    fgSolid: rgba(palette.fg, 1),
    mutedSolid: rgba(palette.muted, 1),
    accentSolid: rgba(palette.accent, 1),
  };
}

function levelOf(alpha: number) {
  const level = Math.round(alpha / ALPHA_STEP);
  return level < 0 ? 0 : level >= LEVELS ? LEVELS - 1 : level;
}

function edgeFade(k: number, mid: number) {
  if (mid <= 0) return 1;
  const t = Math.abs(k - mid) / mid;
  return 1 - 0.75 * smoothstep((t - 0.55) / 0.45);
}

function snapWidth(px: number, maxIdx: number) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i <= maxIdx; i += 1) {
    const d = Math.abs(BAR_WIDTHS[i] - px);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return BAR_WIDTHS[best];
}

function boxOf(el: HTMLElement, canvas: HTMLCanvasElement): Rect {
  const a = el.getBoundingClientRect();
  const b = canvas.getBoundingClientRect();
  return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
}

/**
 * Box of an element, narrowed horizontally to its rendered text. The h1 is a
 * 22ch block that centres shorter lines, so its element box overstates the ink.
 */
function textBoxOf(el: HTMLElement, canvas: HTMLCanvasElement, range: Range): Rect {
  const box = boxOf(el, canvas);
  const c = canvas.getBoundingClientRect();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let x0 = Infinity;
  let x1 = -Infinity;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent || n.textContent.trim() === "") continue;
    range.selectNodeContents(n);
    const rects = range.getClientRects();
    for (let i = 0; i < rects.length; i += 1) {
      const r = rects[i];
      if (r.width <= 0) continue;
      x0 = Math.min(x0, r.left - c.left);
      x1 = Math.max(x1, r.right - c.left);
    }
  }
  if (x1 <= x0) return box;
  return { x: x0 - 4, y: box.y, w: x1 - x0 + 8, h: box.h };
}

function union(rects: Rect[]): Rect | null {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const rect of rects) {
    if (rect.w <= 0 || rect.h <= 0) continue;
    x0 = Math.min(x0, rect.x);
    y0 = Math.min(y0, rect.y);
    x1 = Math.max(x1, rect.x + rect.w);
    y1 = Math.max(y1, rect.y + rect.h);
  }
  if (x1 <= x0 || y1 <= y0) return null;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

function rectsHit(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Distance outside rect. 0 when the point is inside. */
function distOutside(px: number, py: number, rect: Rect) {
  const dx = Math.max(rect.x - px, px - (rect.x + rect.w), 0);
  const dy = Math.max(rect.y - py, py - (rect.y + rect.h), 0);
  return Math.hypot(dx, dy);
}

function maskedAlpha(distance: number, base: number) {
  if (distance >= FEATHER || base <= MASK_ALPHA) return base;
  return MASK_ALPHA + (base - MASK_ALPHA) * (distance / FEATHER);
}

/** True when a box (grown by 1px for antialiasing) touches the rect at all. */
function touches(x0: number, y0: number, x1: number, y1: number, rect: Rect) {
  return (
    x1 + 1 > rect.x &&
    x0 - 1 < rect.x + rect.w &&
    y1 + 1 > rect.y &&
    y0 - 1 < rect.y + rect.h
  );
}

function subscribeReduced(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function readReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function makeTravellers(): Traveller[] {
  const pool: Traveller[] = [];
  for (let i = 0; i < TRAV_POOL; i += 1) {
    pool.push({
      track: 0,
      s: -1,
      speed: TRAV_MIN,
      dash: false,
      len: 6,
      seed: hash(i * 4.7 + 0.2),
    });
  }
  return pool;
}

function makePulses(): Pulse[] {
  const pool: Pulse[] = [];
  for (let i = 0; i < POOL_PULSES; i += 1) {
    pool.push({ active: false, track: 0, s: 0, fs: 120, fading: 0 });
  }
  return pool;
}

const labelClass =
  "pointer-events-none absolute font-jetbrains text-[11px] leading-[14px] font-normal whitespace-nowrap text-muted";

/**
 * Funnel behind the /home hero: binary source, fan of tracks, travellers and
 * beat-synced pulses into a soft barcode. One transparent canvas, pooled
 * typed-array state, 30fps. Accents follow Spray via --brand-logo / --syn-number.
 */
export function HeroFlowField() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inRef = useRef<HTMLSpanElement>(null);
  const outRef = useRef<HTMLSpanElement>(null);
  const reduced = useSyncExternalStore(subscribeReduced, readReduced, () => false);
  const { pair } = useSpray();
  const pairRef = useRef(pair);
  const bootedRef = useRef(false);

  useEffect(() => {
    pairRef.current = pair;
  }, [pair]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!root || !canvas || !ctx) return;

    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { alpha: true });
    if (!octx) return;

    const section = root.parentElement;
    const h1 = section?.querySelector("h1");
    const lead = section?.querySelector(":scope > p");
    const cta = lead?.nextElementSibling;
    if (
      !(h1 instanceof HTMLElement) ||
      !(lead instanceof HTMLElement) ||
      !(cta instanceof HTMLElement)
    ) {
      return;
    }

    /* Pools and lookups: allocated once per mount, only written afterwards. */
    const sx = new Float32Array(S_MAX);
    const wgt = new Float32Array(FUN);
    for (let i = 0; i < FUN; i += 1) wgt[i] = smoothstep(i / (FUN - 1));
    const ty: Float32Array[] = [];
    const fl: Float32Array[] = [];
    const lv: Uint8Array[] = [];
    for (let k = 0; k < TRACK_MAX; k += 1) {
      ty.push(new Float32Array(S_MAX));
      fl.push(new Float32Array(FUN));
      lv.push(new Uint8Array(S_MAX));
    }
    const rowY = new Float32Array(TRACK_MAX);
    const rowDy = new Float32Array(TRACK_MAX);
    const flen = new Float32Array(TRACK_MAX);
    const tot = new Float32Array(TRACK_MAX);
    const trav = makeTravellers();
    const pulses = makePulses();
    const bursts: Burst[] = [];
    for (let i = 0; i < BURST_SLOTS; i += 1) bursts.push({ track: -1, fireAt: -1 });

    const bits = new Uint8Array(CHAR_MAX);
    const bitNext = new Float32Array(CHAR_MAX);
    const bits2 = new Uint8Array(CHAR2_MAX);
    const bitNext2 = new Float32Array(CHAR2_MAX);
    const bits3 = new Uint8Array(CHAR2_MAX);
    const bitNext3 = new Float32Array(CHAR2_MAX);
    const srcY = new Float32Array(SRC_LINES);

    const dotN = TRACK_MAX * DOT_COLS_MAX;
    const dotTarget = new Uint8Array(dotN);
    const dotAlpha = new Float32Array(dotN);
    const dotNext = new Float32Array(dotN);
    const dotTau = new Float32Array(dotN);
    const dotLit = new Float32Array(dotN);
    const dotLv = new Uint8Array(dotN);

    const barCur = new Float32Array(BAR_POOL);
    const barTarget = new Float32Array(BAR_POOL);
    const barBase = new Uint8Array(BAR_POOL);
    const barTone = new Uint8Array(BAR_POOL);
    const barLvl = new Uint8Array(BAR_POOL);
    const barSettle = new Float32Array(BAR_POOL);
    const barForceUntil = new Float32Array(BAR_POOL);
    const barAccentUntil = new Float32Array(BAR_POOL);
    const barBucket = new Uint8Array(BAR_POOL);
    const usedTrack = new Uint8Array(LEVELS * 2);
    const usedDot = new Uint8Array(LEVELS * 2);
    const usedBar = new Uint8Array(BAR_LEVELS.length * 4);
    const pos = new Float32Array(2);
    const srcOff = document.createElement("canvas");
    const srcCtx = srcOff.getContext("2d", { alpha: true });
    if (!srcCtx) return;
    let srcDirty = true;
    let srcKey = "";

    let field: Field | null = null;
    let sig = "";
    let time = 0;
    let beatPeriod = BEAT_MIN + hash(0.11) * BEAT_SPAN;
    let nextBeat = 1.2;
    let beatCount = 0;
    let rippleAt = -1;
    let nodeFlash = -1;
    let palette = readPalette();
    let styles = palette ? buildStyles(palette) : null;
    let stylePair = pairRef.current;
    let raf = 0;
    let running = false;
    let onScreen = true;
    let lastDraw = 0;
    let cancelled = false;
    let active = false;
    let revealRaf = 0;
    let hasInside = false;

    const desktopMq = window.matchMedia(MD_QUERY);

    const syncColors = () => {
      if (styles && stylePair === pairRef.current) return;
      palette = readPalette();
      styles = palette ? buildStyles(palette) : null;
      stylePair = pairRef.current;
      srcDirty = true;
    };

    /* ---------- geometry ---------- */

    /** Rewrites every track's funnel samples, arc lengths, and row for `spread`. */
    const buildTracks = (f: Field, spread: number) => {
      for (let k = 0; k < f.tracks; k += 1) {
        const dy = rowDy[k] * spread;
        const row = f.cy + dy;
        rowY[k] = row;
        const arr = ty[k];
        const len = fl[k];
        let acc = 0;
        for (let i = 0; i < FUN; i += 1) {
          const y = f.cy + dy * wgt[i];
          arr[i] = y;
          if (i > 0) {
            const ddx = sx[i] - sx[i - 1];
            const ddy = y - arr[i - 1];
            acc += Math.sqrt(ddx * ddx + ddy * ddy);
          }
          len[i] = acc;
        }
        flen[k] = acc;
        for (let j = 1; j <= f.runN; j += 1) arr[FUN - 1 + j] = row;
        tot[k] = acc + (f.xEnd - f.xF);
      }
      f.spread = spread;
    };

    /** Position at distance `s` along track `k`, written to `pos`. */
    const posAt = (f: Field, k: number, s: number) => {
      const fk = flen[k];
      if (s >= fk) {
        pos[0] = Math.min(f.xEnd, f.xF + (s - fk));
        pos[1] = rowY[k];
        return;
      }
      const len = fl[k];
      const arr = ty[k];
      let i = 1;
      while (i < FUN - 1 && len[i] < s) i += 1;
      const l0 = len[i - 1];
      const span = len[i] - l0;
      const t = span > 0 ? (s - l0) / span : 0;
      pos[0] = sx[i - 1] + (sx[i] - sx[i - 1]) * t;
      pos[1] = arr[i - 1] + (arr[i] - arr[i - 1]) * t;
    };

    const recycleTraveller = (t: Traveller, salt: number) => {
      const s = t.seed;
      t.s = -hash(s * 17 + salt) * 60;
      t.speed = TRAV_MIN + hash(s * 19 + salt) * (TRAV_MAX - TRAV_MIN);
      t.dash = hash(s * 23 + salt) < 0.25;
      t.len = 6 + hash(s * 29 + salt) * 6;
    };

    const seedBits = (
      arr: Uint8Array,
      next: Float32Array,
      count: number,
      salt: number,
    ) => {
      for (let i = 0; i < count; i += 1) {
        arr[i] = hash(i * 5.3 + salt) > 0.5 ? 1 : 0;
        next[i] = time + 0.05 + hash(i * 7.9 + salt + 2) * 0.6;
      }
    };

    const seedField = (f: Field) => {
      seedBits(bits, bitNext, f.chars, 1);
      seedBits(bits2, bitNext2, f.chars2, 11);
      seedBits(bits3, bitNext3, f.chars3, 21);
      srcY[0] = f.cy;
      srcY[1] = f.cy - f.pitch * 3;
      srcY[2] = f.cy + f.pitch * 5;

      const dots = f.tracks * f.cols;
      for (let d = 0; d < dots; d += 1) {
        const r = hash(d * 3.1 + 5);
        const state = r < 0.2 ? 0 : r < 0.5 ? 1 : 2;
        dotTarget[d] = state;
        dotAlpha[d] =
          state === 0 ? 0 : state === 1 ? DOT_DIM_ALPHA : DOT_ALPHA;
        dotNext[d] = time + hash(d * 6.7 + 9) * 0.9;
        dotTau[d] = DOT_TAU_MIN + hash(d * 2.2 + 1) * DOT_TAU_SPAN;
        dotLit[d] = -1;
      }

      for (let j = 0; j < f.barRows; j += 1) {
        const idx = Math.floor(hash(j * 2.3 + 3) * (f.barWMax + 1));
        barBase[j] = idx;
        const w = BAR_WIDTHS[idx];
        barCur[j] = w;
        barTarget[j] = w;
        const toneRoll = hash(j * 4.1 + 6);
        barTone[j] = toneRoll < 0.1 ? 2 : toneRoll < 0.55 ? 0 : 1;
        barLvl[j] = Math.floor(hash(j * 5.9 + 8) * BAR_LEVELS.length);
        barSettle[j] = BAR_SETTLE_MIN + hash(j * 1.7 + 4) * BAR_SETTLE_SPAN;
        barForceUntil[j] = -1;
        barAccentUntil[j] = -1;
      }

      for (let i = 0; i < f.travellers; i += 1) {
        const t = trav[i];
        t.track = i % f.tracks;
        recycleTraveller(t, 0.37);
        t.s = hash(t.seed * 41 + 3) * tot[t.track];
      }
      for (let i = 0; i < pulses.length; i += 1) pulses[i].active = false;
      for (let i = 0; i < bursts.length; i += 1) {
        bursts[i].track = -1;
        bursts[i].fireAt = -1;
      }
      nodeFlash = -1;
      rippleAt = -1;
      beatPeriod = BEAT_MIN + hash(0.11) * BEAT_SPAN;
      nextBeat = time + 1.2;
      beatCount = 0;
      srcDirty = true;
    };

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width < 2 || height < 2) {
        field = null;
        return;
      }
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      off.width = canvas.width;
      off.height = canvas.height;

      const range = document.createRange();
      const h1Box = textBoxOf(h1, canvas, range);
      const leadBox = textBoxOf(lead, canvas, range);
      const ctaBox = boxOf(cta, canvas);
      const mask = union([h1Box, leadBox, ctaBox]);
      const clear = union([leadBox, ctaBox]);
      const mobile = !desktopMq.matches;

      const plot: Rect = mobile
        ? { x: 0, y: 0, w: width, h: Math.max(0, boxOf(h1, canvas).y - MOBILE_GAP) }
        : { x: 0, y: 0, w: width, h: height };
      if (plot.h < MIN_BAND) {
        field = null;
        return;
      }

      const inEl = inRef.current;
      const family = inEl ? getComputedStyle(inEl).fontFamily : "monospace";
      const font = `400 ${mobile ? 10 : 11}px ${family}`;
      ctx.font = font;
      const glyphW = Math.max(4, ctx.measureText("0").width);

      /* Tracks */
      let tracks: number;
      let pitch: number;
      let cy: number;
      let y0: number;
      if (mobile) {
        tracks = TRACKS_MOBILE;
        pitch = clamp((plot.h - 24) / (tracks - 1), 4, 8);
        cy = plot.h / 2;
        y0 = cy - ((tracks - 1) * pitch) / 2;
      } else {
        y0 = height * FIELD_TOP;
        const y1 = height * FIELD_BOT;
        const spanH = y1 - y0;
        tracks = clamp(Math.round(spanH / 11) + 1, 30, TRACK_MAX);
        pitch = clamp(spanH / (tracks - 1), 10, 12);
        cy = (y0 + y1) / 2;
      }
      const span = (tracks - 1) * pitch;

      /* Source string, bottleneck, funnel end */
      const srcX = mobile ? 10 : width * SOURCE_AT;
      const srcEnd = mobile
        ? width * 0.3
        : Math.min(width * 0.5, (mask ? mask.x : width) - SOURCE_GAP);
      let chars = Math.floor((srcEnd - srcX) / glyphW);
      if (mobile) chars = clamp(chars, 12, 16);
      else chars = chars < 8 ? 0 : Math.min(CHAR_MAX, chars);
      const chars2 = mobile || chars === 0 ? 0 : Math.min(CHAR2_MAX, Math.round(chars * 0.55));
      const chars3 = mobile || chars === 0 ? 0 : Math.min(CHAR2_MAX, Math.round(chars * 0.4));
      const xB = chars > 0 ? srcX + chars * glyphW + BOTTLENECK_GAP : width * 0.08;
      const xF = mobile
        ? Math.min(width * 0.55, xB + width * 0.22)
        : Math.max(width * FUNNEL_END_AT, xB + MIN_FUNNEL_LEN);

      /* Output: dot grid + barcode, anchored right of the text */
      const xR = width - EDGE;
      let cols = 0;
      let barMax = 0;
      let dotX0 = 0;
      if (mobile) {
        barMax = 16;
        cols = 3;
      } else {
        const outStart = Math.max(width * 0.72, (mask ? mask.x + mask.w : 0) + OUT_GAP);
        const room = xR - outStart;
        if (room >= NARROW_ROOM) {
          barMax = 32;
          cols = clamp(
            Math.floor((xR - barMax - DOT_GAP_TO_BARS - outStart) / DOT_PITCH),
            0,
            DOT_COLS_MAX,
          );
          dotX0 = outStart;
          if (cols < 4) cols = 0;
        } else {
          barMax = room >= 32 ? 24 : room >= 24 ? 16 : 0;
        }
      }
      const xBar = xR - barMax;
      const xEnd = barMax > 0 ? xBar - 4 : xR;
      if (mobile) {
        cols = clamp(Math.floor((xBar - 16 - (xF + 20)) / DOT_PITCH), 0, 3);
        dotX0 = xBar - 16 - cols * DOT_PITCH;
      }
      if (xEnd - xF < 40) {
        field = null;
        return;
      }
      let barWMax = -1;
      for (let i = 0; i < BAR_WIDTHS.length; i += 1) {
        if (BAR_WIDTHS[i] <= barMax) barWMax = i;
      }
      const barRows =
        barMax > 0 ? Math.min(BAR_POOL, Math.floor(span / BAR_PITCH) + 1) : 0;
      const barTop = cy - span / 2;
      const maxBarW = barWMax >= 0 ? BAR_WIDTHS[barWMax] : 0;

      const d = xF - xB;
      const x1 = xB + BEZIER_PULL * d;
      const x2 = xF - BEZIER_PULL * d;
      for (let i = 0; i < FUN; i += 1) {
        const t = i / (FUN - 1);
        const u = 1 - t;
        sx[i] = u * u * u * xB + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * xF;
      }
      const runLen = xEnd - xF;
      const runN = clamp(Math.ceil(runLen / 8), 1, RUN_MAX);
      for (let j = 1; j <= runN; j += 1) sx[FUN - 1 + j] = xF + (runLen * j) / runN;
      for (let k = 0; k < tracks; k += 1) rowDy[k] = (k - (tracks - 1) / 2) * pitch;

      const next: Field = {
        width,
        height,
        mobile,
        plot,
        mask,
        clear,
        cy,
        y0,
        font,
        glyphW,
        chars,
        chars2,
        chars3,
        srcX,
        xB,
        xF,
        xEnd,
        tracks,
        mid: (tracks - 1) / 2,
        pitch,
        runN,
        stations: FUN + runN,
        spread: 1,
        breathe: !mobile,
        cols,
        dotX0,
        barMax,
        barWMax,
        xBar,
        barRows,
        barTop,
        maxBarW,
        travellers: mobile ? TRAVELLERS_MOBILE : Math.min(TRAV_POOL, tracks * 2),
        maxPulses: mobile ? 1 : POOL_PULSES,
      };
      buildTracks(next, 1);
      srcY[0] = next.cy;
      srcY[1] = next.cy - next.pitch * 3;
      srcY[2] = next.cy + next.pitch * 5;

      const nextSig = `${mobile ? "m" : "d"}|${tracks}|${chars}|${chars2}|${cols}|${barRows}|${barWMax}|${next.travellers}`;
      const reseed = nextSig !== sig || !field;
      field = next;
      if (reseed) {
        sig = nextSig;
        seedField(next);
      }

      /* Labels */
      const canvasBox = canvas.getBoundingClientRect();
      const rel = (el: HTMLElement): Rect => {
        const r = el.getBoundingClientRect();
        return { x: r.left - canvasBox.left, y: r.top - canvasBox.top, w: r.width, h: r.height };
      };
      const blocks = [boxOf(h1, canvas), boxOf(lead, canvas), ctaBox];
      const srcRect: Rect | null =
        chars > 0
          ? {
              x: srcX,
              y: Math.min(srcY[0], srcY[1], srcY[2]) - 7,
              w: chars * glyphW,
              h: Math.abs(srcY[2] - srcY[1]) + 14,
            }
          : null;
      const barsRect: Rect | null =
        barMax > 0 && barRows > 0
          ? {
              x: xBar,
              y: barTop - BAR_H / 2,
              w: barMax,
              h: (barRows - 1) * BAR_PITCH + BAR_H,
            }
          : null;
      const inLabel = inRef.current;
      if (inLabel) {
        const r = rel(inLabel);
        const grown: Rect = { x: r.x, y: r.y - LABEL_GAP, w: r.w, h: r.h + LABEL_GAP * 2 };
        const hit =
          blocks.some((b) => rectsHit(r, b)) || (srcRect != null && rectsHit(grown, srcRect));
        inLabel.style.visibility = hit ? "hidden" : "visible";
      }
      const outLabel = outRef.current;
      if (outLabel) {
        const r = rel(outLabel);
        const grown: Rect = {
          x: r.x - LABEL_GAP_BARS,
          y: r.y - LABEL_GAP_BARS,
          w: r.w + LABEL_GAP_BARS * 2,
          h: r.h + LABEL_GAP_BARS * 2,
        };
        const hit =
          blocks.some((b) => rectsHit(r, b)) || (barsRect != null && rectsHit(grown, barsRect));
        outLabel.style.visibility = hit ? "hidden" : "visible";
      }
    };

    /* ---------- simulation ---------- */

    const pushBar = (f: Field, j0: number, strength: number) => {
      if (f.barRows <= 0 || f.barWMax < 0) return;
      for (let d = 0; d < FALL_OFF.length; d += 1) {
        const amp = strength * FALL_OFF[d];
        if (amp < 0.05) continue;
        for (const sign of d === 0 ? [0] : [-1, 1]) {
          const j = j0 + sign * d;
          if (j < 0 || j >= f.barRows) continue;
          const w = snapWidth(f.maxBarW * amp, f.barWMax);
          if (w >= barTarget[j]) barTarget[j] = w;
          barForceUntil[j] = time + BAR_FORCE_HOLD;
          if (d === 0) barAccentUntil[j] = time + BAR_FORCE_HOLD;
        }
      }
    };

    const arrive = (f: Field, k: number) => {
      if (f.cols > 0) {
        const idx = k * f.cols + f.cols - 1;
        dotLit[idx] = time;
      }
      if (f.barRows > 0) {
        const j0 = clamp(
          Math.round((rowY[k] - f.barTop) / BAR_PITCH),
          0,
          f.barRows - 1,
        );
        pushBar(f, j0, 1);
      }
    };

    const spawnPulse = (f: Field, track: number) => {
      let live = 0;
      let slot = -1;
      for (let i = 0; i < pulses.length; i += 1) {
        if (pulses[i].active) live += 1;
        else if (slot < 0) slot = i;
      }
      if (slot < 0 || live >= f.maxPulses) return;
      const p = pulses[slot];
      p.active = true;
      p.track = clamp(track, 0, f.tracks - 1);
      p.s = 0;
      p.fs = flen[p.track] / (CROSS_MIN + hash(time * 4.7 + track) * (CROSS_MAX - CROSS_MIN));
      p.fading = 0;
      nodeFlash = time;
    };

    const scheduleBurst = (f: Field) => {
      const n = f.mobile ? 1 : 1 + Math.floor(hash(time * 2.9) * 3);
      let delay = 0;
      for (let i = 0; i < BURST_SLOTS; i += 1) {
        if (i >= n) {
          bursts[i].track = -1;
          bursts[i].fireAt = -1;
          continue;
        }
        bursts[i].track = Math.min(
          f.tracks - 1,
          Math.floor(hash(time * 3.1 + i * 7.7) * f.tracks),
        );
        bursts[i].fireAt = time + delay;
        delay += 0.08 + hash(time * 5.1 + i) * 0.07;
      }
    };

    const flipLine = (
      arr: Uint8Array,
      next: Float32Array,
      count: number,
      rippleOff: number,
      salt: number,
    ) => {
      for (let i = 0; i < count; i += 1) {
        if (rippleAt >= 0) {
          const due = rippleAt + rippleOff + (count - 1 - i) * RIPPLE_STEP;
          if (time >= due && time - due < RIPPLE_STEP + 0.02) {
            arr[i] ^= 1;
            next[i] = time + BIT_MIN + hash(time * 17.3 + i * 3.7 + salt) * BIT_SPAN;
            srcDirty = true;
            continue;
          }
        }
        if (time >= next[i]) {
          arr[i] ^= 1;
          next[i] = time + BIT_MIN + hash(time * 17.3 + i * 3.7 + salt) * BIT_SPAN;
          srcDirty = true;
        }
      }
    };

    const update = (f: Field, dt: number, anim: boolean) => {
      time += dt;

      for (let i = 0; i < f.travellers; i += 1) {
        const t = trav[i];
        const k = t.track;
        const fk = flen[k];
        let boost: number;
        if (t.s >= 0 && t.s < fk) {
          const u = clamp(t.s / fk, 0, 1);
          const s = Math.sin(Math.PI * u);
          boost = 0.55 + 0.9 * s * s;
        } else {
          boost = 1 + 0.08 * Math.sin(time * 1.7 + t.seed * 20);
        }
        t.s += t.speed * boost * dt;
        if (t.s >= tot[k]) recycleTraveller(t, time);
      }

      /* Soft dots always ease toward target (needed for still settle too). */
      const dots = f.tracks * f.cols;
      for (let d = 0; d < dots; d += 1) {
        const state = dotTarget[d];
        let target = state === 0 ? 0 : state === 1 ? DOT_DIM_ALPHA : DOT_ALPHA;
        const litAt = dotLit[d];
        if (litAt >= 0) {
          const age = ((time - litAt) * 1000) / LIT_MS;
          if (age < 1) {
            const ease = (1 - age) * (1 - age);
            target = lerp(target, DOT_LIT_ALPHA, ease);
          }
        }
        const k = 1 - Math.exp(-dt / Math.max(0.05, dotTau[d]));
        dotAlpha[d] += (target - dotAlpha[d]) * k;
      }

      /* Fluid bars always ease. */
      for (let j = 0; j < f.barRows; j += 1) {
        const k = 1 - Math.exp(-dt / Math.max(0.05, barSettle[j]));
        barCur[j] += (barTarget[j] - barCur[j]) * k;
      }

      if (!anim) return;

      if (f.breathe) {
        const spread = 1 + BREATHE * Math.sin((time * Math.PI * 2) / BREATHE_PERIOD);
        if (Math.abs(spread - f.spread) > 0.001) buildTracks(f, spread);
      }

      /* Global beat */
      if (time >= nextBeat) {
        scheduleBurst(f);
        rippleAt = time;
        beatCount += 1;
        if (beatCount % 8 === 0) {
          beatPeriod = clamp(
            beatPeriod * (0.95 + hash(time * 1.3) * 0.1),
            BEAT_MIN,
            BEAT_MIN + BEAT_SPAN,
          );
        }
        nextBeat = time + beatPeriod;
      }

      for (let i = 0; i < BURST_SLOTS; i += 1) {
        const b = bursts[i];
        if (b.track < 0 || b.fireAt < 0) continue;
        if (time >= b.fireAt) {
          spawnPulse(f, b.track);
          b.track = -1;
          b.fireAt = -1;
        }
      }

      flipLine(bits, bitNext, f.chars, 0, 1);
      flipLine(bits2, bitNext2, f.chars2, RIPPLE2_OFF, 11);
      flipLine(bits3, bitNext3, f.chars3, RIPPLE2_OFF * 2, 21);

      for (let d = 0; d < dots; d += 1) {
        if (time >= dotNext[d]) {
          const r = hash(time * 11.1 + d * 1.7);
          dotTarget[d] = r < 0.2 ? 0 : r < 0.5 ? 1 : 2;
          dotNext[d] =
            time + DOT_TIMER_MIN + hash(time * 5.3 + d * 2.9) * DOT_TIMER_SPAN;
        }
      }

      /* Idle wave + force decay for bars */
      const wave = Math.sin((time * Math.PI * 2) / IDLE_WAVE_T);
      for (let j = 0; j < f.barRows; j += 1) {
        if (barForceUntil[j] > time) continue;
        const base = BAR_WIDTHS[barBase[j]];
        const idle =
          base +
          IDLE_WAVE_AMP * Math.sin(wave * Math.PI + j * 0.35 + hash(j * 0.2) * 2);
        barTarget[j] = snapWidth(idle, f.barWMax);
        /* Occasionally re-roll base width on beat-ish cadence */
        if (rippleAt >= 0 && time - rippleAt < 0.05 && hash(time * 9 + j) > 0.92) {
          barBase[j] = Math.floor(hash(time * 13.7 + j * 2.1) * (f.barWMax + 1));
          barTone[j] =
            hash(time * 7.9 + j * 4.3) < 0.1
              ? 2
              : hash(time * 3.3 + j) < 0.5
                ? 0
                : 1;
          barLvl[j] = Math.floor(hash(time * 3.3 + j * 6.1) * BAR_LEVELS.length);
        }
      }

      for (let i = 0; i < pulses.length; i += 1) {
        const p = pulses[i];
        if (!p.active) continue;
        if (p.fading > 0) {
          if ((time - p.fading) * 1000 >= PULSE_FADE_MS) p.active = false;
          continue;
        }
        const k = p.track;
        p.s += (p.s < flen[k] ? p.fs : PULSE_RUN_SPEED) * dt;
        if (p.s >= tot[k]) {
          p.s = tot[k];
          p.fading = time;
          arrive(f, k);
        }
      }
    };

    /* ---------- drawing ---------- */

    const solidFor = (tone: number) => {
      if (!styles) return "";
      if (tone === 2) return styles.accentSolid;
      if (tone === 1) return styles.mutedSolid;
      return styles.fgSolid;
    };

    const setFor = (tone: number) => {
      if (!styles) return styles!.fg;
      if (tone === 2) return styles.accent;
      if (tone === 3) return styles.hue2;
      if (tone === 1) return styles.muted;
      return styles.fg;
    };

    /** Fill a small rect, routing masked ink to the offscreen stamp. tone: 0 fg, 1 muted, 2 accent */
    const mark = (
      f: Field,
      x: number,
      y: number,
      w: number,
      h: number,
      tone: number,
      alpha: number,
    ) => {
      if (!styles) return;
      const m = f.mask;
      if (m) {
        if (touches(x, y, x + w, y + h, m)) {
          octx.fillStyle = solidFor(tone);
          octx.fillRect(x, y, w, h);
          hasInside = true;
          return;
        }
        const d = distOutside(x + w / 2, y + h / 2, m);
        if (d < FEATHER) alpha = maskedAlpha(d, alpha);
      }
      ctx.fillStyle = setFor(tone)[levelOf(alpha)];
      ctx.fillRect(x, y, w, h);
    };

    const dash = (
      f: Field,
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      tone: number,
      alpha: number,
    ) => {
      if (!styles) return;
      let context = ctx;
      let style = "";
      const m = f.mask;
      if (m) {
        if (touches(Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1), m)) {
          context = octx;
          style = solidFor(tone);
          hasInside = true;
        } else {
          const d = distOutside((x0 + x1) / 2, (y0 + y1) / 2, m);
          if (d < FEATHER) alpha = maskedAlpha(d, alpha);
        }
      }
      if (context === ctx) style = setFor(tone)[levelOf(alpha)];
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.strokeStyle = style;
      context.lineWidth = 1;
      context.stroke();
    };

    const strokeTone = (
      context: CanvasRenderingContext2D,
      f: Field,
      tone: number,
      level: number,
      style: string,
    ) => {
      const lo = tone === 0 ? 0 : FUN - 1;
      const hi = tone === 0 ? FUN - 1 : f.stations - 1;
      context.beginPath();
      for (let k = 0; k < f.tracks; k += 1) {
        const arr = ty[k];
        const lvs = lv[k];
        let pen = false;
        for (let i = lo; i < hi; i += 1) {
          if (lvs[i] !== level) {
            pen = false;
            continue;
          }
          if (!pen) context.moveTo(sx[i], arr[i]);
          context.lineTo(sx[i + 1], arr[i + 1]);
          pen = true;
        }
      }
      context.strokeStyle = style;
      context.lineWidth = 1;
      context.stroke();
    };

    const drawTracks = (f: Field) => {
      if (!styles) return;
      usedTrack.fill(0);
      const m = f.mask;
      const segs = f.stations - 1;
      let inside = false;

      // Fast path: whole-track strokes when clear of the text union.
      for (let k = 0; k < f.tracks; k += 1) {
        const arr = ty[k];
        const fade = edgeFade(k, f.mid);
        const edge = f.mid > 0 ? Math.abs(k - f.mid) / f.mid : 0;
        const funnelAlpha =
          (FUNNEL_ALPHA - (FUNNEL_ALPHA - FUNNEL_ALPHA_OUTER) * edge) * fade;
        const runAlpha = RUN_ALPHA * fade;
        let hitsMask = false;
        if (m) {
          for (let i = 0; i < segs; i += 1) {
            const ya = arr[i];
            const yb = arr[i + 1];
            if (touches(sx[i], Math.min(ya, yb), sx[i + 1], Math.max(ya, yb), m)) {
              hitsMask = true;
              break;
            }
          }
        }
        if (!hitsMask) {
          const lvs = lv[k];
          for (let i = 0; i < segs; i += 1) lvs[i] = LEVEL_SKIP;
          ctx.beginPath();
          ctx.moveTo(sx[0], arr[0]);
          for (let i = 1; i < FUN; i += 1) ctx.lineTo(sx[i], arr[i]);
          ctx.strokeStyle = styles.muted[levelOf(funnelAlpha)];
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(sx[FUN - 1], arr[FUN - 1]);
          for (let i = FUN; i < f.stations; i += 1) ctx.lineTo(sx[i], arr[i]);
          ctx.strokeStyle = styles.fg[levelOf(runAlpha)];
          ctx.lineWidth = 1;
          ctx.stroke();
          continue;
        }
        // Masked track: per-segment buckets for the stamp.
        const lvs = lv[k];
        for (let i = 0; i < segs; i += 1) {
          const funnel = i < FUN - 1;
          let alpha = funnel ? funnelAlpha : runAlpha;
          const ya = arr[i];
          const yb = arr[i + 1];
          if (m && touches(sx[i], Math.min(ya, yb), sx[i + 1], Math.max(ya, yb), m)) {
            lvs[i] = LEVEL_INSIDE;
            inside = true;
            continue;
          }
          if (m) {
            const d = distOutside((sx[i] + sx[i + 1]) / 2, (ya + yb) / 2, m);
            if (d < FEATHER) alpha = maskedAlpha(d, alpha);
          }
          const level = levelOf(alpha);
          lvs[i] = level;
          usedTrack[(funnel ? 0 : LEVELS) + level] = 1;
        }
      }
      for (let level = 0; level < LEVELS; level += 1) {
        if (usedTrack[level]) strokeTone(ctx, f, 0, level, styles.muted[level]);
      }
      for (let level = 0; level < LEVELS; level += 1) {
        if (usedTrack[LEVELS + level]) strokeTone(ctx, f, 1, level, styles.fg[level]);
      }
      if (inside) {
        strokeTone(octx, f, 0, LEVEL_INSIDE, styles.mutedSolid);
        strokeTone(octx, f, 1, LEVEL_INSIDE, styles.fgSolid);
        hasInside = true;
      }
    };

    const drawSource = (f: Field) => {
      if (!styles || f.chars <= 0 || !srcCtx) return;
      const key = `${f.width}|${f.chars}|${f.chars2}|${f.chars3}|${stylePair.bg}|${stylePair.text}`;
      if (srcDirty || key !== srcKey) {
        srcKey = key;
        srcDirty = false;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        srcOff.width = Math.max(1, Math.floor(f.width * dpr));
        srcOff.height = Math.max(1, Math.floor(f.height * dpr));
        srcCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        srcCtx.clearRect(0, 0, f.width, f.height);
        srcCtx.font = f.font;
        srcCtx.textBaseline = "middle";
        srcCtx.textAlign = "left";
        const paint = (arr: Uint8Array, count: number, y: number, alpha: number) => {
          if (count <= 0) return;
          srcCtx.fillStyle = styles!.muted[levelOf(alpha)];
          for (let i = 0; i < count; i += 1) {
            srcCtx.fillText(GLYPH[arr[i]], f.srcX + i * f.glyphW, y);
          }
        };
        paint(bits, f.chars, srcY[0], SOURCE_ALPHA);
        paint(bits2, f.chars2, srcY[1], SOURCE2_ALPHA);
        paint(bits3, f.chars3, srcY[2], SOURCE2_ALPHA);
      }
      ctx.drawImage(srcOff, 0, 0, f.width, f.height);
    };

    const drawDots = (f: Field) => {
      if (!styles || f.cols <= 0) return;
      usedDot.fill(0);
      const dots = f.tracks * f.cols;
      for (let d = 0; d < dots; d += 1) {
        let alpha = dotAlpha[d];
        const litAt = dotLit[d];
        let accent = false;
        if (litAt >= 0) {
          const age = ((time - litAt) * 1000) / LIT_MS;
          if (age < 1) {
            accent = true;
            const ease = (1 - age) * (1 - age);
            alpha = lerp(alpha, DOT_LIT_ALPHA, ease);
          }
        }
        const level = alpha > 0.005 ? levelOf(alpha) : 0;
        dotLv[d] = accent ? LEVELS + level : level;
        if (level > 0) usedDot[accent ? LEVELS + level : level] = 1;
      }
      for (let level = 1; level < LEVELS; level += 1) {
        if (!usedDot[level]) continue;
        ctx.beginPath();
        for (let d = 0; d < dots; d += 1) {
          if (dotLv[d] !== level) continue;
          const k = (d / f.cols) | 0;
          const c = d - k * f.cols;
          const x = f.dotX0 + c * DOT_PITCH + DOT_RADIUS;
          const y = rowY[k];
          ctx.moveTo(x + DOT_RADIUS, y);
          ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
        }
        ctx.fillStyle = styles.fg[level];
        ctx.fill();
      }
      for (let level = 1; level < LEVELS; level += 1) {
        if (!usedDot[LEVELS + level]) continue;
        ctx.beginPath();
        for (let d = 0; d < dots; d += 1) {
          if (dotLv[d] !== LEVELS + level) continue;
          const k = (d / f.cols) | 0;
          const c = d - k * f.cols;
          const x = f.dotX0 + c * DOT_PITCH + DOT_RADIUS;
          const y = rowY[k];
          ctx.moveTo(x + DOT_RADIUS, y);
          ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
        }
        ctx.fillStyle = styles.accent[level];
        ctx.fill();
      }
    };

    const drawBars = (f: Field) => {
      if (!styles || f.barRows <= 0) return;
      // Buckets: 0=fg, 1=muted, 2=hue2, 3=accent (hit beat)
      usedBar.fill(0);
      for (let j = 0; j < f.barRows; j += 1) {
        const accent = barAccentUntil[j] > time;
        const tone = accent ? 3 : barTone[j];
        let lvl = accent ? BAR_LEVELS.length - 1 : barLvl[j];
        if (tone === 2) {
          // hue2 rests at low alpha: map to first two BAR_LEVELS
          lvl = hash(j * 1.1) < 0.5 ? 0 : 1;
        }
        const b = tone * BAR_LEVELS.length + lvl;
        barBucket[j] = b;
        usedBar[b] = 1;
      }
      for (let b = 0; b < usedBar.length; b += 1) {
        if (!usedBar[b]) continue;
        const tone = (b / BAR_LEVELS.length) | 0;
        const lvl = b - tone * BAR_LEVELS.length;
        ctx.beginPath();
        for (let j = 0; j < f.barRows; j += 1) {
          if (barBucket[j] !== b) continue;
          ctx.rect(
            f.xBar,
            f.barTop + j * BAR_PITCH - BAR_H / 2,
            Math.max(1, barCur[j]),
            BAR_H,
          );
        }
        const set =
          tone === 3
            ? styles.accent
            : tone === 2
              ? styles.hue2
              : tone === 1
                ? styles.muted
                : styles.fg;
        const alpha =
          tone === 2
            ? levelOf(HUE2_ALPHA_MIN + (HUE2_ALPHA_MAX - HUE2_ALPHA_MIN) * (lvl / 4))
            : BAR_LEVELS[lvl];
        ctx.fillStyle = set[alpha];
        ctx.fill();
      }
    };

    const drawTravellers = (f: Field) => {
      for (let i = 0; i < f.travellers; i += 1) {
        const t = trav[i];
        if (t.s < 0) continue;
        const k = t.track;
        const funnel = t.s < flen[k];
        const alpha = (funnel ? TRAV_FUNNEL_ALPHA : TRAV_RUN_ALPHA) * edgeFade(k, f.mid);
        posAt(f, k, t.s);
        const x0 = pos[0];
        const y0 = pos[1];
        if (!t.dash) {
          mark(f, x0 - 0.75, y0 - 0.75, 1.5, 1.5, funnel ? 1 : 0, alpha);
          continue;
        }
        posAt(f, k, t.s + t.len);
        dash(f, x0, y0, pos[0], pos[1], funnel ? 1 : 0, alpha);
      }
    };

    const drawPulses = (f: Field) => {
      for (let i = 0; i < pulses.length; i += 1) {
        const p = pulses[i];
        if (!p.active) continue;
        const fade = p.fading > 0 ? 1 - ((time - p.fading) * 1000) / PULSE_FADE_MS : 1;
        if (fade <= 0) continue;
        for (let j = 0; j < TAIL_OFF.length; j += 1) {
          const s = p.s - TAIL_OFF[j];
          if (s < 0) continue;
          posAt(f, p.track, s);
          const size = j === 0 ? 3 : 2;
          mark(
            f,
            pos[0] - size / 2,
            pos[1] - size / 2,
            size,
            size,
            2,
            PULSE_ALPHA * TAIL_ALPHA[j] * fade,
          );
        }
      }
    };

    const drawNode = (f: Field) => {
      const flash = nodeFlash >= 0 && (time - nodeFlash) * 1000 < NODE_FLASH_MS;
      mark(f, f.xB - 1, f.cy - 1, 2, 2, 2, flash ? NODE_FLASH_ALPHA : NODE_ALPHA);
    };

    const render = (f: Field) => {
      if (!styles) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, f.width, f.height);
      octx.clearRect(0, 0, f.width, f.height);
      ctx.globalAlpha = 1;
      hasInside = false;

      drawTracks(f);
      drawBars(f);
      drawDots(f);
      drawSource(f);
      drawTravellers(f);
      drawPulses(f);
      drawNode(f);

      if (hasInside) {
        ctx.save();
        ctx.globalAlpha = MASK_ALPHA;
        ctx.drawImage(off, 0, 0, f.width, f.height);
        ctx.restore();
      }
      if (f.clear) {
        ctx.clearRect(f.clear.x - 1, f.clear.y - 1, f.clear.w + 2, f.clear.h + 2);
      }
    };

    /* ---------- loop ---------- */

    const loop = (now: number) => {
      if (!onScreen || document.visibilityState !== "visible") {
        running = false;
        lastDraw = 0;
        return;
      }
      raf = window.requestAnimationFrame(loop);
      if (lastDraw !== 0 && now - lastDraw < FRAME_MS) return;
      const dt = lastDraw === 0 ? 1 / 30 : Math.min(0.05, (now - lastDraw) / 1000);
      lastDraw = now;
      syncColors();
      const f = field;
      if (!f || !styles) return;
      update(f, dt, true);
      render(f);
    };

    const kick = () => {
      if (!active || reduced || running) return;
      if (!onScreen || document.visibilityState !== "visible") return;
      running = true;
      lastDraw = 0;
      raf = window.requestAnimationFrame(loop);
    };

    /** One composed frame: funnel, tracks, settled dots and bars, frozen string, no pulses. */
    const drawStill = () => {
      syncColors();
      const f = field;
      if (!f || !styles) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      time = 5;
      buildTracks(f, 1);
      for (let i = 0; i < pulses.length; i += 1) pulses[i].active = false;
      for (let i = 0; i < bursts.length; i += 1) {
        bursts[i].track = -1;
        bursts[i].fireAt = -1;
      }
      nodeFlash = -1;
      rippleAt = -1;
      for (let i = 0; i < STILL_STEPS; i += 1) update(f, 1 / 30, false);
      render(f);
    };

    const start = () => {
      layout();
      if (reduced) {
        drawStill();
        return;
      }
      kick();
    };

    const stop = () => {
      running = false;
      window.cancelAnimationFrame(raf);
    };

    const conceal = () => {
      window.cancelAnimationFrame(revealRaf);
      root.style.transition = "none";
      root.style.opacity = "0";
    };

    const reveal = () => {
      window.cancelAnimationFrame(revealRaf);
      if (reduced) {
        root.style.transition = "none";
        root.style.opacity = "1";
        return;
      }
      root.style.transition = "none";
      root.style.opacity = "0";
      revealRaf = window.requestAnimationFrame(() => {
        if (cancelled || !active) return;
        root.style.transition = "opacity 400ms ease-out";
        root.style.opacity = "1";
      });
    };

    const onResize = () => {
      layout();
      if (reduced && active) drawStill();
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(root);
    ro.observe(h1);
    ro.observe(lead);
    ro.observe(cta);

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry?.isIntersecting ?? false;
        if (onScreen) kick();
        else lastDraw = 0;
      },
      { threshold: 0 },
    );
    io.observe(root);

    const onVisibility = () => {
      if (document.visibilityState === "visible") kick();
      else lastDraw = 0;
    };
    document.addEventListener("visibilitychange", onVisibility);
    desktopMq.addEventListener("change", onResize);
    window.addEventListener("resize", onResize);

    void document.fonts?.ready.then(() => {
      if (!cancelled) onResize();
    });

    /* ---------- boot gate ---------- */

    const stage = root
      .closest("main")
      ?.querySelector<HTMLElement>("[data-ide-boot]");
    let grace = 0;

    const go = () => {
      if (cancelled || active) return;
      active = true;
      bootedRef.current = true;
      start();
      reveal();
    };

    const halt = () => {
      window.clearTimeout(grace);
      active = false;
      stop();
      conceal();
    };

    const phaseNow = () => stage?.getAttribute("data-ide-boot") ?? "done";

    const arm = () => {
      window.clearTimeout(grace);
      grace = window.setTimeout(
        () => {
          if (!cancelled && phaseNow() === "done") go();
        },
        bootedRef.current ? 0 : BOOT_GRACE_MS,
      );
    };

    const onBoot = () => {
      if (phaseNow() !== "done") halt();
      else arm();
    };

    const bootObserver = new MutationObserver(onBoot);
    if (stage) {
      bootObserver.observe(stage, {
        attributes: true,
        attributeFilter: ["data-ide-boot"],
      });
    }
    arm();

    return () => {
      cancelled = true;
      window.clearTimeout(grace);
      stop();
      bootObserver.disconnect();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      desktopMq.removeEventListener("change", onResize);
      window.removeEventListener("resize", onResize);
    };
  }, [reduced]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-6 inset-y-0 z-[-1] opacity-0"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <span ref={inRef} className={cn(labelClass, "top-2 left-2")}>
        {hero.flowIn}
      </span>
      <span ref={outRef} className={cn(labelClass, "top-2 right-2")}>
        {hero.flowOut}
      </span>
    </div>
  );
}
