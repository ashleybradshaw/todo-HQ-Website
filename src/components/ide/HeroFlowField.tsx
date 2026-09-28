"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useSpray } from "@/components/SprayProvider";
import { homePage } from "@/content/pages/home";
import { cn } from "@/lib/cn";

const { hero } = homePage;

/* Alpha budget */
const FAR_ALPHA = 0.06;
const INPUT_ALPHA = 0.14;
const PATH_ALPHA = 0.1;
const PATH_MERGE_ALPHA = 0.18;
const PULSE_ALPHA = 0.3;
const PULSE_HALO = 0.08;
const NODE_ALPHA = 0.16;
const NODE_LIT_ALPHA = 0.35;
/** Cap for everything behind the measured h1, lead, and buttons. */
const MASK_ALPHA = 0.04;
const FEATHER = 20;

/* Geometry */
const INPUT_AT = 0.3;
const MERGE_MIN_AT = 0.58;
const MERGE_GAP = 32;
/** Room right of the merges for a 3-row matrix and the trunk exits. */
const OUTPUT_ROOM = 150;
/** Room when the matrix shrinks to 2 rows. */
const OUTPUT_ROOM_SMALL = 100;
const MERGE_BLEND = 40;
const MATRIX_GAP = 48;
const MATRIX_GAP_MOBILE = 32;
const MOBILE_MERGE_AT = 0.62;
const PITCH = 16;
const NODE = 2;
const MAX_COLS = 6;
const MOBILE_DOTS = 5;
const MERGE_SPREAD = 28;
const STATION = 6;
const EDGE = 12;
const MOBILE_GAP = 8;
const MIN_BAND = 36;

/* Motion (px/s). Path drift + wobble stay under ~6px/s at any point. */
const FLOW_MIN = 20;
const FLOW_MAX = 30;
const TRANSFORM_BOOST = 0.4;
const FAR_FACTOR = 0.4;
const PULSE_SPEED = 120;
const DRIFT_MAX = 14;
const DRIFT_PERIOD_MIN = 40;
const DRIFT_PERIOD_MAX = 60;
const WOBBLE_1 = 7;
const WOBBLE_2 = 3.5;
const WOBBLE_W1_MIN = 0.18;
const WOBBLE_W1_MAX = 0.25;
const WOBBLE_W2_MIN = 0.2;
const WOBBLE_W2_MAX = 0.3;
const BOW = 14;
const BOW_PERIOD_MIN = 45;
const BOW_PERIOD_MAX = 60;

/* Pulses */
const PULSE_GAP_MIN = 2;
const PULSE_GAP_MAX = 5;
const PULSE_SPAWN_AT = 0.12;
const HALO_HALF = 20;
const LIT_MS = 600;
const PULSE_FADE_MS = 160;
const CHILD_SPEED = 0.85;
const CHILD_OFFSET = 2;

/* Pools */
const POOL_PARTICLES = 400;
const POOL_FAR = 120;
const POOL_PULSES = 3;
const POOL_NODES = 4 * MAX_COLS;
const PATHS_DESKTOP = 6;
const PATHS_MOBILE = 2;
const BUDGET_DIV = 1650;
const BUDGET_MIN = 180;
const BUDGET_MAX = 360;
const BUDGET_MOBILE = 60;
const FAR_SHARE = 0.25;
const FRAG_SHARE = 0.3;

const ALPHA_STEP = 0.02;
/** 0 … 0.50 in 0.02 steps. */
const LEVELS = 26;
const LEVEL_INSIDE = 255;
const LEVEL_SKIP = 254;

const FRAME_MS = 1000 / 30;
const BOOT_GRACE_MS = 100;
const MD_QUERY = "(min-width: 768px)";
const STILL_STEPS = 150;

type Rgba = { r: number; g: number; b: number; a: number };

type Rect = { x: number; y: number; w: number; h: number };

type Palette = { muted: Rgba; fg: Rgba };

type Styles = {
  fg: string[];
  muted: string[];
  fgSolid: string;
  mutedSolid: string;
};

type PathParams = {
  spread: number;
  driftW: number;
  driftPhi: number;
  w1: number;
  w2: number;
  phi1: number;
  phi2: number;
  bowW: number;
  bowPhi: number;
  group: number;
  leader: boolean;
};

type Particle = {
  path: number;
  x: number;
  lat: number;
  speed: number;
  frag: boolean;
  len: number;
  size: number;
  seed: number;
};

