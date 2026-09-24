/** Shared HQ gateway field colours — StippleField (+ accent for hawk shader). */

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

export type GatewayTone = (typeof GATEWAY_TONES)[number];
