"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { HelixSpinner } from "@/components/ide/HelixSpinner";
import {
  LIVE_FLOOR_SIM,
  aboutPage,
  type LiveFloorFormat,
  type LiveFloorMetric,
} from "@/content/pages/about";
import { cn } from "@/lib/cn";

const COUNT_MS = 900;
const TICK_MS = 2000;
const HELIX_SIZE_PX = 32;

type ParsedFigure = {
  prefix: string;
  value: number;
  decimals: number;
  suffix: string;
};

function parseFigure(figure: string): ParsedFigure | null {
  const match = figure.match(/^(.*?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) {
    return null;
  }
  const raw = match[2].replace(/,/g, "");
  const decimals = raw.includes(".") ? (raw.split(".")[1]?.length ?? 0) : 0;
  return {
    prefix: match[1],
    value: Number(raw),
    decimals,
    suffix: match[3],
  };
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function formatCountValue(value: number, decimals: number) {
  if (decimals > 0) {
    return value.toFixed(decimals);
  }
  return String(Math.round(value));
}

function midValue(metric: LiveFloorMetric) {
  return Math.round((metric.min + metric.max) / 2);
}

function formatMetricValue(value: number, format: LiveFloorFormat) {
  const n = Math.round(value);
  if (format === "int") {
    return String(n);
  }
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m >= 10 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 1_000) {
    const k = n / 1_000;
    return `${k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(n);
}

function seedValues(stable: boolean): Record<string, number> {
  const out: Record<string, number> = {};
  for (const metric of LIVE_FLOOR_SIM) {
    out[metric.id] = stable
      ? midValue(metric)
      : metric.min + Math.round(Math.random() * (metric.max - metric.min));
  }
  return out;
}

/** Mid-range snapshot for prefers-reduced-motion (no tick). */
const STABLE_FLOOR_VALUES = seedValues(true);

function walkValue(current: number, metric: LiveFloorMetric) {
  const delta = (Math.random() * 2 - 1) * metric.step;
  const next = current + delta;
  return Math.min(metric.max, Math.max(metric.min, next));
}

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function StatCountUp({ figure, className }: { figure: string; className?: string }) {
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );
  const [liveDisplay, setLiveDisplay] = useState(figure);
  const startedRef = useRef(false);
  const elRef = useRef<HTMLParagraphElement | null>(null);
  const display = reduceMotion ? figure : liveDisplay;

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const parsed = parseFigure(figure);
    if (!parsed) {
      return;
    }

    startedRef.current = false;

    const el = elRef.current;
    if (!el) {
      return;
    }

    let raf = 0;
    let observer: IntersectionObserver | null = null;

    const run = () => {
      if (startedRef.current) {
        return;
      }
      startedRef.current = true;
      observer?.disconnect();

      setLiveDisplay(`${parsed.prefix}0${parsed.suffix}`);
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / COUNT_MS);
        const eased = easeOutCubic(t);
        const current = parsed.value * eased;
        setLiveDisplay(
          `${parsed.prefix}${formatCountValue(current, parsed.decimals)}${parsed.suffix}`,
        );
        if (t < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          setLiveDisplay(figure);
        }
      };
      raf = requestAnimationFrame(tick);
    };

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          run();
        }
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.35 },
    );
    observer.observe(el);

    return () => {
      observer?.disconnect();
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, [figure, reduceMotion]);

  return (
    <p ref={elRef} className={className}>
      {display}
    </p>
  );
}

function FloorSimPanel() {
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );
  const [liveValues, setLiveValues] = useState(STABLE_FLOOR_VALUES);
  const values = reduceMotion ? STABLE_FLOOR_VALUES : liveValues;

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    let boot = 0;
    boot = requestAnimationFrame(() => {
      setLiveValues(seedValues(false));
    });

    const id = window.setInterval(() => {
      setLiveValues((prev) => {
        const next: Record<string, number> = { ...prev };
        for (const metric of LIVE_FLOOR_SIM) {
          next[metric.id] = walkValue(prev[metric.id] ?? midValue(metric), metric);
        }
        return next;
      });
    }, TICK_MS);

    return () => {
      cancelAnimationFrame(boot);
      window.clearInterval(id);
    };
  }, [reduceMotion]);

  return (
    <div className="border border-border-ide bg-background p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-border-ide pb-4">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="type-label">{"// FLOOR SIM"}</p>
          <p className="type-label text-syn-string">LIVE</p>
        </div>
        <HelixSpinner
          style={{ ["--helix-size" as string]: `${HELIX_SIZE_PX}px` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2">
        {LIVE_FLOOR_SIM.map((metric, index) => {
          const value = values[metric.id] ?? midValue(metric);
          const odd = index % 2 === 1;
          return (
            <div
              key={metric.id}
              className={cn(
                "border-t border-border-ide py-3",
                odd ? "pl-4 sm:pl-5" : "pr-4 sm:pr-5",
              )}
            >
              <p className="type-label text-syn-comment">{metric.label}</p>
              <p className="type-heading mt-1 tabular-nums tracking-tight">
                {formatMetricValue(value, metric.format)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Paper floor ledger — stacked STAT_MOCKS + // FLOOR SIM live panel. */
export function SignalStrip() {
  return (
    <section
      aria-label="Factory floor ledger"
      className="relative left-1/2 mt-16 w-screen -translate-x-1/2 border-y border-border-ide bg-background text-foreground"
    >
      <div className="mx-auto grid max-w-[1336px] grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-12 lg:gap-12 lg:py-14">
        <div className="flex flex-col lg:col-span-5">
          {aboutPage.stats.map((stat) => (
            <div
              key={stat.figure}
              className="border-t border-border-ide py-6 first:border-t-0 first:pt-0"
            >
              <StatCountUp
                figure={stat.figure}
                className="font-[family-name:var(--font-unbounded)] text-[40px] leading-none font-bold tracking-tight sm:text-[48px] lg:text-[52px]"
              />
              <p className="type-body mt-3 text-foreground/80">{stat.label}</p>
              {stat.source ? (
                <p className="type-label mt-2 text-syn-comment">{stat.source}</p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="lg:col-span-7">
          <FloorSimPanel />
        </div>
      </div>
    </section>
  );
}
