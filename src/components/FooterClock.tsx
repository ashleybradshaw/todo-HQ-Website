"use client";

import { useEffect, useState } from "react";

const LONDON_FMT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/** Tiny client island — London clock only. */
export function FooterClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (!cancelled) setNow(new Date());
    };
    const boot = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      cancelled = true;
      window.clearTimeout(boot);
      window.clearInterval(id);
    };
  }, []);

  if (!now) {
    return (
      <span className="text-foreground/70 tabular-nums" aria-hidden="true">
        —
      </span>
    );
  }

  return (
    <time
      className="text-foreground/70 tabular-nums"
      dateTime={now.toISOString()}
    >
      {LONDON_FMT.format(now)}
    </time>
  );
}
