"use client";

import { useEffect, useState } from "react";

export type IdeBootPhase = "frame" | "tabs" | "content" | "done";

const STORAGE_KEY = "todo-ide-boot-v1";

const FRAME_MS = 500;
const TABS_MS = 200;
const CONTENT_MS = 700;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hasBootedThisSession(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}

function markBooted(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* private mode — ignore */
  }
}

/**
 * Once-per-session IDE assemble. SSR + first paint use `frame` (content hidden)
 * so hydration matches; timers then jump to `done` or run the sequence.
 */
export function useIdeBoot(): IdeBootPhase {
  const [phase, setPhase] = useState<IdeBootPhase>("frame");

  useEffect(() => {
    const timers: number[] = [];
    let cancelled = false;

    const run = () => {
      if (cancelled) return;

      if (prefersReducedMotion() || hasBootedThisSession()) {
        setPhase("done");
        return;
      }

      setPhase("frame");

      timers.push(
        window.setTimeout(() => {
          if (!cancelled) setPhase("tabs");
        }, FRAME_MS),
      );
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) setPhase("content");
        }, FRAME_MS + TABS_MS),
      );
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setPhase("done");
          markBooted();
        }, FRAME_MS + TABS_MS + CONTENT_MS),
      );
    };

    // Defer past effect body so setState is not synchronous-in-effect.
    timers.push(window.setTimeout(run, 0));

    return () => {
      cancelled = true;
      for (const id of timers) window.clearTimeout(id);
    };
  }, []);

  return phase;
}
