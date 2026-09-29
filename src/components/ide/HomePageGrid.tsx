import { HOME_FRAME } from "@/components/ide/homeFrame";

const lineColor =
  "color-mix(in srgb, var(--foreground) 10%, transparent)";
const hairlineColor =
  "color-mix(in srgb, var(--foreground) 22%, transparent)";
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
 * Decorative page grid for /home — below nav, above footer.
 * Verticals stop at the IDE window (no lines through the frame).
 * Crosshairs only at the hero/strip join — not at strip bottom / IDE.
 */
export function HomePageGrid() {
  return (
    <div
      data-home-grid
      className="pointer-events-none absolute inset-x-0 top-[var(--site-header-offset)] bottom-0 z-0 overflow-hidden text-foreground"
      aria-hidden="true"
    >
      <div className={`${HOME_FRAME} relative h-full`}>
        {/* Verticals above the shared hero/strip join */}
        <span
          className="absolute top-0 left-6 w-px"
          style={{
            height: "var(--home-hero-rule-top, var(--home-strip-top, 0px))",
            backgroundColor: lineColor,
          }}
        />
        <span
          className="absolute top-0 right-6 w-px"
          style={{
            height: "var(--home-hero-rule-top, var(--home-strip-top, 0px))",
            backgroundColor: lineColor,
          }}
        />
        {/* Verticals: strip bottom → IDE top (plain gap has no frame) */}
        <span
          className="absolute left-6 w-px"
          style={{
            top: "var(--home-strip-bottom, 100%)",
            height:
              "max(0px, calc(var(--home-ide-top, 100%) - var(--home-strip-bottom, 100%)))",
            backgroundColor: lineColor,
          }}
        />
        <span
          className="absolute right-6 w-px"
          style={{
            top: "var(--home-strip-bottom, 100%)",
            height:
              "max(0px, calc(var(--home-ide-top, 100%) - var(--home-strip-bottom, 100%)))",
            backgroundColor: lineColor,
          }}
        />
        {/* Verticals below IDE */}
        <span
          className="absolute bottom-0 left-6 w-px"
          style={{
            top: "var(--home-ide-bottom, 100%)",
            backgroundColor: lineColor,
          }}
        />
        <span
          className="absolute bottom-0 right-6 w-px"
          style={{
            top: "var(--home-ide-bottom, 100%)",
            backgroundColor: lineColor,
          }}
        />

        {/* Shared hero-bottom / strip-top hairline */}
        <span
          className="absolute right-6 left-6 h-px"
          style={{
            top: "var(--home-hero-rule-top, var(--home-strip-top, 0px))",
            backgroundColor: hairlineColor,
          }}
        />

        <Crosshair
          side="left"
          topVar="var(--home-hero-rule-top, var(--home-strip-top, 0px))"
        />
        <Crosshair
          side="right"
          topVar="var(--home-hero-rule-top, var(--home-strip-top, 0px))"
        />
      </div>
    </div>
  );
}
