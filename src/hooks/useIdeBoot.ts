"use client";

import { useEffect, useState, type RefObject } from "react";

export type IdeBootPhase = "bones" | "tabs" | "content" | "done";

const STORAGE_KEY = "todo-ide-boot-v8";
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
 * First visit boots when `targetRef` enters the viewport (IDE-only first view).
 * Force replay (logo / No / intro) ignores intersection and plays immediately.
 */
export function useIdeBoot(
  targetRef: RefObject<HTMLElement | null>,
): IdeBootPhase {
  const [phase, setPhase] = useState<IdeBootPhase>("done");

  useEffect(() => {
    const timers: number[] = [];
    let cancelled = false;
    let started = false;
    let observer: IntersectionObserver | null = null;

    const clearTimers = () => {
      for (const id of timers) window.clearTimeout(id);
      timers.length = 0;
    };

    const play = () => {
      if (cancelled || started) return;
      started = true;
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
      started = false;
      observer?.disconnect();
      timers.push(window.setTimeout(play, 0));
    };

    window.addEventListener(REPLAY_EVENT, onReplay);

    const el = targetRef.current;

    if (peekForceBoot()) {
      timers.push(window.setTimeout(play, 0));
    } else if (hasBootedThisSession() || prefersReducedMotion()) {
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          clearForceBoot();
          setPhase("done");
          started = true;
        }, 0),
      );
    } else if (el) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            observer?.disconnect();
            play();
          }
        },
        { root: null, threshold: 0.15 },
      );
      observer.observe(el);
    } else {
      timers.push(window.setTimeout(play, 0));
    }

    return () => {
      cancelled = true;
      clearTimers();
      observer?.disconnect();
      window.removeEventListener(REPLAY_EVENT, onReplay);
    };
  }, [targetRef]);

  return phase;
}
