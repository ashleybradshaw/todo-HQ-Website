"use client";

import { useEffect, useRef, useState } from "react";
import {
  GATEWAY_ACCENT,
  GATEWAY_TONES,
} from "@/lib/gateway-field-palette";

type Mark = "dot" | "plus" | "dash";

type Cell = {
  life: number;
  mark: Mark;
  size: number;
  accent: boolean;
};

const GAP = 11;
const ACCENT = GATEWAY_ACCENT;
const TONES = GATEWAY_TONES;

function hash3(ix: number, iy: number, iz: number) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(iz, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function fade(t: number) {
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, y: number, z: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const z0 = Math.floor(z);
  const tx = fade(x - x0);
  const ty = fade(y - y0);
  const tz = fade(z - z0);

  const n000 = hash3(x0, y0, z0);
  const n100 = hash3(x0 + 1, y0, z0);
  const n010 = hash3(x0, y0 + 1, z0);
  const n110 = hash3(x0 + 1, y0 + 1, z0);
  const n001 = hash3(x0, y0, z0 + 1);
  const n101 = hash3(x0 + 1, y0, z0 + 1);
  const n011 = hash3(x0, y0 + 1, z0 + 1);
  const n111 = hash3(x0 + 1, y0 + 1, z0 + 1);

  const nx00 = n000 + (n100 - n000) * tx;
  const nx10 = n010 + (n110 - n010) * tx;
  const nx01 = n001 + (n101 - n001) * tx;
  const nx11 = n011 + (n111 - n011) * tx;
  const nxy0 = nx00 + (nx10 - nx00) * ty;
  const nxy1 = nx01 + (nx11 - nx01) * ty;

  return nxy0 + (nxy1 - nxy0) * tz;
}

function fbm(x: number, y: number, z: number) {
  let value = 0;
  let amp = 0.52;
  let freq = 1;
  let norm = 0;

  for (let i = 0; i < 4; i += 1) {
    value += amp * valueNoise(x * freq, y * freq, z * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }

  return value / norm;
}

/** Full-viewport topographic density — ambient drift only, no crest band. */
function field(nx: number, ny: number, t: number) {
  const warp = valueNoise(nx * 1.2 + t * 0.07, ny * 0.85, t * 0.05) * 0.3;
  const mass = fbm(nx * 1.9 + warp + t * 0.06, ny * 1.35 - t * 0.035, t * 0.09);
  const grain = fbm(nx * 8.6 - t * 0.18, ny * 7.4 + t * 0.1, t * 0.24);
  const breath = 0.05 * Math.sin(t * 0.26 + nx * 2.2 + ny * 1.4);
  const ridge = Math.abs(mass - 0.48 + breath);
  const band = 1 - Math.min(1, ridge * 2.4);
  const holes = 0.38 + 0.62 * grain;
  const soft = 0.55 + 0.45 * mass;

  return band * holes * soft * 0.92;
}

export function StippleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const cells = new Map<number, Cell>();
    let frame = 0;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let primed = false;
    let running = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / GAP);
      rows = Math.ceil(height / GAP);
      cells.clear();
      primed = false;
    };

    const draw = (time: number) => {
      const t = reduceMotion ? 8.4 : time / 1000;
      const ease = reduceMotion || !primed ? 1 : 0.08;
      ctx.clearRect(0, 0, width, height);

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          if (hash3(col, row, 9) > 0.62) {
            continue;
          }

          const x = col * GAP + 1 + (hash3(col, row, 3) - 0.5) * 2.2;
          const y = row * GAP + 1 + (hash3(col, row, 5) - 0.5) * 2.2;
          const density = field(x / width, y / height, t);
          const key = row * 2048 + col;
          let cell = cells.get(key);
          const alive = density > 0.38;

          if (!cell && !alive) {
            continue;
          }

          if (!cell) {
            const seed = hash3(col, row, 17);
            const markSeed = hash3(col, row, 23);
            let mark: Mark = "dot";
            if (markSeed > 0.94) {
              mark = "plus";
            } else if (markSeed > 0.88) {
              mark = "dash";
            }

            cell = {
              life: 0,
              mark,
              size: seed > 0.8 ? 2.2 : 1.8,
              accent: hash3(col, row, 41) < 0.1,
            };
            cells.set(key, cell);
          }

          cell.life += ((alive ? 1 : 0) - cell.life) * ease;

          if (cell.life < 0.03 && !alive) {
            cells.delete(key);
            continue;
          }

          const heat = Math.min(1, cell.life * (0.35 + density * 0.75));
          const tone = Math.min(
            TONES.length - 1,
            Math.max(0, Math.floor(heat * (TONES.length - 0.15))),
          );
          ctx.globalAlpha = 0.22 + heat * 0.48;
          ctx.fillStyle = cell.accent ? ACCENT : TONES[tone];

          if (cell.mark === "plus" && heat > 0.48) {
            ctx.fillRect(x - 2.2, y - 0.5, 4.4, 1);
            ctx.fillRect(x - 0.5, y - 2.2, 1, 4.4);
          } else if (cell.mark === "dash" && heat > 0.4) {
            ctx.fillRect(x - 2.4, y - 0.45, 4.8, 0.9);
          } else {
            ctx.fillRect(x, y, cell.size, cell.size);
          }
        }
      }

      ctx.globalAlpha = 1;
      primed = true;
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

    requestAnimationFrame(() => setVisible(true));

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
      className={`pointer-events-none absolute inset-0 z-0 h-full w-full transition-opacity duration-700 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
