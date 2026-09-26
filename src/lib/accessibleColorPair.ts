export type AccessibleColorPair = {
  bg: string;
  text: string;
};

const WCAG_AA_CONTRAST = 4.5;
/** Prefer AAA when a candidate appears within the attempt budget. */
const WCAG_AAA_PREFER = 7;
/** Floor for muted roles (comment / property) on bg — AA normal text. */
const MUTED_MIN_CONTRAST = 4.5;
/** Brand soft tier — matches --text-muted / syn-comment / syn-property. */
export const BRAND_TEXT_MUTED = "#5A5A99";
/** Brand text on tinted card/CTA fills — matches --text-on-tint. */
export const BRAND_TEXT_ON_TINT = "#3636FF";
/** Brand syn-string / syn-number solids (smallest AA step on powder). */
export const BRAND_SYN_STRING = "#047351";
export const BRAND_SYN_NUMBER = "#985304";
const MAX_ATTEMPTS = 120;
const HEX_PAIR = /^#([0-9a-fA-F]{6})$/;

function channelToLinear(channel: number) {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function hexToHsl(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  let hue = 0;
  let saturation = 0;

  if (max !== min) {
    const delta = max - min;
    saturation =
      lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    if (max === red) {
      hue = ((green - blue) / delta + (green < blue ? 6 : 0)) * 60;
    } else if (max === green) {
      hue = ((blue - red) / delta + 2) * 60;
    } else {
      hue = ((red - green) / delta + 4) * 60;
    }
  }

  return {
    h: hue,
    s: saturation * 100,
    l: lightness * 100,
  };
}

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return (
    0.2126 * channelToLinear(r) +
    0.7152 * channelToLinear(g) +
    0.0722 * channelToLinear(b)
  );
}

export function contrastRatio(first: string, second: string) {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

function toHex(channel: number) {
  return Math.round(channel).toString(16).padStart(2, "0");
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (hue < 60) {
    r = c;
    g = x;
  } else if (hue < 120) {
    r = x;
    g = c;
  } else if (hue < 180) {
    g = c;
    b = x;
  } else if (hue < 240) {
    g = x;
    b = c;
  } else if (hue < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return `#${toHex((r + m) * 255)}${toHex((g + m) * 255)}${toHex((b + m) * 255)}`;
}

/** Approximate `color-mix(in srgb, fg p%, bg)` in sRGB. */
function mixHex(foreground: string, background: string, foregroundWeight: number) {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);
  const t = Math.min(1, Math.max(0, foregroundWeight));
  const u = 1 - t;
  return `#${toHex(fg.r * t + bg.r * u)}${toHex(fg.g * t + bg.g * u)}${toHex(fg.b * t + bg.b * u)}`;
}

function randomHex(lightnessMin: number, lightnessMax: number) {
  return hslToHex(
    Math.random() * 360,
    55 + Math.random() * 40,
    lightnessMin + Math.random() * (lightnessMax - lightnessMin),
  );
}

export const INNER_BRAND_PAIR: AccessibleColorPair = {
  bg: "#DFDFFF",
  text: "#4545FF",
};

export function isInnerBrandPair(pair: AccessibleColorPair) {
  return (
    pair.bg.toLowerCase() === INNER_BRAND_PAIR.bg.toLowerCase() &&
    pair.text.toLowerCase() === INNER_BRAND_PAIR.text.toLowerCase()
  );
}

export function isAccessibleColorPair(
  value: unknown,
): value is AccessibleColorPair {
  if (!value || typeof value !== "object") {
    return false;
  }

  const pair = value as AccessibleColorPair;
  return HEX_PAIR.test(pair.bg) && HEX_PAIR.test(pair.text);
}

export function fitHueAgainstBackground(
  background: string,
  hue: number,
  saturation: number,
  preferredLightness: number,
) {
  let best = hslToHex(hue, saturation, preferredLightness);
  let bestScore = Number.NEGATIVE_INFINITY;

  for (let lightness = 4; lightness <= 96; lightness += 1) {
    const hex = hslToHex(hue, saturation, lightness);
    const contrast = contrastRatio(hex, background);
    if (contrast < WCAG_AA_CONTRAST) {
      continue;
    }
    const score = 1000 - Math.abs(lightness - preferredLightness);
    if (score > bestScore) {
      best = hex;
      bestScore = score;
    }
  }

  if (bestScore > Number.NEGATIVE_INFINITY) {
    return best;
  }

  let maxContrast = contrastRatio(best, background);
  for (let lightness = 4; lightness <= 96; lightness += 1) {
    const hex = hslToHex(hue, saturation, lightness);
    const contrast = contrastRatio(hex, background);
    if (contrast > maxContrast) {
      best = hex;
      maxContrast = contrast;
    }
  }
  return best;
}

/**
 * Soft role for comment/property: text hue, desaturated, lightest L that still
 * hits AA against the canvas (mirrors brand --text-muted behaviour).
 */
export function fitMutedAgainstBackground(background: string, text: string) {
  const { h, s, l } = hexToHsl(text);
  const desaturated = Math.max(18, Math.min(45, s * 0.42));
  const preferred = Math.min(55, Math.max(28, l * 0.85));
  return fitHueAgainstBackground(background, h, desaturated, preferred);
}

/** Darker same-hue text for ~10% tinted fills (cards / CTAs). */
export function fitTextOnTint(background: string, text: string) {
  const tint = mixHex(text, background, 0.1);
  const { h, s, l } = hexToHsl(text);
  return fitHueAgainstBackground(tint, h, Math.min(100, s), Math.max(12, l * 0.72));
}

function pairPassesMutedRoles(bg: string, text: string) {
  const muted = fitMutedAgainstBackground(bg, text);
  return contrastRatio(muted, bg) >= MUTED_MIN_CONTRAST;
}

export function getRandomAccessiblePair(): AccessibleColorPair {
  let aaFallback: AccessibleColorPair | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const bg = randomHex(8, 92);
    const text = randomHex(4, 96);
    const body = contrastRatio(bg, text);
    if (body < WCAG_AA_CONTRAST) {
      continue;
    }
    if (!pairPassesMutedRoles(bg, text)) {
      continue;
    }
    if (body >= WCAG_AAA_PREFER) {
      return { bg, text };
    }
    if (!aaFallback) {
      aaFallback = { bg, text };
    }
  }

  return aaFallback ?? INNER_BRAND_PAIR;
}
