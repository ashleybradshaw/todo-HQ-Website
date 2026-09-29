import { HOME_FRAME } from "@/components/ide/homeFrame";

/** Unified page-grid + IDE hairline — 18% keeps hero verticals from fighting HeroFlowField. */
const HAIRLINE =
  "color-mix(in srgb, var(--foreground) 18%, transparent)";
const CROSS =
  "color-mix(in srgb, var(--foreground) 12%, transparent)";

/**
 * Pixel-snapped crosshair — 12×12 host, 1px arms, integer offsets (no 50% translate blur).
 */
function Crosshair({
  side,
  topVar,
}: {
  side: "left" | "right";
  topVar: string;
}) {
  const sideStyle =
    side === "left"
      ? { left: "calc(1.5rem - 6px)" as const }
      : { right: "calc(1.5rem - 6px)" as const };

  return (
    <span
      className="absolute size-3"
      style={{
        ...sideStyle,
        top: `calc(${topVar} - 6px)`,
      }}
    >
      <span
        className="absolute top-[5px] left-0 h-px w-full"
        style={{ backgroundColor: CROSS }}
      />
      <span
        className="absolute top-0 left-[5px] h-full w-px"
        style={{ backgroundColor: CROSS }}
      />
    </span>
  );
}

/**
 * Decorative page grid for /home — below nav, above footer.
 * Continuous L/R verticals are the IDE window sides (same 18% hairline).
 * Crosshairs only at the hero/strip join.
 */
export function HomePageGrid() {
  return (
    <div
      data-home-grid
      className="pointer-events-none absolute inset-x-0 top-[var(--site-header-offset)] bottom-0 z-0 overflow-hidden text-foreground"
      aria-hidden="true"
    >
      <div className={`${HOME_FRAME} relative h-full`}>
        {/* Continuous verticals — hero through IDE to footer */}
        <span
          className="absolute inset-y-0 left-6 w-px"
          style={{ backgroundColor: HAIRLINE }}
        />
        <span
          className="absolute inset-y-0 right-6 w-px"
          style={{ backgroundColor: HAIRLINE }}
        />

        {/* Shared hero-bottom / strip-top hairline */}
        <span
          className="absolute right-6 left-6 h-px"
          style={{
            top: "var(--home-hero-rule-top, var(--home-strip-top, 0px))",
            backgroundColor: HAIRLINE,
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
