import { HOME_FRAME } from "@/components/ide/homeFrame";

const lineColor =
  "color-mix(in srgb, var(--foreground) 10%, transparent)";
const crossColor =
  "color-mix(in srgb, var(--foreground) 12%, transparent)";

function Crosshair({
  side,
  topVar,
}: {
  side: "left" | "right";
  topVar: string;
}) {
  const sideStyle =
    side === "left"
      ? { left: "1.5rem" as const }
      : { right: "1.5rem" as const };

  return (
    <span
      className={`absolute size-3 -translate-y-1/2 ${
        side === "left" ? "-translate-x-1/2" : "translate-x-1/2"
      }`}
      style={{ ...sideStyle, top: topVar }}
    >
      <span
        className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2"
        style={{ backgroundColor: crossColor }}
      />
      <span
        className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2"
        style={{ backgroundColor: crossColor }}
      />
    </span>
  );
}

/**
 * Decorative page grid for /home.
 * Verticals gap through the feature strip so no grid line crosses strip copy.
 * Crosshairs only where verticals meet the strip’s own top/bottom hairlines.
 */
export function HomePageGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-[var(--site-header-offset)] bottom-0 z-0 overflow-hidden text-foreground"
      aria-hidden="true"
    >
      <div className={`${HOME_FRAME} relative h-full`}>
        {/* Verticals above the strip */}
        <span
          className="absolute top-0 left-6 w-px"
          style={{
            height: "var(--home-strip-top, 0px)",
            backgroundColor: lineColor,
          }}
        />
        <span
          className="absolute top-0 right-6 w-px"
          style={{
            height: "var(--home-strip-top, 0px)",
            backgroundColor: lineColor,
          }}
        />
        {/* Verticals below the strip */}
        <span
          className="absolute bottom-0 left-6 w-px"
          style={{
            top: "var(--home-strip-bottom, 100%)",
            backgroundColor: lineColor,
          }}
        />
        <span
          className="absolute bottom-0 right-6 w-px"
          style={{
            top: "var(--home-strip-bottom, 100%)",
            backgroundColor: lineColor,
          }}
        />

        <Crosshair side="left" topVar="var(--home-strip-top, 0px)" />
        <Crosshair side="right" topVar="var(--home-strip-top, 0px)" />
        <Crosshair side="left" topVar="var(--home-strip-bottom, 100%)" />
        <Crosshair side="right" topVar="var(--home-strip-bottom, 100%)" />
      </div>
    </div>
  );
}
