/**
 * Capture unsprayed desktop stills for /ui In the wild + hawk poster.
 * Usage: node scripts/capture-ui-previews.mjs
 * Expects next dev (or PLAYWRIGHT_BASE_URL) on :3000.
 */
import { chromium } from "@playwright/test";
import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public/ui/previews");
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

const PAGES = [
  { name: "home", path: "/home" },
  { name: "about", path: "/about" },
  { name: "project", path: "/work/repdaily" },
];

async function toWebp(pngPath, webpPath) {
  try {
    const sharp = (await import("sharp")).default;
    await sharp(pngPath).webp({ quality: 82 }).toFile(webpPath);
    return;
  } catch {
    /* fall through */
  }
  // Playwright can write webp via page.screenshot type — use png rename path only if sharp missing
  const { execFileSync } = await import("node:child_process");
  try {
    execFileSync("cwebp", ["-q", "82", pngPath, "-o", webpPath], {
      stdio: "ignore",
    });
  } catch {
    // Last resort: keep a .webp extension by copying png bytes (Next Image accepts webp path; prefer real webp)
    await copyFile(pngPath, webpPath);
    console.warn(`Wrote ${webpPath} without re-encode (install sharp for real WebP).`);
  }
}

async function main() {
  await mkdir(outDir, { recursive: true });

  // Hawk poster: copy approved gateway still into previews
  await copyFile(
    path.join(root, "public/ascii-hawk/video/hawk-poster.webp"),
    path.join(outDir, "hawk-poster.webp"),
  );
  console.log("hawk-poster.webp copied");

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    colorScheme: "light",
  });
  // Ensure unsprayed brand — clear spray localStorage keys if any
  await context.addInitScript(() => {
    try {
      for (const key of Object.keys(localStorage)) {
        if (/spray|pair|brand/i.test(key)) localStorage.removeItem(key);
      }
    } catch {
      /* ignore */
    }
  });

  const page = await context.newPage();

  for (const item of PAGES) {
    const url = `${baseURL}${item.path}`;
    console.log(`Capturing ${url}`);
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    // Let fonts / boot settle
    await page.waitForTimeout(1200);
    const pngPath = path.join(outDir, `${item.name}.png`);
    const webpPath = path.join(outDir, `${item.name}.webp`);
    await page.screenshot({ path: pngPath, type: "png", fullPage: false });
    await toWebp(pngPath, webpPath);
    console.log(`Wrote ${item.name}.webp`);
  }

  await browser.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
