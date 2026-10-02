import type { MediaRatio } from "@/lib/projects";

/**
 * Spray-safe stand-in still. Fills use currentColor so they track --foreground.
 * Used whenever a project media/card src is under /work/placeholders/ (sentinel path).
 */

type PlaceholderStillProps = {
  ratio: MediaRatio;
  /** Card thumbs crop; essay frames show the full composition. */
  fit?: "meet" | "slice";
};

const VIEWBOX: Record<MediaRatio, string> = {
  "16:9": "0 0 1600 900",
  "4:5": "0 0 1000 1250",
  "1:1": "0 0 1000 1000",
};

export function PlaceholderStill({
  ratio,
  fit = "meet",
}: PlaceholderStillProps) {
  return (
    <svg
      viewBox={VIEWBOX[ratio]}
      preserveAspectRatio={fit === "slice" ? "xMidYMid slice" : "xMidYMid meet"}
      className="h-full w-full text-foreground"
      aria-hidden="true"
    >
      {ratio === "16:9" ? <LandscapeArt /> : null}
      {ratio === "4:5" ? <PortraitArt /> : null}
      {ratio === "1:1" ? <SquareArt /> : null}
    </svg>
  );
}

function LandscapeArt() {
  return (
    <>
      <rect width="1600" height="900" fill="currentColor" fillOpacity="0.06" />
      <rect
        x="72"
        y="64"
        width="1456"
        height="772"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="2"
      />
      <path
        d="M72 560H1528"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="2"
      />
      <rect x="120" y="620" width="460" height="20" fill="currentColor" fillOpacity="0.5" />
      <rect x="120" y="660" width="300" height="12" fill="currentColor" fillOpacity="0.22" />
      <rect
        x="1080"
        y="140"
        width="340"
        height="280"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
    </>
  );
}

function PortraitArt() {
  return (
    <>
      <rect width="1000" height="1250" fill="currentColor" fillOpacity="0.06" />
      <rect
        x="72"
        y="72"
        width="856"
        height="1106"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="2"
      />
      <rect x="128" y="148" width="744" height="292" fill="currentColor" fillOpacity="0.1" />
      <rect x="128" y="500" width="460" height="16" fill="currentColor" fillOpacity="0.45" />
      <rect x="128" y="536" width="300" height="12" fill="currentColor" fillOpacity="0.2" />
      <rect
        x="128"
        y="620"
        width="744"
        height="460"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="2"
      />
    </>
  );
}

function SquareArt() {
  return (
    <>
      <rect width="1000" height="1000" fill="currentColor" fillOpacity="0.06" />
      <rect
        x="80"
        y="80"
        width="840"
        height="840"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="2"
      />
      <rect
        x="220"
        y="220"
        width="560"
        height="560"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      <path
        d="M500 220V780M220 500H780"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
    </>
  );
}
