"use client";

import { useEffect, useRef } from "react";

type Cell = {
  life: number;
  mark: "dot" | "plus";
  size: number;
};

const GAP = 10;
const TONES = ["#8A8AFF", "#A8A8FF", "#C6C6FF", "#DDDDFF", "#F3F3FF"] as const;

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

function field(nx: number, ny: number, t: number) {
  const warp = valueNoise(nx * 1.2 + t * 0.07, ny * 0.85, t * 0.05) * 0.3;
  const mass = fbm(nx * 1.9 + warp + t * 0.06, ny * 1.35 - t * 0.035, t * 0.09);
  const grain = fbm(nx * 8.6 - t * 0.18, ny * 7.4 + t * 0.1, t * 0.24);
  const breath = 0.06 * Math.sin(t * 0.26 + nx * 2.2);
  const ridge = 0.28 + 0.56 * mass + breath;
  const crest = 1 - ridge * 0.94;

  if (ny < crest - 0.12) {
    return 0;
  }

  if (ny < crest - 0.02) {
    return grain > 0.72 ? grain * 0.45 : 0;
  }

  const depth = Math.min(1, Math.max(0, (ny - crest + 0.04) / 0.5));
  const envelope = Math.pow(depth, 0.52) * (0.4 + 0.6 * mass);
  const holes = 0.42 + 0.58 * grain;

  return envelope * holes * (0.82 + 0.18 * nx);
}

export function StippleField() {
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
    const cells = new Map<number, Cell>();
    let frame = 0;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let primed = false;

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
          if (hash3(col, row, 9) > 0.7) {
            continue;
          }

          const x = col * GAP + 1 + (hash3(col, row, 3) - 0.5) * 2.2;
          const y = row * GAP + 1 + (hash3(col, row, 5) - 0.5) * 2.2;
          const density = field(x / width, y / height, t);
          const key = row * 1024 + col;
          let cell = cells.get(key);
          const alive = density > 0.34;

          if (!cell && !alive) {
            continue;
          }

          if (!cell) {
            const seed = hash3(col, row, 17);
            cell = {
              life: 0,
              mark: seed > 0.93 ? "plus" : "dot",
              size: seed > 0.8 ? 2.4 : 2,
            };
            cells.set(key, cell);
          }

          cell.life += ((alive ? 1 : 0) - cell.life) * ease;

          if (cell.life < 0.03 && !alive) {
            cells.delete(key);
            continue;
          }

          const heat = Math.min(1, cell.life * (0.4 + density * 0.85));
          const tone = Math.min(4, Math.max(0, Math.floor(heat * 4.35)));
          ctx.globalAlpha = 0.32 + heat * 0.68;
          ctx.fillStyle = TONES[tone];

          if (cell.mark === "plus" && heat > 0.48) {
            ctx.fillRect(x - 2.5, y - 0.55, 5, 1.1);
            ctx.fillRect(x - 0.55, y - 2.5, 1.1, 5);
          } else {
            ctx.fillRect(x, y, cell.size, cell.size);
          }
        }
      }

      ctx.globalAlpha = 1;
      primed = true;
    };

    const tick = (now: number) => {
      draw(now);
      if (!reduceMotion) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    resize();
    draw(reduceMotion ? 0 : performance.now());
    if (!reduceMotion) {
      frame = window.requestAnimationFrame(tick);
    }

    const observer = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    observer.observe(canvas);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[42%] w-full"
    />
  );
}
