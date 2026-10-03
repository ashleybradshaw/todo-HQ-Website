import type { Contributions } from "@/lib/contributions";

const CELL = 10;
const GAP = 1;
const STEP = CELL + GAP;

const LEVEL_FILL = [
  "none",
  "color-mix(in srgb, var(--foreground) 15%, var(--background))",
  "color-mix(in srgb, var(--foreground) 35%, var(--background))",
  "color-mix(in srgb, var(--foreground) 60%, var(--background))",
  "color-mix(in srgb, var(--foreground) 100%, var(--background))",
] as const;

function utcDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/** Monday of the week that contains `date`. */
function startOfWeekMonday(date: Date) {
  const day = date.getUTCDay();
  const delta = day === 0 ? 6 : day - 1;
  return addUtcDays(date, -delta);
}

function levelFor(count: number) {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 8) return 3;
  return 4;
}

function formatUk(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(utcDate(iso));
}

function graphLabel(contributions: Contributions) {
  const total = contributions.days.reduce((sum, day) => sum + day.count, 0);
  const range = `${formatUk(contributions.from)} to ${formatUk(contributions.to)}`;
  if (contributions.source === "test") {
    return `Sample data from ${range}, ${total} marks. Not commits.`;
  }
  return `${total} contributions from ${range}.`;
}

/** Footer legend. Test data stays labelled as factory activity. */
export function contributionLegend(source: Contributions["source"]) {
  return source === "test" ? "// factory activity" : "contributions";
}

function WeekGrid({
  weeks,
  counts,
  to,
  className,
}: {
  weeks: number;
  counts: ReadonlyMap<string, number>;
  to: string;
  className: string;
}) {
  const lastMonday = startOfWeekMonday(utcDate(to));
  const firstMonday = addUtcDays(lastMonday, -(weeks - 1) * 7);
  const width = weeks * STEP - GAP;
  const height = 7 * STEP - GAP;
  const rects = [];

  for (let column = 0; column < weeks; column += 1) {
    for (let row = 0; row < 7; row += 1) {
      const date = isoDate(addUtcDays(firstMonday, column * 7 + row));
      const count = date <= to ? (counts.get(date) ?? 0) : 0;
      const level = levelFor(count);
      rects.push(
        <rect
          key={date}
          data-date={date}
          data-level={level}
          x={column * STEP}
          y={row * STEP}
          width={CELL}
          height={CELL}
          fill={LEVEL_FILL[level]}
          stroke={level === 0 ? "var(--border-ide)" : "none"}
          strokeWidth={level === 0 ? 1 : 0}
        />,
      );
    }
  }

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      preserveAspectRatio="xMaxYMid meet"
      overflow="hidden"
      className={className}
    >
      {rects}
    </svg>
  );
}

/**
 * Flat contribution grid. Server-rendered SVG, no client JS.
 * The series is right-aligned: the week of `to` is the last column,
 * and weeks before the project starts stay empty cells.
 */
export function ContributionGraph({
  contributions,
  variant = "flat",
}: {
  contributions: Contributions;
  variant?: "flat";
}) {
  const counts = new Map(
    contributions.days.map((day) => [day.date, day.count] as const),
  );

  return (
    <div
      data-contribution-graph=""
      data-variant={variant}
      role="img"
      aria-label={graphLabel(contributions)}
      className="mx-6 overflow-hidden py-4"
    >
      <WeekGrid
        weeks={26}
        counts={counts}
        to={contributions.to}
        className="block h-auto w-full sm:hidden"
      />
      <WeekGrid
        weeks={52}
        counts={counts}
        to={contributions.to}
        className="hidden h-auto w-full sm:block"
      />
    </div>
  );
}
