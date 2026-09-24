"use client";

import { useEffect, useState } from "react";

export type IdeBootPhase = "bones" | "tabs" | "content" | "done";

const STORAGE_KEY = "todo-ide-boot-v4";
const FORCE_KEY = "todo-ide-boot-force";
const REPLAY_EVENT = "todo-ide-boot-replay";

const BONES_MS = 750;
const TABS_MS = 140;
const CONTENT_MS = 560;

/** Set force flag + notify mounted `/home` to replay bones (logo / No / intro). */
export function requestIdeBootReplay(): void {
  try {
    sessionStorage.setItem(FORCE_KEY, "1");
  } catch {
    /* private mode */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(REPLAY_EVENT));
  }
}

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

function peekForceBoot(): boolean {
  try {
    return sessionStorage.getItem(FORCE_KEY) === "1";
  } catch {
    return false;
  }
}

function clearForceBoot(): void {
  try {
    sessionStorage.removeItem(FORCE_KEY);
  } catch {
    /* private mode — ignore */
  }
}

/**
 * SSR defaults to `done` so `/home` LCP is not an empty canvas.
 * First visit (no session flag) assembles after mount; reduced-motion stays settled.
 * `requestIdeBootReplay` sets FORCE_KEY + dispatches REPLAY_EVENT for logo / No / intro.
 * Force is cleared on settle (or reduced-motion), not on start — survives Strict Mode remount.
 */
export function useIdeBoot(): IdeBootPhase {
  const [phase, setPhase] = useState<IdeBootPhase>("done");

  useEffect(() => {
    const timers: number[] = [];
    let cancelled = false;

    const clearTimers = () => {
      for (const id of timers) window.clearTimeout(id);
      timers.length = 0;
    };

    const play = () => {
      if (cancelled) return;
      clearTimers();

      if (prefersReducedMotion()) {
        clearForceBoot();
        setPhase("done");
        return;
      }

      const force = peekForceBoot();
      if (!force && hasBootedThisSession()) {
        setPhase("done");
        return;
      }

      setPhase("bones");
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) setPhase("tabs");
        }, BONES_MS),
      );
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) setPhase("content");
        }, BONES_MS + TABS_MS),
      );
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setPhase("done");
          clearForceBoot();
          markBooted();
        }, BONES_MS + TABS_MS + CONTENT_MS),
      );
    };

    const onReplay = () => {
      play();
    };

    window.addEventListener(REPLAY_EVENT, onReplay);
    timers.push(window.setTimeout(play, 0));

    return () => {
      cancelled = true;
      clearTimers();
      window.removeEventListener(REPLAY_EVENT, onReplay);
    };
  }, []);

  return phase;
}
