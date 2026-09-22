import type { CSSProperties } from "react";

/**
 * DIAGNOSIS — dial back after Ashley skim.
 * Loud grain for live review; restore quieter defaults when signed off.
 */
const GRAIN_SIZE_PX = 5;
const GRAIN_DENSITY = 1;
const GRAIN_OPACITY = 0.32;
const GRAIN_DURATION = "0.65s";

const GRAIN_IMAGE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${GRAIN_SIZE_PX}' height='${GRAIN_SIZE_PX}'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${GRAIN_DENSITY}' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export function NoiseOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 select-none mix-blend-overlay overflow-hidden"
      style={
        {
          /* DIAGNOSIS — dial back after Ashley skim */
          "--hq-grain-size": `${GRAIN_SIZE_PX}px`,
          "--hq-grain-opacity": GRAIN_OPACITY,
          "--hq-grain-density": GRAIN_DENSITY,
          "--hq-grain-duration": GRAIN_DURATION,
        } as CSSProperties
      }
    >
      {/* Thin Spray-safe tint — strength lives in the mix, not a second opacity. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--foreground) 25%, transparent)",
        }}
      />
      <div
        className="noise-overlay-grain pointer-events-none"
        style={{
          backgroundImage: GRAIN_IMAGE,
          backgroundSize:
            "var(--hq-grain-size, 5px) var(--hq-grain-size, 5px)",
        }}
      />
    </div>
  );
}
