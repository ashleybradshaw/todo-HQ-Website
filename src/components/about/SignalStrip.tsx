"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { aboutPage } from "@/content/pages/about";
import { cn } from "@/lib/cn";

const COUNT_MS = 900;

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

function formatValue(value: number, decimals: number) {
  if (decimals > 0) {
    return value.toFixed(decimals);
  }
  return String(Math.round(value));
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
  const [display, setDisplay] = useState(figure);
  const startedRef = useRef(false);
  const elRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const parsed = parseFigure(figure);
    if (!parsed || reduceMotion) {
      setDisplay(figure);
      return;
    }

    setDisplay(`${parsed.prefix}0${parsed.suffix}`);
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

      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / COUNT_MS);
        const eased = easeOutCubic(t);
        const current = parsed.value * eased;
        setDisplay(
          `${parsed.prefix}${formatValue(current, parsed.decimals)}${parsed.suffix}`,
        );
        if (t < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          setDisplay(figure);
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

/** Paper ledger — 3 STAT_MOCKS cells. Floor placeholder parked. */
export function SignalStrip() {
  return (
    <section
      aria-label="Factory signals"
      className="relative left-1/2 mt-16 w-screen -translate-x-1/2 border-y border-border-ide bg-background text-foreground"
    >
      <div className="mx-auto grid max-w-[1336px] grid-cols-1 px-6 py-10 sm:grid-cols-3 sm:py-14">
        {aboutPage.stats.map((stat, index) => (
          <div
            key={stat.figure}
            className={cn(
              "border-t border-border-ide py-8 sm:px-6",
              index === 0 ? "sm:pl-0" : undefined,
              index === aboutPage.stats.length - 1 ? "sm:pr-0" : undefined,
            )}
          >
            <StatCountUp
              figure={stat.figure}
              className="font-[family-name:var(--font-unbounded)] text-[40px] leading-none font-bold tracking-tight sm:text-[48px] lg:text-[56px]"
            />
            <p className="type-body mt-4 text-foreground/80">{stat.label}</p>
            {stat.source ? (
              <p className="type-label mt-3 text-syn-comment">{stat.source}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