type Far = { x: number; y: number; speed: number; seed: number };

type Pulse = {
  active: boolean;
  path: number;
  x: number;
  speed: number;
  lat: number;
  child: boolean;
  /** Time the fade started; 0 while travelling. */
  fading: number;
};

type MatrixNode = { litAt: number };

type Field = {
  width: number;
  height: number;
  mobile: boolean;
  plot: Rect;
  /** Union of h1, lead, buttons: ink capped at MASK_ALPHA. */
  mask: Rect | null;
  /** Lead + buttons: body-size text at 4.5:1 leaves no headroom, so no ink. */
  clear: Rect | null;
  xIn: number;
  mergeX: number;
  xMatrix: number;
  cols: number;
  rows: number;
  groupSize: number;
  rowY: number[];
  mergeY: number[];
  paths: PathParams[];
  stations: number;
  particles: number;
  far: number;
  maxPulses: number;
  latSpread: number;
  wobble: number;
  bow: number;
  driftAmp: number;
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
  if (!muted || !fg) return null;
  return { muted, fg };
}

/** Style strings for every quantised alpha level, built once per palette. */
function buildStyles(palette: Palette): Styles {
  const fg: string[] = [];
  const muted: string[] = [];
  for (let i = 0; i < LEVELS; i += 1) {
    const alpha = Math.round(i * ALPHA_STEP * 100) / 100;
    fg.push(rgba(palette.fg, alpha));
    muted.push(rgba(palette.muted, alpha));
  }
  return {
    fg,
    muted,
    fgSolid: rgba(palette.fg, 1),
    mutedSolid: rgba(palette.muted, 1),
  };
}

function levelOf(alpha: number) {
  const level = Math.round(alpha / ALPHA_STEP);
  return level < 0 ? 0 : level >= LEVELS ? LEVELS - 1 : level;
}

