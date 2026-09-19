/** Shared HQ gateway field colours — StippleField + HawkAsciiField. */

export const GATEWAY_ACCENT = "#A78BFA";

/** Full ramp for ambient stipple (includes deep tones). */
export const GATEWAY_TONES = [
  "#2E2ECC",
  "#5C5CFF",
  "#8A8AFF",
  "#C6C6FF",
  "#DDDDFF",
  "#F0F0FF",
] as const;

/**
 * Hawk glyphs on #4545FF — light end only so marks read like FG #DDDDFF dither.
 * Skips murky deep navy that disappears into the page.
 */
export const HAWK_GLYPH_TONES = [
  "#8A8AFF",
  "#C6C6FF",
  "#DDDDFF",
  "#F0F0FF",
] as const;

export type GatewayTone = (typeof GATEWAY_TONES)[number];
