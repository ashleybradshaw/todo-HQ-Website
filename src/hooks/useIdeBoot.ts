"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";

export type IdeBootPhase = "bones" | "lines" | "content" | "done";

export type IdeBootScramble = {
  headingByLine: Readonly<Record<number, number>>;
  pipeline: number;
  telemetry: number;
  outline: number;
  projects: number;
};

export type IdeBootState = {
  phase: IdeBootPhase;
  /** Telemetry ticks + rotation may run. */
  ticksArmed: boolean;
  /** Bumped when hairlines should start (lines phase or repeat in-view). */
  revealNonce: number;
  scramble: IdeBootScramble;
};

const STORAGE_KEY = "todo-ide-boot-v8";
const FORCE_KEY = "todo-ide-boot-force";
const REPLAY_EVENT = "todo-ide-boot-replay";

const BONES_HOLD_MS = 350;
const BONES_OUT_MS = 200;
const BONE_STAGGER_MS = 12;
/** Hairline draw budget (matches IdeReveal stroke timeline). */
const LINES_MS = 500;
const LINE_STAGGER_MS = 12;
const LINE_STAGGER_CAP_MS = 360;
const SIDECAR_STEP_MS = 80;
const CONTENT_FADE_MS = 280;
const SIDECAR_BLOCK_COUNT = 4;

const EMPTY_SCRAMBLE: IdeBootScramble = {
  headingByLine: {},
  pipeline: 0,
  telemetry: 0,
  outline: 0,
  projects: 0,
};

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

function clearIdeFirst(): void {
  try {
    document.documentElement.removeAttribute("data-ide-first");
  } catch {
    /* ignore */
  }
}

function lineFadeDelay(lineIndex: number): number {
  return Math.min(lineIndex * LINE_STAGGER_MS, LINE_STAGGER_CAP_MS);
}

function contentPhaseDurationMs(headingLineIndexes: readonly number[]): number {
  const lastLineDelay =
    headingLineIndexes.length > 0
      ? Math.max(...headingLineIndexes.map(lineFadeDelay))
      : LINE_STAGGER_CAP_MS;
  const lastSidecarDelay = (SIDECAR_BLOCK_COUNT - 1) * SIDECAR_STEP_MS;
  const statusDelay = Math.max(lastLineDelay, lastSidecarDelay) + SIDECAR_STEP_MS;
  return statusDelay + CONTENT_FADE_MS;
}

function bonesOutDurationMs(boneCount: number): number {
  const n = Math.max(boneCount, 1);
  return BONES_OUT_MS + (n - 1) * BONE_STAGGER_MS;
}

/**
 * One orchestrator for /home IDE boot: wait → bones hold → lines+bones-out →
 * content fade + scheduled scrambles → done.
 * Initial phase is `bones` so SSR includes the overlay for `data-ide-first`.
 * Repeat / reduced motion flip to `done` on mount (overlay unmounts; CSS
 * also hides bones without `data-ide-first`).
 */
