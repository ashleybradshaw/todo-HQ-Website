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
  /**
   * After the count settles, nudge the visible digits by 1 to 3.
   * Stays within 2% of the real value. Screen readers use the static value outside this span.
   */
  live?: boolean;
};

function formatMetric(prefix: string, value: number, suffix: string) {
  return `${prefix}${value}${suffix}`;
}

function driftBounds(value: number) {
  return {
    min: Math.round(value * 0.98),
    max: Math.round(value * 1.02),
  };
}

function widestMetricText(prefix: string, value: number, suffix: string) {
  const { min, max } = driftBounds(value);
  const texts = [min, value, max].map((n) => formatMetric(prefix, n, suffix));
  return texts.reduce((widest, text) =>
    text.length > widest.length ? text : widest,
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function stepDrift(value: number, current: number) {
  const { min, max } = driftBounds(value);
  const step = 1 + Math.floor(Math.random() * 3);
  const sign = Math.random() < 0.5 ? -1 : 1;
  const forward = clamp(current + sign * step, min, max);
  if (forward !== current) return forward;
  const back = clamp(current - sign * step, min, max);
  if (back !== current) return back;
  if (current < max) return current + 1;
  if (current > min) return current - 1;
  return current;
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
  live = false,
}: CountUpProps) {
  const [display, setDisplay] = useState(value);
  const rootRef = useRef<HTMLSpanElement>(null);
  const finalText = formatMetric(prefix, value, suffix);
  const reserveText = live ? widestMetricText(prefix, value, suffix) : finalText;
  const reserveWidth = `${reserveText.length}ch`;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let driftTimer = 0;
    let started = false;
    let settled = false;
    let cancelled = false;
    let inView = visibleRatio(root.getBoundingClientRect()) >= 0.4;
    let pageVisible = !document.hidden;

    const stopDrift = () => {
      window.clearTimeout(driftTimer);
      driftTimer = 0;
    };

    const scheduleDrift = () => {
      stopDrift();
      if (cancelled || !live || !settled || !inView || !pageVisible) return;
      const wait = 4000 + Math.random() * 2000;
      driftTimer = window.setTimeout(() => {
        driftTimer = 0;
        if (cancelled || !inView || !pageVisible) return;
        setDisplay((current) => stepDrift(value, current));
        scheduleDrift();
      }, wait);
    };

    const markSettled = () => {
      settled = true;
      setDisplay(value);
      scheduleDrift();
    };

    const countObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || started || cancelled) return;
        started = true;
        countObserver.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          if (cancelled) return;
          const t = Math.min(1, (now - start) / 400);
          setDisplay(Math.round(value * t));
          if (t < 1) {
            frame = requestAnimationFrame(tick);
            return;
          }
          markSettled();
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    const viewObserver = new IntersectionObserver(
      (entries) => {
        inView = Boolean(entries[0]?.isIntersecting);
        if (!settled) return;
        if (inView && pageVisible) scheduleDrift();
        else stopDrift();
      },
      { threshold: 0 },
    );

    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (!settled) return;
      if (inView && pageVisible) scheduleDrift();
      else stopDrift();
    };

    if (live) {
      viewObserver.observe(root);
      document.addEventListener("visibilitychange", onVisibility);
    }

    if (inView) {
      markSettled();
    } else {
      setDisplay(0);
      countObserver.observe(root);
    }

    return () => {
      cancelled = true;
      stopDrift();
      countObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(frame);
    };
  }, [live, value]);

  return (
    <span
      ref={rootRef}
      aria-hidden={live ? true : undefined}
      className={cn(
        "inline-grid tabular-nums",
        variant === "stat"
          ? "type-heading work-stat-figure text-syn-number"
          : variant === "display"
            ? "type-heading text-syn-number"
            : "font-jetbrains text-syn-number",
        className,
      )}
      style={live ? { minWidth: reserveWidth } : undefined}
    >
      <span
        className="invisible col-start-1 row-start-1 tabular-nums"
        aria-hidden="true"
      >
        {reserveText}
      </span>
      <span
        data-countup=""
        className="col-start-1 row-start-1 tabular-nums"
        style={live ? { minWidth: reserveWidth } : undefined}
      >
        {formatMetric(prefix, display, suffix)}
      </span>
    </span>
  );
}
