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
  /** Bumped when hairlines should start (orchestrator or repeat path). */
  revealNonce: number;
  /** Forwarded to the outer window element (boot / IO target). */
  windowRef: RefObject<HTMLDivElement | null>;
  className?: string;
  "aria-label"?: string;
  children: ReactNode;
};

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Internal hairline draw for the IDE window.
 * Driven by orchestrator when `bootPhase === "lines"`; on repeat visits
 * (`done` without a lines pass) draws once when in view.
 * Finish timer is sticky (not cleared by boot phase churn).
 */
export function IdeReveal({
  bootPhase,
  revealNonce,
  windowRef,
  className,
  "aria-label": ariaLabel,
  children,
}: IdeRevealProps) {
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );
  const [phase, setPhase] = useState<"idle" | "drawing" | "done">(() =>
    reduceMotion ? "done" : "idle",
  );
  const drawingRef = useRef(false);
  const finishTimerRef = useRef(0);
  const lastNonceRef = useRef(0);
  const sawLinesRef = useRef(false);

  useEffect(() => {
    if (bootPhase === "lines") sawLinesRef.current = true;
  }, [bootPhase]);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const beginDraw = () => {
      drawingRef.current = true;
      setPhase("drawing");
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = window.setTimeout(() => {
        setPhase("done");
        drawingRef.current = false;
      }, 520);
    };

    // First boot / replay: start with lines phase (nonce advances each run).
    if (
      bootPhase === "lines" &&
      revealNonce > 0 &&
      revealNonce !== lastNonceRef.current
    ) {
      lastNonceRef.current = revealNonce;
      window.clearTimeout(finishTimerRef.current);
      drawingRef.current = false;
      beginDraw();
      return;
    }

    // Repeat visit: never saw lines — one-shot IO draw (nonce > 0 means
    // orchestrator confirmed skip-to-done / reduced path).
    if (bootPhase !== "done" || sawLinesRef.current || revealNonce === 0) {
      return;
    }
    if (drawingRef.current || phase === "done" || phase === "drawing") return;

    const el = windowRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          beginDraw();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);

    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
    if (inView) {
      io.disconnect();
      beginDraw();
    }

    return () => {
      io.disconnect();
    };
  }, [bootPhase, reduceMotion, revealNonce, windowRef, phase]);

  useEffect(() => {
    return () => {
      window.clearTimeout(finishTimerRef.current);
    };
  }, []);

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
      data-ide-boot={bootPhase}
      aria-label={ariaLabel}
    >
      <span
        aria-hidden="true"
        className="ide-reveal-stroke ide-reveal-stroke-path"
      />
      <span
        aria-hidden="true"
        className="ide-reveal-stroke ide-reveal-stroke-divider hidden lg:block"
      />
      <span
        aria-hidden="true"
        className="ide-reveal-stroke ide-reveal-stroke-status"
      />
      <div className="ide-reveal-content relative z-[1] flex min-h-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
