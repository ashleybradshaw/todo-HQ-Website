import {
  contrastRatio,
  INNER_BRAND_PAIR,
  isInnerBrandPair,
  type AccessibleColorPair,
} from "@/lib/accessibleColorPair";

/** Parse rgb/rgba/hex from getComputedStyle into #RRGGBB (or null). */
export function cssColorToHex(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "transparent") return null;

  const hexMatch = trimmed.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);
  if (hexMatch) {
    const h = hexMatch[1];
    if (h.length === 3) {
      return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toUpperCase();
    }
    return `#${h.slice(0, 6)}`.toUpperCase();
  }

  const rgbMatch = trimmed.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i,
  );
  if (rgbMatch) {
    const r = Math.round(Number(rgbMatch[1]));
    const g = Math.round(Number(rgbMatch[2]));
    const b = Math.round(Number(rgbMatch[3]));
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    return `#${[r, g, b]
      .map((n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()}`;
  }

  // Modern space-separated rgb(r g b / a)
  const modern = trimmed.match(
    /^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/i,
  );
  if (modern) {
    const r = Math.round(Number(modern[1]));
    const g = Math.round(Number(modern[2]));
    const b = Math.round(Number(modern[3]));
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    return `#${[r, g, b]
      .map((n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()}`;
  }

  return null;
}

/**
 * Resolve a CSS custom property on :root to a hex (via computed colour probe).
 * Works for color-mix() tokens by painting a temporary element.
 */
export function readCssVarHex(token: string): string | null {
  if (typeof document === "undefined") return null;
  const root = document.documentElement;
  const raw = getComputedStyle(root).getPropertyValue(token).trim();
  if (!raw) return null;

  const direct = cssColorToHex(raw);
  if (direct) return direct;

  const probe = document.createElement("span");
  probe.style.cssText =
    "position:absolute;left:-9999px;top:0;width:1px;height:1px;pointer-events:none;";
  probe.style.color = `var(${token})`;
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  return cssColorToHex(computed);
}

export function readPairHexes(): { canvas: string | null; text: string | null } {
  return {
    canvas: readCssVarHex("--bg-canvas"),
    text: readCssVarHex("--foreground"),
  };
}

export function formatContrast(
  ratio: number | null,
  opts?: { self?: boolean },
): string {
  if (opts?.self) return "—";
  if (ratio === null || !Number.isFinite(ratio)) return "—";
  // Same colour vs itself reads as ~1:1 — show an em dash instead.
  if (ratio < 1.05) return "—";
  return `${ratio.toFixed(2)}:1`;
}

export function contrastVsCanvasAndText(hex: string | null): {
  vsCanvas: number | null;
  vsText: number | null;
} {
  if (!hex) return { vsCanvas: null, vsText: null };
  const { canvas, text } = readPairHexes();
  return {
    vsCanvas: canvas ? contrastRatio(hex, canvas) : null,
    vsText: text ? contrastRatio(hex, text) : null,
  };
}

export type BrandDrift = {
  drifted: boolean;
  details: string[];
};

/** When Spray is on brand pair, flag CSS ↔ INNER_BRAND_PAIR mismatches. */
export function detectBrandDrift(pair: AccessibleColorPair): BrandDrift {
  if (!isInnerBrandPair(pair)) {
    return { drifted: false, details: [] };
  }
  const details: string[] = [];
  const canvas = readCssVarHex("--bg-canvas");
  const text = readCssVarHex("--foreground");
  const norm = (h: string) => h.toUpperCase();

  if (canvas && norm(canvas) !== norm(INNER_BRAND_PAIR.bg)) {
    details.push(
      `--bg-canvas live ${canvas} ≠ INNER_BRAND_PAIR.bg ${INNER_BRAND_PAIR.bg}`,
    );
  }
  if (text && norm(text) !== norm(INNER_BRAND_PAIR.text)) {
    details.push(
      `--foreground live ${text} ≠ INNER_BRAND_PAIR.text ${INNER_BRAND_PAIR.text}`,
    );
  }
  return { drifted: details.length > 0, details };
}