export function useIdeBoot(
  targetRef: RefObject<HTMLElement | null>,
  headingLineIndexes: readonly number[] = [],
): IdeBootState {
  // SSR + first client paint: bones so overlay is in the tree for data-ide-first.
  // Repeat visits flip to done in the effect before paint is noticeable (CSS-hidden).
  const [phase, setPhase] = useState<IdeBootPhase>("bones");
  const [ticksArmed, setTicksArmed] = useState(false);
  const [revealNonce, setRevealNonce] = useState(0);
  const [scramble, setScramble] = useState<IdeBootScramble>(EMPTY_SCRAMBLE);
  const headingRef = useRef(headingLineIndexes);

  useEffect(() => {
    headingRef.current = headingLineIndexes;
  }, [headingLineIndexes]);

  useEffect(() => {
    const timers: number[] = [];
    let cancelled = false;
    let started = false;
    let observer: IntersectionObserver | null = null;
    let runId = 0;

    const clearTimers = () => {
      for (const id of timers) window.clearTimeout(id);
      timers.length = 0;
    };

    const pushTimer = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms));
    };

    const finishDone = (id: number) => {
      if (cancelled || id !== runId) return;
      setPhase("done");
      setTicksArmed(true);
      clearForceBoot();
      markBooted();
      clearIdeFirst();
    };

    const scheduleScrambles = (id: number, playBase: number) => {
      const headings = headingRef.current;
      for (const lineIndex of headings) {
        const delay = lineFadeDelay(lineIndex);
        pushTimer(() => {
          if (cancelled || id !== runId) return;
          setScramble((prev) => ({
            ...prev,
            headingByLine: {
              ...prev.headingByLine,
              [lineIndex]: playBase,
            },
          }));
        }, delay);
      }

      const sidecarKeys = [
        "pipeline",
        "telemetry",
        "outline",
        "projects",
      ] as const;
      sidecarKeys.forEach((key, i) => {
        pushTimer(() => {
          if (cancelled || id !== runId) return;
          setScramble((prev) => ({ ...prev, [key]: playBase }));
        }, i * SIDECAR_STEP_MS);
      });
    };

    const play = (opts: { fromReplay: boolean }) => {
      if (cancelled) return;
      if (started && !opts.fromReplay) return;

      runId += 1;
      const id = runId;
      started = true;
      clearTimers();
      observer?.disconnect();
      observer = null;

      if (prefersReducedMotion()) {
        clearForceBoot();
        clearIdeFirst();
        setPhase("done");
        setTicksArmed(true);
        setScramble(EMPTY_SCRAMBLE);
        setRevealNonce((n) => n + 1);
        return;
      }

      const force = peekForceBoot();
      if (!force && !opts.fromReplay && hasBootedThisSession()) {
        clearIdeFirst();
        setPhase("done");
        setTicksArmed(true);
        setScramble(EMPTY_SCRAMBLE);
        setRevealNonce((n) => n + 1);
        return;
      }

      // Replays never set data-ide-first; overlay hides via phase=bones.
      setTicksArmed(false);
      setScramble(EMPTY_SCRAMBLE);
      setPhase("bones");

      const boneEls =
        targetRef.current?.querySelectorAll(".ide-bone-overlay .ide-bone") ??
        [];
      // Cap stagger so a dense measured overlay can't blow the ≤1.6s budget.
      const outMs = Math.max(
        LINES_MS,
        bonesOutDurationMs(Math.min(boneEls.length || 24, 24)),
      );

      pushTimer(() => {
        if (cancelled || id !== runId) return;
        setPhase("lines");
        setRevealNonce((n) => n + 1);

        pushTimer(() => {
          if (cancelled || id !== runId) return;
          setPhase("content");
          const playBase = id + 1;
          scheduleScrambles(id, playBase);

          const contentMs = contentPhaseDurationMs(headingRef.current);
          pushTimer(() => {
            if (cancelled || id !== runId) return;
            setTicksArmed(true);
            finishDone(id);
          }, contentMs);
        }, outMs);
      }, BONES_HOLD_MS);
    };

    const onReplay = () => {
      // Cancel in-flight boot and restart cleanly from bones.
      started = false;
      clearTimers();
      observer?.disconnect();
      observer = null;
      pushTimer(() => play({ fromReplay: true }), 0);
    };

    window.addEventListener(REPLAY_EVENT, onReplay);

    const el = targetRef.current;

    const armObserver = () => {
      if (!el) {
        pushTimer(() => play({ fromReplay: false }), 0);
        return;
      }

      const maybeStart = (entry: IntersectionObserverEntry) => {
        const ratio = entry.intersectionRatio;
        const topOk = entry.boundingClientRect.top < window.innerHeight * 0.55;
        if (ratio >= 0.4 || (entry.isIntersecting && topOk)) {
          observer?.disconnect();
          observer = null;
          play({ fromReplay: false });
        }
      };

      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) maybeStart(entry);
        },
        { root: null, threshold: [0, 0.15, 0.4, 0.55, 0.75, 1] },
      );
      observer.observe(el);

      // Sync check (already in view / replay with IDE on screen).
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const visible =
        Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
      const ratio = rect.height > 0 ? visible / rect.height : 0;
      if (ratio >= 0.4 || (visible > 0 && rect.top < vh * 0.55)) {
        observer.disconnect();
        observer = null;
        play({ fromReplay: false });
      }
    };

    if (peekForceBoot()) {
      pushTimer(() => play({ fromReplay: true }), 0);
    } else if (hasBootedThisSession() || prefersReducedMotion()) {
      pushTimer(() => {
        if (cancelled) return;
        clearForceBoot();
        clearIdeFirst();
        setPhase("done");
        setTicksArmed(true);
        setScramble(EMPTY_SCRAMBLE);
        started = true;
        // Repeat / reduced: still bump reveal so IdeReveal can draw once in view.
        setRevealNonce((n) => n + 1);
      }, 0);
    } else {
      // First visit: already on bones from initial state; wait for IO.
      armObserver();
    }

    return () => {
      cancelled = true;
      clearTimers();
      observer?.disconnect();
      window.removeEventListener(REPLAY_EVENT, onReplay);
    };
  }, [targetRef]);

  return useMemo(
    () => ({ phase, ticksArmed, revealNonce, scramble }),
    [phase, ticksArmed, revealNonce, scramble],
  );
}

/** Timing constants exported for CSS alignment / tests. */
export const IDE_BOOT_TIMING = {
  BONES_HOLD_MS,
  BONES_OUT_MS,
  BONE_STAGGER_MS,
  LINES_MS,
  LINE_STAGGER_MS,
  LINE_STAGGER_CAP_MS,
  SIDECAR_STEP_MS,
  CONTENT_FADE_MS,
} as const;
