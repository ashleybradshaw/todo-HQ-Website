import type { ReactNode } from "react";
import type { Contributions } from "@/lib/contributions";

const LEVEL_FILL = [
  "color-mix(in srgb, var(--foreground) 7%, transparent)",
  "color-mix(in srgb, var(--foreground) 30%, transparent)",
  "color-mix(in srgb, var(--foreground) 55%, transparent)",
  "color-mix(in srgb, var(--foreground) 80%, transparent)",
  "color-mix(in srgb, var(--foreground) 100%, transparent)",
] as const;

const GAP = 1;

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

function weekSpan(startMonday: Date, endMonday: Date) {
  return (
    Math.round((endMonday.getTime() - startMonday.getTime()) / (7 * 86_400_000)) +
    1
  );
}

function mondaysFrom(start: Date, count: number) {
  return Array.from({ length: count }, (_, index) => addUtcDays(start, index * 7));
}

type WeekColumn = {
  kind: "week";
  monday: string;
  mode: "build" | "recent" | "open";
};

type GapColumn = { kind: "gap" };

type Column = WeekColumn | GapColumn;

function columnsFor(contributions: Contributions, weeks: number): Column[] {
  const buildTo = contributions.buildTo;
  if (buildTo == null) {
    const last = startOfWeekMonday(utcDate(contributions.to));
    return mondaysFrom(addUtcDays(last, -(weeks - 1) * 7), weeks).map(
      (monday) => ({
        kind: "week",
        monday: isoDate(monday),
        mode: "open",
      }),
    );
  }

  const buildMax = weeks >= 52 ? 16 : 8;
  const buildStart = startOfWeekMonday(utcDate(contributions.from));
  const buildEnd = startOfWeekMonday(utcDate(buildTo));
  const buildCount = Math.min(buildMax, Math.max(1, weekSpan(buildStart, buildEnd)));
  const recentCount = weeks - 1 - buildCount;
  const recentLast = startOfWeekMonday(utcDate(contributions.to));
  const build = mondaysFrom(buildStart, buildCount).map(
    (monday): WeekColumn => ({
      kind: "week",
      monday: isoDate(monday),
      mode: "build",
    }),
  );
  const recent = mondaysFrom(
    addUtcDays(recentLast, -(recentCount - 1) * 7),
    recentCount,
  ).map(
    (monday): WeekColumn => ({
      kind: "week",
      monday: isoDate(monday),
      mode: "recent",
    }),
  );

  return [...build, { kind: "gap" }, ...recent];
}

function countOn(
  date: string,
  mode: WeekColumn["mode"],
  contributions: Contributions,
  counts: ReadonlyMap<string, number>,
) {
  if (date < contributions.from || date > contributions.to) return 0;
  const buildTo = contributions.buildTo;
  if (mode === "build" && buildTo != null && date > buildTo) return 0;
  if (mode === "recent" && buildTo != null && date <= buildTo) return 0;
  return counts.get(date) ?? 0;
}

function graphLabel(
  contributions: Contributions,
  columns: readonly Column[],
  counts: ReadonlyMap<string, number>,
) {
  const gap = columns.some((column) => column.kind === "gap");
  const weeks = columns.filter((column): column is WeekColumn => column.kind === "week");
  let total = 0;
  const seen = new Set<string>();

  if (!gap) {
    total = contributions.days.reduce((sum, day) => sum + day.count, 0);
    const range = `${formatUk(contributions.from)} to ${formatUk(contributions.to)}`;
    if (contributions.source === "test") {
      return `Sample data from ${range}, ${total} marks. Not commits.`;
    }
    return `${total} contributions from ${range}.`;
  }

  const buildWeeks = weeks.filter((column) => column.mode === "build");
  const recentWeeks = weeks.filter((column) => column.mode === "recent");
  const buildFrom = contributions.from;
  const buildTo =
    contributions.buildTo ??
    isoDate(addUtcDays(utcDate(buildWeeks.at(-1)?.monday ?? contributions.to), 6));
  const buildEnd = isoDate(addUtcDays(utcDate(buildWeeks.at(-1)?.monday ?? buildTo), 6));
  const shownBuildTo = buildEnd < buildTo ? buildEnd : buildTo;
  const recentFrom = recentWeeks[0]?.monday ?? contributions.to;

  for (const column of weeks) {
    for (let row = 0; row < 7; row += 1) {
      const date = isoDate(addUtcDays(utcDate(column.monday), row));
      if (seen.has(date)) continue;
      seen.add(date);
      total += countOn(date, column.mode, contributions, counts);
    }
  }

  const buildRange = `${formatUk(buildFrom)} to ${formatUk(shownBuildTo)}`;
  const recentRange = `${formatUk(recentFrom)} to ${formatUk(contributions.to)}`;
  if (contributions.source === "test") {
    return `Sample data from ${buildRange}, and from ${recentRange}, ${total} marks. Not commits.`;
  }
  return `${total} contributions from ${buildRange}, and from ${recentRange}.`;
}

/** Footer legend. Test data stays labelled as factory activity. */
export function contributionLegend(source: Contributions["source"]) {
  return source === "test" ? "// factory activity" : "contributions";
}

function WeekGrid({
  contributions,
  counts,
  weeks,
  cell,
  className,
}: {
  contributions: Contributions;
  counts: ReadonlyMap<string, number>;
  weeks: number;
  cell: number;
  className: string;
}) {
  const columns = columnsFor(contributions, weeks);
  const step = cell + GAP;
  const width = columns.length * cell + (columns.length - 1) * GAP;
  const height = 7 * cell + 6 * GAP;
  const nodes: ReactNode[] = [];

  columns.forEach((column, index) => {
    const x = index * step;
    if (column.kind === "gap") {
      nodes.push(
        <text
          key="gap"
          data-axis-gap=""
          aria-hidden="true"
          x={x + cell / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={9}
          fontFamily="var(--font-jetbrains), ui-monospace, monospace"
        >
          {"// …"}
        </text>,
      );
      return;
    }

    for (let row = 0; row < 7; row += 1) {
      const date = isoDate(addUtcDays(utcDate(column.monday), row));
      const count = countOn(date, column.mode, contributions, counts);
      const level = levelFor(count);
      nodes.push(
        <rect
          key={`${column.mode}-${date}`}
          data-date={date}
          data-level={level}
          x={x}
          y={row * step}
          width={cell}
          height={cell}
          fill={LEVEL_FILL[level]}
        />,
      );
    }
  });

  return (
    <svg
      role="img"
      aria-label={graphLabel(contributions, columns, counts)}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      preserveAspectRatio="xMaxYMid meet"
      className={className}
    >
      {nodes}
    </svg>
  );
}

/**
 * Flat contribution grid. Server-rendered SVG, no client JS.
 * Shipped projects break the axis: build weeks, one gap, then the latest weeks.
 * A project still in build keeps one right-aligned series.
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
      className="mx-6 overflow-hidden py-4"
    >
      <WeekGrid
        contributions={contributions}
        counts={counts}
        weeks={26}
        cell={10}
        className="ml-auto block h-auto max-w-full sm:hidden"
      />
      <WeekGrid
        contributions={contributions}
        counts={counts}
        weeks={52}
        cell={12}
        className="ml-auto hidden h-auto max-w-full sm:block"
      />
    </div>
  );
}
