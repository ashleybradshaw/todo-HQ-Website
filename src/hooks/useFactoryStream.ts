"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const STREAM_MS = 900;

export function useFactoryStream() {
  const reduceMotion = useReducedMotion();
  const [tick, setTick] = useState(reduceMotion ? 10 : 1);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const id = window.setInterval(() => {
      setTick((current) => current + 1);
    }, STREAM_MS);

    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const count = reduceMotion ? 10 : tick;
  const agents = 3 + ((1 + Math.floor(count / 4)) % 3);
  const sprint = (["READYGO", "REPDAILY", "CONTENTIC"] as const)[
    Math.floor(count / 5) % 3
  ];

  return { agents, sprint, tick: count };
}
