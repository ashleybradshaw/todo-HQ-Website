const GRAIN_DENSITY = 1;
const GRAIN_WIDTH_PX = 1;
const GRAIN_HEIGHT_PX = 1;
const GRAIN_OPACITY = 0.108;

const GRAIN_IMAGE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${GRAIN_WIDTH_PX}' height='${GRAIN_HEIGHT_PX}'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${GRAIN_DENSITY}' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export function NoiseOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 select-none mix-blend-overlay overflow-hidden"
    >
      <div
        className="noise-overlay-grain pointer-events-none"
        style={{
          opacity: GRAIN_OPACITY,
          backgroundImage: GRAIN_IMAGE,
          backgroundSize: `${GRAIN_WIDTH_PX}px ${GRAIN_HEIGHT_PX}px`,
        }}
      />
    </div>
  );
}
