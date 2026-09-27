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
 * Decorative page grid for /home — below nav, above footer.
 * Verticals at content frame edges; crosshairs only at hero rule + strip hairlines.
 */
export function HomePageGrid() {
  return (
    <div
      data-home-grid
      className="pointer-events-none absolute inset-x-0 top-[var(--site-header-offset)] bottom-0 z-0 overflow-hidden text-foreground"
      aria-hidden="true"
    >
      <div className={`${HOME_FRAME} relative h-full`}>
        {/* Continuous verticals (gap through strip via shorter segments) */}
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

        {/* Hero bottom rule between verticals */}
        <span
          className="absolute right-6 left-6 h-px"
          style={{
            top: "var(--home-hero-rule-top, 0px)",
            backgroundColor: lineColor,
          }}
        />

        <Crosshair side="left" topVar="var(--home-hero-rule-top, 0px)" />
        <Crosshair side="right" topVar="var(--home-hero-rule-top, 0px)" />
        <Crosshair side="left" topVar="var(--home-strip-top, 0px)" />
        <Crosshair side="right" topVar="var(--home-strip-top, 0px)" />
        <Crosshair side="left" topVar="var(--home-strip-bottom, 100%)" />
        <Crosshair side="right" topVar="var(--home-strip-bottom, 100%)" />
      </div>
    </div>
  );
}
