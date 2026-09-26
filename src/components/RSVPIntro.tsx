"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { initRsvpAudio, playBeep } from "@/lib/rsvp-audio";

type Phase = "countdown" | "reading" | "done";

/**
 * Keep Up reading ramp — early/mid tokens ~15–25% shorter than the prior
 * ladder; sentence-end holds lengthened; Fast. unchanged.
 */
const rsvpSequence = [
  { text: "Most teams", ms: 300 },
  { text: "just", ms: 155 },
  { text: "write", ms: 155 },
  { text: "code.", ms: 720 },
  { text: "We", ms: 135 },
  { text: "build", ms: 155 },
  { text: "the", ms: 120 },
  { text: "entire", ms: 190 },
  { text: "factory.", ms: 800 },
  { text: "Autonomous", ms: 220 },
  { text: "agents.", ms: 620 },
  { text: "Automated", ms: 205 },
  { text: "workflows.", ms: 620 },
  { text: "We", ms: 110 },
  { text: "design,", ms: 220 },
  { text: "build,", ms: 220 },
  { text: "and ship", ms: 190 },
  { text: "production-", ms: 240 },
  { text: "ready.", ms: 720 },
  { text: "Fast.", ms: 1200 },
] as const;

const COUNTDOWN_MS = 700;
const RSVP_FONT_SIZE = "clamp(2.5rem, 7.5vw, 5.25rem)";
const WORD_CLASS = "font-unbounded font-bold tracking-tight";
const WORD_ANCHOR_CLASS =
  "absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2";
const SKIP_CLASS =
  "font-jetbrains text-[1.0625rem] leading-6 font-extrabold text-[#DFDFFF] transition-opacity hover:opacity-80";

/** Honda-like punch: 3 huge → 2 mid → 1 almost tiny. */
function fontSizeForCount(count: number) {
  if (count === 3) {
    return "clamp(8.5rem, 30vw, 15rem)";
  }

  if (count === 2) {
    return "clamp(3.25rem, 11vw, 5.75rem)";
  }

  return "clamp(0.95rem, 3.2vw, 1.65rem)";
}

function prefersReducedMotion() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Reduced-motion: fast-forward holds so the sequence never traps. */
function holdMs(baseMs: number, reduce: boolean) {
  if (!reduce) {
    return baseMs;
  }
  return Math.min(baseMs, Math.max(60, Math.round(baseMs * 0.22)));
}

function FitWord({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;

    if (!el) {
      return;
    }

    el.style.fontSize = RSVP_FONT_SIZE;

    const available = window.innerWidth * 0.86;
    const width = el.scrollWidth;

    if (width > available && width > 0) {
      const current = Number.parseFloat(getComputedStyle(el).fontSize);
      el.style.fontSize = `${(current * available) / width}px`;
    }
  }, [text]);

  return (
    <span ref={ref} className={className} style={{ fontSize: RSVP_FONT_SIZE }}>
      {text}
    </span>
  );
}

function Centered({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-live="polite"
      className={cn(WORD_ANCHOR_CLASS, "text-center whitespace-nowrap", className)}
      style={style}
    >
      {children}
    </div>
  );
}

export function RSVPIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>("countdown");
  const [count, setCount] = useState(3);
  const [wordIndex, setWordIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const reduceMotionRef = useRef(reduceMotion);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    reduceMotionRef.current = reduceMotion;
  }, [reduceMotion]);

  const goHomeNow = () => {
    if (completedRef.current) {
      return;
    }
    completedRef.current = true;
    onCompleteRef.current();
  };

  const beginExitZoom = () => {
    if (completedRef.current) {
      return;
    }
    if (reduceMotionRef.current) {
      goHomeNow();
      return;
    }
    setPhase("done");
  };

  useEffect(() => {
    initRsvpAudio();
    setReduceMotion(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (phase !== "countdown") {
      return;
    }

    // Reduced motion: skip the 3-2-1 trap and enter reading immediately.
    if (reduceMotion) {
      setWordIndex(0);
      setPhase("reading");
      return;
    }

    let value = 3;

    const interval = window.setInterval(() => {
      value -= 1;

      if (value < 1) {
        window.clearInterval(interval);
        setWordIndex(0);
        setPhase("reading");
        return;
      }

      playBeep(value === 1 ? 140 : 190);
      setCount(value);
    }, COUNTDOWN_MS);

    return () => window.clearInterval(interval);
  }, [phase, reduceMotion]);

  useEffect(() => {
    if (phase !== "reading") {
      return;
    }

    const current = rsvpSequence[wordIndex];
    const isLast = wordIndex >= rsvpSequence.length - 1;
    const ms = holdMs(current.ms, reduceMotion);

    const timeout = window.setTimeout(() => {
      if (isLast) {
        beginExitZoom();
        return;
      }

      setWordIndex((index) => index + 1);
    }, ms);

    return () => window.clearTimeout(timeout);
  }, [phase, wordIndex, reduceMotion]);

  const word = rsvpSequence[wordIndex].text;
  const exiting = phase === "done";
  const showSequence = phase === "reading" || exiting;
  const showSkip = phase === "countdown" || phase === "reading";
  const exitDuration = reduceMotion ? 0.2 : 0.9;

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 overflow-hidden bg-[#4545FF] text-[#DFDFFF]",
        exiting && "pointer-events-none",
      )}
    >
      <motion.div
        className="h-full w-full"
        initial={{ scale: 1 }}
        animate={{ scale: exiting ? 25 : 1 }}
        transition={{ duration: exitDuration, ease: [0.83, 0, 0.39, 1] }}
        style={{ transformOrigin: "center center" }}
        onAnimationComplete={() => {
          if (exiting) {
            goHomeNow();
          }
        }}
      >
        <motion.div
          className="relative h-full w-full text-[#DFDFFF]"
          animate={{ opacity: exiting ? 0 : 1 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.3, ease: "easeIn" }}
        >
          {phase === "countdown" ? (
            <Centered
              className={WORD_CLASS}
              style={{ fontSize: fontSizeForCount(count) }}
            >
              {String(count)}
            </Centered>
          ) : null}

          {showSequence ? (
            <Centered>
              <FitWord className={WORD_CLASS} text={word} />
            </Centered>
          ) : null}
        </motion.div>
      </motion.div>

      {showSkip ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            className={cn(SKIP_CLASS, "pointer-events-auto")}
            onClick={goHomeNow}
          >
            [ Skip ]
          </button>
        </div>
      ) : null}

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 bg-[#DFDFFF]"
        initial={{ opacity: 0 }}
        animate={{ opacity: exiting ? 1 : 0 }}
        transition={{
          duration: reduceMotion ? 0.12 : 0.3,
          ease: "easeIn",
        }}
      />
    </div>
  );
}
