#!/usr/bin/env node
/**
 * Bake ASCII hawk atlas from the source MP4.
 *
 * Requires ffmpeg on PATH.
 *
 * Usage:
 *   node scripts/bake-hawk-ascii.mjs
 *   npm run hawk:bake
 *
 * Reads:  assets/ascii-hawk/hawk-source.mp4 (preferred) or public/ascii-hawk/hawk-source.mp4
 * Writes: public/ascii-hawk/atlas.json + public/ascii-hawk/atlas.bin
 */

import { spawn } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(ROOT, "public", "ascii-hawk");
const ASSETS_SRC = path.join(ROOT, "assets", "ascii-hawk", "hawk-source.mp4");
const PUBLIC_SRC = path.join(PUBLIC_DIR, "hawk-source.mp4");

const CHARSET = " .,:;-+*x%#@&$";
const COLS = 400;
const ROWS = 225;
const FPS = 14;
const LUMA_SKIP = 0.05;

function lumaFromRgb(r, g, b) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function gradeLuma(raw) {
  const lo = 0.18;
  const hi = 0.7;
  if (raw <= lo) {
    return 0;
  }
  const t = Math.min(1, (raw - lo) / (hi - lo));
  return Math.pow(t, 0.55);
}

function glyphIndexFromLuma(luma) {
  if (luma < LUMA_SKIP) {
    return 0;
  }
  return Math.min(
    CHARSET.length - 1,
    Math.floor(luma * (CHARSET.length - 0.0001)),
  );
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${cmd} exited ${code}`));
      }
    });
  });
}

async function resolveSource() {
  try {
    await readFile(ASSETS_SRC);
    return ASSETS_SRC;
  } catch {
    try {
      await readFile(PUBLIC_SRC);
      return PUBLIC_SRC;
    } catch {
      throw new Error(
        `Missing hawk source. Expected ${ASSETS_SRC} or ${PUBLIC_SRC}`,
      );
    }
  }
}

async function main() {
  const source = await resolveSource();
  await mkdir(PUBLIC_DIR, { recursive: true });

  const tmp = await mkdtemp(path.join(os.tmpdir(), "hawk-ascii-"));
  const pattern = path.join(tmp, "frame-%05d.png");

  console.log(`Source: ${source}`);
  console.log(`Extracting frames @ ${FPS}fps → ${tmp}`);

  await run("ffmpeg", [
    "-y",
    "-i",
    source,
    "-vf",
    `fps=${FPS}`,
    pattern,
  ]);

  const frames = (await readdir(tmp))
    .filter((name) => name.endsWith(".png"))
    .sort();

  if (frames.length === 0) {
    throw new Error("No frames extracted");
  }

  console.log(`Baking ${frames.length} frames at ${COLS}×${ROWS}…`);

  const bin = Buffer.alloc(frames.length * COLS * ROWS);

  for (let f = 0; f < frames.length; f += 1) {
    const raw = await sharp(path.join(tmp, frames[f]))
      .resize(COLS, ROWS, { fit: "cover" })
      .ensureAlpha()
      .raw()
      .toBuffer();

    const base = f * COLS * ROWS;
    for (let i = 0; i < COLS * ROWS; i += 1) {
      const o = i * 4;
      const graded = gradeLuma(lumaFromRgb(raw[o], raw[o + 1], raw[o + 2]));
      bin[base + i] = glyphIndexFromLuma(graded);
    }

    if ((f + 1) % 20 === 0 || f === frames.length - 1) {
      console.log(`  frame ${f + 1}/${frames.length}`);
    }
  }

  const meta = {
    version: 2,
    cols: COLS,
    rows: ROWS,
    frameCount: frames.length,
    fps: FPS,
    charset: CHARSET,
    pingPong: true,
    cellW: 1,
    cellH: 1.05,
  };

  await writeFile(path.join(PUBLIC_DIR, "atlas.json"), `${JSON.stringify(meta, null, 2)}\n`);
  await writeFile(path.join(PUBLIC_DIR, "atlas.bin"), bin);
  await rm(tmp, { recursive: true, force: true });

  console.log(
    `Wrote public/ascii-hawk/atlas.json + atlas.bin (${bin.length} bytes, ${frames.length} frames)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
