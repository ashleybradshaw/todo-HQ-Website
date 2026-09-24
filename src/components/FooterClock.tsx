"use client";

import { useEffect, useState } from "react";

const LONDON_TZ = "Europe/London";

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  timeZone: LONDON_TZ,
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const TIME_FMT = new Intl.DateTimeFormat("en-GB", {
  timeZone: LONDON_TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function londonClockParts(now: Date) {
  const date = DATE_FMT.format(now);
  const parts = TIME_FMT.formatToParts(now);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return { date, hour, minute };
}

/** Tiny client island — London clock (minute precision, blinking colon). */
export function FooterClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (!cancelled) setNow(new Date());
    };
    const boot = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 60_000);
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

  const { date, hour, minute } = londonClockParts(now);

  return (
    <time
      className="text-foreground/70 tabular-nums"
      dateTime={now.toISOString()}
    >
      {date}, {hour}
      <span className="footer-clock-colon" aria-hidden="true">
        :
      </span>
      {minute}
    </time>
  );
}
