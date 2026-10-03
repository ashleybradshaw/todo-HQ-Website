/**
 * Contribution series for the case-page graph.
 * The UI may import `getContributions` only. Swap that function for a
 * GitHub snapshot later; keep the return shape.
 */

export type ContributionDay = {
  date: string;
  count: number;
};

export type Contributions = {
  slug: string;
  source: "test" | "github-snapshot";
  from: string;
  to: string;
  buildTo?: string | null;
  days: readonly ContributionDay[];
  repos?: readonly string[];
  generatedAt: string;
};

/** Fixed build date so server and client cannot drift. */
const TEST_AS_OF = "2026-10-03";

/** 104 weeks, inclusive. */
const MAX_DAYS = 104 * 7;

type TestWindow = {
  from: string;
  /** Null while the project is still in build. */
  buildTo: string | null;
};

// TEST DATA, ASK Ashley to confirm these windows.
const TEST_WINDOWS: Record<string, TestWindow> = {
  /** 103 days in the first half of 2025, then support through the build date. */
  repdaily: { from: "2025-03-20", buildTo: "2025-06-30" },
  /** 12 weeks (84 inclusive days) ending on the build date. Still in build. */
  readygo: { from: "2026-07-12", buildTo: null },
  /**
   * 2024 build (4 March through 31 December), then support.
   * The 104-week cap clips the stored series to 6 October 2024.
   */
  contentic: { from: "2024-03-04", buildTo: "2024-12-31" },
};

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

function clipStart(from: string, to: string) {
  const start = utcDate(from);
  const end = utcDate(to);
  const span = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (span <= MAX_DAYS) return from;
  return isoDate(addUtcDays(end, -(MAX_DAYS - 1)));
}

function hashSlug(slug: string) {
  let hash = 2_166_136_261;
  for (let index = 0; index < slug.length; index += 1) {
    hash ^= slug.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let next = Math.imul(state ^ (state >>> 15), 1 | state);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function intBetween(rand: () => number, min: number, max: number) {
  return min + Math.floor(rand() * (max - min + 1));
}

function countForDay(
  rand: () => number,
  date: string,
  buildTo: string | null,
) {
  const inBuild = buildTo == null || date <= buildTo;
  if (!inBuild) {
    return rand() < 0.22 ? intBetween(rand, 1, 3) : 0;
  }

  const weekend = [0, 6].includes(utcDate(date).getUTCDay());
  if (weekend) {
    return rand() < 0.4 ? intBetween(rand, 1, 4) : 0;
  }
  return rand() < 0.85 ? intBetween(rand, 3, 12) : 0;
}

// TEST DATA: deterministic mulberry32 seeded by slug.
function testContributions(slug: string): Contributions | null {
  const window = TEST_WINDOWS[slug];
  if (!window) return null;

  const to = TEST_AS_OF;
  const from = clipStart(window.from, to);
  const rand = mulberry32(hashSlug(slug));
  const days: ContributionDay[] = [];
  let cursor = utcDate(from);
  const end = utcDate(to).getTime();

  while (cursor.getTime() <= end) {
    const date = isoDate(cursor);
    days.push({
      date,
      count: countForDay(rand, date, window.buildTo),
    });
    cursor = addUtcDays(cursor, 1);
  }

  return {
    slug,
    source: "test",
    from,
    to,
    buildTo: window.buildTo,
    days,
    generatedAt: TEST_AS_OF,
  };
}

/** Only data import the case-page UI may use. */
export function getContributions(slug: string): Contributions | null {
  return testContributions(slug);
}
