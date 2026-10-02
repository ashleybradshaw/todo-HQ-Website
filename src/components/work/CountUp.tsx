"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type CountUpProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  /** display = card headline; stat = case-page row; literal = JetBrains. */
  variant: "display" | "stat" | "literal";
  className?: string;
};

function formatMetric(prefix: string, value: number, suffix: string) {
  return `${prefix}${value}${suffix}`;
}

function visibleRatio(rect: DOMRect) {
  const visible =
    Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  if (rect.height <= 0) return 0;
  return visible / rect.height;
}

/**
 * Counts 0 → value over 400ms the first time it scrolls into view.
 * Already in view on mount, reduced motion, and the first paint all stay on the final value.
 */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  variant,
  className,
}: CountUpProps) {
  const [display, setDisplay] = useState(value);
  const rootRef = useRef<HTMLSpanElement>(null);
  const finalText = formatMetric(prefix, value, suffix);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (visibleRatio(root.getBoundingClientRect()) >= 0.4) return;

    let frame = 0;
    let started = false;
    let cancelled = false;
    setDisplay(0);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || started || cancelled) return;
        started = true;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          if (cancelled) return;
          const t = Math.min(1, (now - start) / 400);
          setDisplay(Math.round(value * t));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(root);
    return () => {
      cancelled = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span
      ref={rootRef}
      className={cn(
        "inline-grid tabular-nums",
        variant === "stat"
          ? "type-heading work-stat-figure text-syn-number"
          : variant === "display"
            ? "type-heading text-syn-number"
            : "font-jetbrains text-syn-number",
        className,
      )}
    >
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">
        {finalText}
      </span>
      <span data-countup="" className="col-start-1 row-start-1">
        {formatMetric(prefix, display, suffix)}
      </span>
    </span>
  );
}