function boxOf(el: HTMLElement, canvas: HTMLCanvasElement): Rect {
  const a = el.getBoundingClientRect();
  const b = canvas.getBoundingClientRect();
  return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
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

function intersects(a: DOMRect, b: DOMRect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
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
function touches(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  rect: Rect,
) {
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

function makeParticlePool(): Particle[] {
  const pool: Particle[] = [];
  for (let i = 0; i < POOL_PARTICLES; i += 1) {
    pool.push({
      path: 0,
      x: -1,
      lat: 0,
      speed: FLOW_MIN,
      frag: false,
      len: 2,
      size: 1,
      seed: hash(i * 4.7 + 0.2),
    });
  }
  return pool;
}

function makeFarPool(): Far[] {
  const pool: Far[] = [];
  for (let i = 0; i < POOL_FAR; i += 1) {
    pool.push({ x: 0, y: 0, speed: 10, seed: hash(i * 2.9 + 7.3) });
  }
  return pool;
}

function makePulsePool(): Pulse[] {
  const pool: Pulse[] = [];
  for (let i = 0; i < POOL_PULSES; i += 1) {
    pool.push({
      active: false,
      path: 0,
      x: 0,
      speed: PULSE_SPEED,
      lat: 0,
      child: false,
      fading: 0,
    });
  }
  return pool;
}

function makeNodePool(): MatrixNode[] {
  const pool: MatrixNode[] = [];
  for (let i = 0; i < POOL_NODES; i += 1) pool.push({ litAt: -1 });
  return pool;
}

const labelClass =
  "pointer-events-none absolute font-jetbrains text-[11px] leading-[14px] font-normal whitespace-nowrap text-muted";

/**
 * Flow field behind the /home hero: noisy input streams on the left, a few
 * drifting paths that merge in the middle, a sparse node matrix and parallel
 * trunks leaving on the right. One transparent canvas, pooled state, 30fps.
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

    /* Pools: allocated once, reused every frame. */
    const particles = makeParticlePool();
    const far = makeFarPool();
    const pulses = makePulsePool();
    const nodes = makeNodePool();
    const used = new Uint8Array(LEVELS);
    let ys: Float32Array[] = [];
    let levels: Uint8Array[] = [];

    let field: Field | null = null;
    let time = 0;
    let nextPulse = PULSE_GAP_MIN + hash(0.5) * (PULSE_GAP_MAX - PULSE_GAP_MIN);
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
    let seeded = false;

    const desktopMq = window.matchMedia(MD_QUERY);

    const syncColors = () => {
      if (styles && stylePair === pairRef.current) return;
      palette = readPalette();
      styles = palette ? buildStyles(palette) : null;
      stylePair = pairRef.current;
    };

    /* ---------- geometry ---------- */

    const pathY = (f: Field, k: number, x: number) => {
      const p = f.paths[k];
      let y: number;
      if (x < f.mergeX) {
        const s = smoothstep((x - f.xIn) / (f.mergeX - f.xIn));
        const start =
          p.spread + f.driftAmp * Math.sin(time * p.driftW + p.driftPhi);
        const wobble =
          (WOBBLE_1 * Math.sin(x * 0.02 + time * p.w1 + p.phi1) +
            WOBBLE_2 * Math.sin(x * 0.045 - time * p.w2 + p.phi2)) *
          f.wobble *
          (1 - s);
        const bow =
          f.bow * Math.sin(Math.PI * s) * Math.sin(time * p.bowW + p.bowPhi);
        y = (start + wobble) * (1 - s) + f.mergeY[p.group] * s + bow;
      } else {
        const v = smoothstep((x - f.mergeX) / MERGE_BLEND);
        y = lerp(f.mergeY[p.group], f.rowY[p.group], v);
      }
      return clamp(y, f.plot.y, f.plot.y + f.plot.h);
    };

    /** Path y from the per-frame station samples. */
    const sampleY = (f: Field, k: number, x: number) => {
      const arr = ys[k];
      const fi = x / STATION;
      const i0 = fi <= 0 ? 0 : fi >= f.stations - 1 ? f.stations - 1 : Math.floor(fi);
      const i1 = i0 + 1 < f.stations ? i0 + 1 : i0;
      const t = fi - i0;
      return arr[i0] + (arr[i1] - arr[i0]) * (t < 0 ? 0 : t > 1 ? 1 : t);
    };

    const settleOf = (f: Field, x: number) =>
      smoothstep((x - f.xIn) / (f.mergeX - f.xIn));

    const recycleParticle = (f: Field, p: Particle, salt: number) => {
      const s = p.seed;
      p.path = Math.min(
        f.paths.length - 1,
        Math.floor(hash(s * 13 + salt) * f.paths.length),
      );
      p.x = -2 - hash(s * 17 + salt) * 40;
      p.lat = (hash(s * 19 + salt) - 0.5) * 2 * f.latSpread;
      p.speed = FLOW_MIN + hash(s * 23 + salt) * (FLOW_MAX - FLOW_MIN);
      p.frag = hash(s * 29 + salt) < FRAG_SHARE;
      p.len = 2 + hash(s * 31 + salt) * 4;
      p.size = 1 + hash(s * 37 + salt);
    };

    const recycleFar = (f: Field, d: Far, salt: number) => {
      d.x = -2;
      d.y = f.plot.y + hash(d.seed * 11 + salt) * f.plot.h;
      d.speed = (FLOW_MIN + hash(d.seed * 7 + salt) * (FLOW_MAX - FLOW_MIN)) * FAR_FACTOR;
    };

    const seedField = (f: Field) => {
      for (let i = 0; i < f.particles; i += 1) {
        const p = particles[i];
        recycleParticle(f, p, 0.37);
        p.x = hash(p.seed * 41) * f.xMatrix;
      }
      for (let i = 0; i < f.far; i += 1) {
        const d = far[i];
        recycleFar(f, d, 0.53);
        d.x = hash(d.seed * 43) * f.width;
      }
      for (const pulse of pulses) pulse.active = false;
      for (const node of nodes) node.litAt = -1;
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

      const h1Box = boxOf(h1, canvas);
      const leadBox = boxOf(lead, canvas);
      const ctaBox = boxOf(cta, canvas);
      const mask = union([h1Box, leadBox, ctaBox]);
      const clear = union([leadBox, ctaBox]);
      const mobile = !desktopMq.matches;

      const blocks = [h1, lead, cta].map((el) => el.getBoundingClientRect());
      for (const label of [inRef.current, outRef.current]) {
        if (!label) continue;
        const hit = blocks.some((block) => intersects(label.getBoundingClientRect(), block));
        label.style.visibility = hit ? "hidden" : "visible";
      }

      const plot: Rect = mobile
        ? { x: 0, y: 0, w: width, h: Math.max(0, h1Box.y - MOBILE_GAP) }
        : { x: 0, y: 0, w: width, h: height };
      if (plot.h < MIN_BAND) {
        field = null;
        return;
      }

      const pathCount = mobile ? PATHS_MOBILE : PATHS_DESKTOP;
      const xIn = width * INPUT_AT;

      let rows = mobile ? 1 : 3;
      let mergeX: number;
      if (mobile) {
        mergeX = width * MOBILE_MERGE_AT;
      } else {
        const unionRight = mask ? mask.x + mask.w + MERGE_GAP : 0;
        mergeX = Math.max(width * MERGE_MIN_AT, unionRight);
        if (mergeX > width - OUTPUT_ROOM) {
          // Wide h1 or short viewport: fewer rows instead of crowding the edge.
          rows = 2;
          mergeX = Math.min(mergeX, width - OUTPUT_ROOM_SMALL);
        }
      }
      mergeX = Math.max(mergeX, xIn + MERGE_BLEND * 2);

      const xMatrix = mergeX + (mobile ? MATRIX_GAP_MOBILE : MATRIX_GAP);
      const cols = mobile
        ? Math.max(0, Math.min(MOBILE_DOTS, Math.floor((width - EDGE - xMatrix) / PITCH) + 1))
        : Math.max(2, Math.min(MAX_COLS, Math.floor((width - EDGE - xMatrix) / PITCH)));

      const groupSize = pathCount / rows;
      const centre = mobile
        ? plot.y + plot.h / 2
        : mask
          ? mask.y + mask.h / 2
          : height / 2;
      const rowY: number[] = [];
      const mergeY: number[] = [];
      for (let r = 0; r < rows; r += 1) {
        const offset = r - (rows - 1) / 2;
        rowY.push(clamp(centre + offset * PITCH, plot.y + 4, plot.y + plot.h - 4));
        mergeY.push(
          clamp(centre + offset * MERGE_SPREAD, plot.y + 4, plot.y + plot.h - 4),
        );
      }

      const paths: PathParams[] = [];
      for (let k = 0; k < pathCount; k += 1) {
        const driftPeriod =
          DRIFT_PERIOD_MIN + hash(k * 3.3 + 1) * (DRIFT_PERIOD_MAX - DRIFT_PERIOD_MIN);
        const bowPeriod =
          BOW_PERIOD_MIN + hash(k * 5.1 + 2) * (BOW_PERIOD_MAX - BOW_PERIOD_MIN);
        paths.push({
          spread: plot.y + plot.h * (0.1 + (0.8 * (k + 0.5)) / pathCount),
          driftW: (Math.PI * 2) / driftPeriod,
          driftPhi: hash(k * 7.7 + 3) * Math.PI * 2,
          w1: WOBBLE_W1_MIN + hash(k * 9.1 + 4) * (WOBBLE_W1_MAX - WOBBLE_W1_MIN),
          w2: WOBBLE_W2_MIN + hash(k * 11.3 + 5) * (WOBBLE_W2_MAX - WOBBLE_W2_MIN),
          phi1: hash(k * 13.7 + 6) * Math.PI * 2,
          phi2: hash(k * 15.1 + 7) * Math.PI * 2,
          bowW: (Math.PI * 2) / bowPeriod,
          bowPhi: hash(k * 17.3 + 8) * Math.PI * 2,
          group: Math.min(rows - 1, Math.floor(k / groupSize)),
          leader: k % groupSize === 0,
        });
      }

      const stations = Math.ceil(width / STATION) + 1;
      if (ys.length !== pathCount || ys[0]?.length !== stations) {
        ys = [];
        levels = [];
        for (let k = 0; k < pathCount; k += 1) {
          ys.push(new Float32Array(stations));
          levels.push(new Uint8Array(stations));
        }
      }

      let budget = BUDGET_MOBILE;
      if (!mobile) {
        budget = clamp(Math.round((width * height) / BUDGET_DIV), BUDGET_MIN, BUDGET_MAX);
        if (dpr > 1.5) budget = Math.round(budget * 0.85);
      }
      budget = Math.min(POOL_PARTICLES, budget);
      const farCount = mobile ? 0 : Math.min(POOL_FAR, Math.round(budget * FAR_SHARE));

      const next: Field = {
        width,
        height,
        mobile,
        plot,
        mask,
        clear,
        xIn,
        mergeX,
        xMatrix,
        cols,
        rows,
        groupSize,
        rowY,
        mergeY,
        paths,
        stations,
        particles: budget,
        far: farCount,
        maxPulses: mobile ? 1 : POOL_PULSES,
        latSpread: mobile ? Math.min(10, plot.h * 0.2) : 22,
        wobble: mobile ? 0.5 : 1,
        bow: mobile ? BOW * 0.4 : BOW,
        driftAmp: Math.min(DRIFT_MAX, plot.h * 0.04),
      };

      const reseed =
        !seeded ||
        !field ||
        field.mobile !== mobile ||
        field.particles !== budget ||
        field.paths.length !== pathCount;
      field = next;
      if (reseed) {
        seedField(next);
        seeded = true;
      }
    };

    /* ---------- simulation ---------- */

    const lightNode = (f: Field, group: number) => {
      if (f.cols <= 0) return;
      const col = Math.min(f.cols - 1, Math.floor(hash(time * 7.3 + group) * f.cols));
      const node = nodes[group * f.cols + col];
      if (node) node.litAt = time;
    };

    const spawnPulse = (f: Field) => {
      let live = 0;
      let slot: Pulse | null = null;
      for (const pulse of pulses) {
        if (pulse.active) live += 1;
        else if (!slot) slot = pulse;
      }
      if (!slot || live >= f.maxPulses) return;
      const count = f.paths.length;
      // Central paths only: skip the outermost on desktop.
      const lo = count > 2 ? 1 : 0;
      const hi = count > 2 ? count - 2 : count - 1;
      slot.active = true;
      slot.path = lo + Math.min(hi - lo, Math.floor(hash(time * 3.1) * (hi - lo + 1)));
      slot.x = f.width * PULSE_SPAWN_AT;
      slot.speed = PULSE_SPEED;
      slot.lat = 0;
      slot.child = false;
      slot.fading = 0;
    };

    const splitPulse = (f: Field, parent: Pulse) => {
      let live = 0;
      let slot: Pulse | null = null;
      for (const pulse of pulses) {
        if (pulse.active) live += 1;
        else if (!slot) slot = pulse;
      }
      parent.lat = -CHILD_OFFSET;
      if (!slot || live >= f.maxPulses) return;
      slot.active = true;
      slot.path = parent.path;
      slot.x = parent.x;
      slot.speed = PULSE_SPEED * CHILD_SPEED;
      slot.lat = CHILD_OFFSET;
      slot.child = true;
      slot.fading = 0;
    };

    const update = (f: Field, dt: number, allowPulses: boolean) => {
      time += dt;

      for (let i = 0; i < f.particles; i += 1) {
        const p = particles[i];
        const s = settleOf(f, p.x);
        p.x += p.speed * (1 + TRANSFORM_BOOST * s) * dt;
        if (p.x >= f.xMatrix) recycleParticle(f, p, time);
      }

      for (let i = 0; i < f.far; i += 1) {
        const d = far[i];
        d.x += d.speed * dt;
        if (d.x > f.width) recycleFar(f, d, time);
      }

      if (!allowPulses) return;

      for (const pulse of pulses) {
        if (!pulse.active) continue;
        if (pulse.fading > 0) {
          if ((time - pulse.fading) * 1000 >= PULSE_FADE_MS) pulse.active = false;
          continue;
        }
        const prev = pulse.x;
        pulse.x += pulse.speed * dt;
        if (!pulse.child && prev < f.mergeX && pulse.x >= f.mergeX) {
          splitPulse(f, pulse);
        }
        if (pulse.x >= f.xMatrix) {
          pulse.x = f.xMatrix;
          pulse.fading = time;
          lightNode(f, f.paths[pulse.path].group);
        }
      }

      if (time >= nextPulse) {
        spawnPulse(f);
        nextPulse = time + PULSE_GAP_MIN + hash(time * 9.7) * (PULSE_GAP_MAX - PULSE_GAP_MIN);
      }
    };

    /* ---------- drawing ---------- */

    let hasInside = false;

    /** Fill a small rect, routing masked ink to the offscreen stamp. */
    const mark = (
      f: Field,
      x: number,
      y: number,
      w: number,
      h: number,
      fg: boolean,
      alpha: number,
    ) => {
      if (!styles) return;
      const m = f.mask;
      if (m) {
        if (touches(x, y, x + w, y + h, m)) {
          octx.fillStyle = fg ? styles.fgSolid : styles.mutedSolid;
          octx.fillRect(x, y, w, h);
          hasInside = true;
          return;
        }
        const d = distOutside(x + w / 2, y + h / 2, m);
        if (d < FEATHER) alpha = maskedAlpha(d, alpha);
      }
      const set = fg ? styles.fg : styles.muted;
      ctx.fillStyle = set[levelOf(alpha)];
      ctx.fillRect(x, y, w, h);
    };

    const pulseHalo = (f: Field, k: number, x: number) => {
      let halo = 0;
      const path = f.paths[k];
      for (const pulse of pulses) {
        if (!pulse.active) continue;
        const onTrunk = x >= f.mergeX;
        const same = onTrunk
          ? f.paths[pulse.path].group === path.group
          : pulse.path === k;
        if (!same) continue;
        const dx = x - pulse.x;
        if (dx > HALO_HALF || dx < -HALO_HALF) continue;
        const fade = pulse.fading > 0 ? 1 - ((time - pulse.fading) * 1000) / PULSE_FADE_MS : 1;
        halo = Math.max(halo, PULSE_HALO * (1 - Math.abs(dx) / HALO_HALF) * fade);
      }
      return halo;
    };

    const strokeLevel = (
      context: CanvasRenderingContext2D,
      f: Field,
      k: number,
      level: number,
      style: string,
    ) => {
      const arr = ys[k];
      const lv = levels[k];
      context.beginPath();
      let pen = false;
      for (let i = 0; i < f.stations - 1; i += 1) {
        if (lv[i] !== level) {
          pen = false;
          continue;
        }
        const x0 = i * STATION;
        const x1 = Math.min(f.width, (i + 1) * STATION);
        if (!pen) context.moveTo(x0, arr[i]);
        context.lineTo(x1, arr[i + 1]);
        pen = true;
      }
      context.strokeStyle = style;
      context.lineWidth = 1;
      context.stroke();
    };

    const drawPaths = (f: Field) => {
      if (!styles) return;
      for (let k = 0; k < f.paths.length; k += 1) {
        const arr = ys[k];
        for (let i = 0; i < f.stations; i += 1) {
          arr[i] = pathY(f, k, Math.min(f.width, i * STATION));
        }
      }
      for (let k = 0; k < f.paths.length; k += 1) {
        const path = f.paths[k];
        const arr = ys[k];
        const lv = levels[k];
        used.fill(0);
        let inside = false;
        for (let i = 0; i < f.stations - 1; i += 1) {
          const x = (i + 0.5) * STATION;
          if (x >= f.mergeX && !path.leader) {
            lv[i] = LEVEL_SKIP;
            continue;
          }
          let alpha: number;
          if (x < f.mergeX) {
            const s = settleOf(f, x);
            alpha = lerp(PATH_ALPHA, PATH_MERGE_ALPHA, s * s);
          } else {
            const v = smoothstep((x - f.mergeX) / MERGE_BLEND);
            alpha = lerp(PATH_MERGE_ALPHA, PATH_ALPHA, v);
          }
          alpha += pulseHalo(f, k, x);
          if (f.mask) {
            const ya = arr[i];
            const yb = arr[i + 1];
            const sx0 = i * STATION;
            const sx1 = Math.min(f.width, (i + 1) * STATION);
            if (touches(sx0, Math.min(ya, yb), sx1, Math.max(ya, yb), f.mask)) {
              lv[i] = LEVEL_INSIDE;
              inside = true;
              continue;
            }
            const d = distOutside(x, (ya + yb) / 2, f.mask);
            if (d < FEATHER) alpha = maskedAlpha(d, alpha);
          }
          const level = levelOf(alpha);
          lv[i] = level;
          used[level] = 1;
        }
        for (let level = 0; level < LEVELS; level += 1) {
          if (used[level]) strokeLevel(ctx, f, k, level, styles.fg[level]);
        }
        if (inside) {
          strokeLevel(octx, f, k, LEVEL_INSIDE, styles.fgSolid);
          hasInside = true;
        }
      }
    };

    const particleY = (f: Field, p: Particle, x: number) => {
      const s = settleOf(f, x);
      return clamp(sampleY(f, p.path, x) + p.lat * (1 - s), f.plot.y, f.plot.y + f.plot.h);
    };

    const drawParticles = (f: Field) => {
      if (!styles) return;
      const m = f.mask;
      // Dots, routed one by one (cheap fillRects).
      for (let i = 0; i < f.particles; i += 1) {
        const p = particles[i];
        if (p.frag || p.x < 0 || p.x >= f.xMatrix) continue;
        const y = particleY(f, p, p.x);
        const half = p.size / 2;
        mark(f, p.x - half, y - half, p.size, p.size, false, INPUT_ALPHA);
      }
      // Fragments outside the union, batched into one stroke.
      ctx.beginPath();
      for (let i = 0; i < f.particles; i += 1) {
        const p = particles[i];
        if (!p.frag || p.x < 0 || p.x >= f.xMatrix) continue;
        const x1 = Math.min(f.xMatrix, p.x + p.len);
        const y0 = particleY(f, p, p.x);
        const y1 = particleY(f, p, x1);
        if (m && distOutside((p.x + x1) / 2, (y0 + y1) / 2, m) < FEATHER) continue;
        ctx.moveTo(p.x, y0);
        ctx.lineTo(x1, y1);
      }
      ctx.strokeStyle = styles.muted[levelOf(INPUT_ALPHA)];
      ctx.lineWidth = 1;
      ctx.stroke();
      if (!m) return;
      // Fragments inside or near the union: stamped or feathered individually.
      for (let i = 0; i < f.particles; i += 1) {
        const p = particles[i];
        if (!p.frag || p.x < 0 || p.x >= f.xMatrix) continue;
        const x1 = Math.min(f.xMatrix, p.x + p.len);
        const y0 = particleY(f, p, p.x);
        const y1 = particleY(f, p, x1);
        const d = distOutside((p.x + x1) / 2, (y0 + y1) / 2, m);
        if (d >= FEATHER) continue;
        const stamp = touches(p.x, Math.min(y0, y1), x1, Math.max(y0, y1), m);
        const context = stamp ? octx : ctx;
        context.beginPath();
        context.moveTo(p.x, y0);
        context.lineTo(x1, y1);
        context.strokeStyle = stamp
          ? styles.mutedSolid
          : styles.muted[levelOf(maskedAlpha(d, INPUT_ALPHA))];
        context.lineWidth = 1;
        context.stroke();
        if (stamp) hasInside = true;
      }
    };

    const drawFar = (f: Field) => {
      for (let i = 0; i < f.far; i += 1) {
        const d = far[i];
        const y = clamp(
          d.y + Math.sin(time * 0.1 + d.seed * 20) * 4,
          f.plot.y,
          f.plot.y + f.plot.h,
        );
        mark(f, d.x, y, 1, 1, true, FAR_ALPHA);
      }
    };

    const drawNodes = (f: Field) => {
      for (let r = 0; r < f.rows; r += 1) {
        const y = f.rowY[r];
        for (let c = 0; c < f.cols; c += 1) {
          const node = nodes[r * f.cols + c];
          let alpha = NODE_ALPHA;
          if (node && node.litAt >= 0) {
            const age = ((time - node.litAt) * 1000) / LIT_MS;
            if (age < 1) {
              const ease = 1 - age * age;
              alpha = lerp(NODE_ALPHA, NODE_LIT_ALPHA, ease);
            }
          }
          const x = f.xMatrix + c * PITCH;
          mark(f, x - NODE / 2, y - NODE / 2, NODE, NODE, true, alpha);
        }
      }
    };

    const drawPulses = (f: Field) => {
      for (const pulse of pulses) {
        if (!pulse.active) continue;
        const fade = pulse.fading > 0 ? 1 - ((time - pulse.fading) * 1000) / PULSE_FADE_MS : 1;
        if (fade <= 0) continue;
        const y = clamp(
          sampleY(f, pulse.path, pulse.x) + pulse.lat,
          f.plot.y,
          f.plot.y + f.plot.h,
        );
        mark(f, pulse.x - 1.5, y - 1.5, 3, 3, true, PULSE_ALPHA * fade);
      }
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

      drawFar(f);
      drawPaths(f);
      drawParticles(f);
      drawNodes(f);
      drawPulses(f);

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

    /** One composed frame: paths, settled particles, nodes, no pulses. */
    const drawStill = () => {
      syncColors();
      const f = field;
      if (!f || !styles) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      time = 5;
      for (const pulse of pulses) pulse.active = false;
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
      <span
        ref={outRef}
        className={cn(labelClass, "top-2 right-2 md:top-auto md:bottom-2")}
      >
        {hero.flowOut}
      </span>
    </div>
  );
}
