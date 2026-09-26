"use client";

import { useEffect, useState } from "react";

const STREAM_MS = 900;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useFactoryStream() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [tick, setTick] = useState(1);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const boot = window.setTimeout(() => {
      setReduceMotion(reduced);
      if (reduced) setTick(10);
    }, 0);

    if (reduced) {
      return () => window.clearTimeout(boot);
    }

    const id = window.setInterval(() => {
      setTick((current) => current + 1);
    }, STREAM_MS);

    return () => {
      window.clearTimeout(boot);
      window.clearInterval(id);
    };
  }, []);

  const count = reduceMotion ? 10 : tick;
  const agents = 3 + ((1 + Math.floor(count / 4)) % 3);

  return { agents };
}
