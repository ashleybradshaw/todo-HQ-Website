#!/usr/bin/env node
/**
 * Blog image pipeline (GrokBot-ready test pass).
 *
 * 1. Strip camera/GPS EXIF from the source
 * 2. Fit to master 2400×1260 WebP (Google-friendly OG ratio)
 * 3. Write a sidecar .meta.json for SEO / AI (alt, title, description, keywords)
 *
 * Usage:
 *   node scripts/process-blog-image.mjs \
 *     --input path/to/source.jpg \
 *     --slug factory-roster \
 *     --alt "..." \
 *     --title "..." \
 *     --description "..."
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const MASTER_WIDTH = 2400;
const MASTER_HEIGHT = 1260;
const WEBP_QUALITY = 82;

function arg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1 || !process.argv[index + 1]) {
    return null;
  }
  return process.argv[index + 1];
}

function requireArg(flag, label) {
  const value = arg(flag);
  if (!value) {
    console.error(`Missing ${label}. Pass ${flag} "..."`);
    process.exit(1);
  }
  return value;
}

function assertNoTraversal(slug) {
  if (!/^[\w-]+$/.test(slug)) {
    console.error(`Invalid slug "${slug}". Use letters, numbers, underscore, hyphen.`);
    process.exit(1);
  }
}

async function main() {
  const input = requireArg("--input", "input image");
  const slug = requireArg("--slug", "blog slug");
  assertNoTraversal(slug);

  const alt = requireArg("--alt", "alt text");
  const title =
    arg("--title") ?? "Repdaily — Our First Time";
  const description =
    arg("--description") ??
    "Repdaily brand still from the //TODO Engineering factory. Two athletes mid push-up behind the app on two phones, PushPass and achievements in the lime frame.";
  const keywords =
    arg("--keywords") ??
    "Repdaily, fitness app, PushPass, camera-based tracking, //TODO Engineering, software factory";

  const outDir = path.join(ROOT, "public", "blog");
  await mkdir(outDir, { recursive: true });

  const webpPath = path.join(outDir, `${slug}.webp`);
  const metaPath = path.join(outDir, `${slug}.meta.json`);
  const publicSrc = `/blog/${slug}.webp`;

  // Clean pass: decode + rotate from EXIF orientation, then drop source metadata.
  const cleaned = sharp(input, { failOn: "none" }).rotate();

  await cleaned
    .resize(MASTER_WIDTH, MASTER_HEIGHT, {
      fit: "cover",
      position: "centre",
      withoutEnlargement: false,
    })
    .webp({
      quality: WEBP_QUALITY,
      effort: 6,
      smartSubsample: true,
    })
    // Re-attach a small, intentional metadata set (no GPS / camera junk).
    .withMetadata({
      density: 72,
      exif: {
        IFD0: {
          Copyright: "//TODO Engineering",
          ImageDescription: description,
          Artist: "//TODO Engineering",
        },
      },
    })
    .toFile(webpPath);

  const info = await sharp(webpPath).metadata();

  const meta = {
    slug,
    src: publicSrc,
    format: "webp",
    width: info.width,
    height: info.height,
    masterWidth: MASTER_WIDTH,
    masterHeight: MASTER_HEIGHT,
    quality: WEBP_QUALITY,
    title,
    alt,
    description,
    keywords: keywords.split(",").map((part) => part.trim()).filter(Boolean),
    credit: "//TODO Engineering",
    project: "Repdaily",
    cleaned: true,
    generatedAt: new Date().toISOString(),
  };

  await writeFile(metaPath, `${JSON.stringify(meta, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        ok: true,
        webp: publicSrc,
        meta: `/blog/${slug}.meta.json`,
        width: info.width,
        height: info.height,
        bytes: info.size ?? null,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
