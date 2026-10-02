"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type CountUpProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  /** display = Unbounded headline; literal = JetBrains code number. */
  variant: "display" | "literal";
  className?: string;
};

function formatMetric(prefix: string, value: number, suffix: string) {
  return `${prefix}${value}${suffix}`;
}

/**
 * Counts from 0 to value over 400ms the first time it enters view.
 * SSR, the first client render, and reduced motion all show the final value.
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

    let frame = 0;
    let started = false;
    let cancelled = false;

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
        setDisplay(0);
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
        variant === "display"
          ? "type-subhead text-syn-number"
          : "font-jetbrains text-syn-number",
        className,
      )}
    >
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">
        {finalText}
      </span>
      <span className="col-start-1 row-start-1">
        {formatMetric(prefix, display, suffix)}
      </span>
    </span>
  );
}
