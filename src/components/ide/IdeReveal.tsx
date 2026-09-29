"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import type { IdeBootPhase } from "@/hooks/useIdeBoot";
import { cn } from "@/lib/cn";

type IdeRevealProps = {
  bootPhase: IdeBootPhase;
  /** Forwarded to the outer window element (boot / IO target). */
  windowRef: RefObject<HTMLDivElement | null>;
  className?: string;
  "aria-label"?: string;
  children: ReactNode;
  /** Fired once when reveal starts (or immediately under reduced motion). */
  onRevealStart?: () => void;
};

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function bootReady(phase: IdeBootPhase) {
  return phase === "done" || phase === "content";
}

/**
 * One-shot line-draw + content fade when the IDE enters view.
 * Content is fully readable by ~600ms; frame stroke can finish by ~1.2s.
 * prefers-reduced-motion: static visible, no draw.
 */
export function IdeReveal({
  bootPhase,
  windowRef,
  className,
  "aria-label": ariaLabel,
  children,
  onRevealStart,
}: IdeRevealProps) {
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );
  const [phase, setPhase] = useState<"idle" | "drawing" | "done">(() =>
    reduceMotion ? "done" : "idle",
  );
  const startedRef = useRef(reduceMotion);

  useEffect(() => {
    if (reduceMotion) {
      if (!startedRef.current) {
        startedRef.current = true;
        onRevealStart?.();
      }
      return;
    }

    const el = windowRef.current;
    if (!el || startedRef.current) return;

    let finishTimer = 0;

    const start = () => {
      if (startedRef.current || !bootReady(bootPhase)) return;
      startedRef.current = true;
      setPhase("drawing");
      onRevealStart?.();
      finishTimer = window.setTimeout(() => setPhase("done"), 1200);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);

    const rect = el.getBoundingClientRect();
    const inView =
      rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
    if (inView && bootReady(bootPhase)) {
      io.disconnect();
      start();
    }

    return () => {
      io.disconnect();
      if (finishTimer) window.clearTimeout(finishTimer);
    };
  }, [bootPhase, reduceMotion, windowRef, onRevealStart]);

  return (
    <div
      ref={windowRef}
      className={cn(
        "ide-reveal relative",
        phase === "idle" && "ide-reveal-idle",
        phase === "drawing" && "ide-reveal-drawing",
        phase === "done" && "ide-reveal-done",
        className,
      )}
      data-ide-reveal={phase}
      aria-label={ariaLabel}
    >
      <span aria-hidden="true" className="ide-reveal-frame" />
      <div className="ide-reveal-content relative z-[1] flex min-h-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
