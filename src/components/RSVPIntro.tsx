"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useAnimation } from "framer-motion";
import { PerspectiveGrid } from "@/components/PerspectiveGrid";
import { PhyllotaxisBloom } from "@/components/PhyllotaxisBloom";
import { cn } from "@/lib/cn";
import { initRsvpAudio, playBeep } from "@/lib/rsvp-audio";

type Phase = "countdown" | "reading" | "done";

const rsvpSequence = [
  { text: "Most teams", ms: 380 },
  { text: "just", ms: 200 },
  { text: "write", ms: 200 },
  { text: "code.", ms: 640 },
  { text: "We", ms: 170 },
  { text: "build", ms: 200 },
  { text: "the", ms: 150 },
  { text: "entire", ms: 240 },
  { text: "factory.", ms: 700 },
  { text: "Autonomous", ms: 280 },
  { text: "agents.", ms: 540 },
  { text: "Automated", ms: 260 },
  { text: "workflows.", ms: 540 },
  { text: "We", ms: 140 },
  { text: "design,", ms: 280 },
  { text: "build,", ms: 280 },
  { text: "and ship", ms: 240 },
  { text: "production-", ms: 300 },
  { text: "ready.", ms: 640 },
  { text: "Fast.", ms: 1200 },
] as const;

const COUNTDOWN_MS = 700;
const RSVP_FONT_SIZE = "clamp(2.5rem, 7.5vw, 5.25rem)";
const WORD_CLASS = "font-unbounded font-bold tracking-tight";
const WORD_ANCHOR_CLASS =
  "absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2";

function fontSizeForCount(count: number) {
  if (count === 3) {
    return "clamp(6.5rem, 22vw, 11rem)";
  }

  if (count === 2) {
    return "clamp(3.75rem, 12vw, 6.5rem)";
  }

  return "clamp(1.75rem, 5.5vw, 2.75rem)";
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
  const bloomControls = useAnimation();

  useEffect(() => {
    initRsvpAudio();
  }, []);

  useEffect(() => {
    if (phase !== "countdown") {
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
  }, [phase]);

  useEffect(() => {
    if (phase !== "reading") {
      return;
    }

    const current = rsvpSequence[wordIndex];
    const isLast = wordIndex >= rsvpSequence.length - 1;

    const timeout = window.setTimeout(() => {
      if (isLast) {
        setPhase("done");
        return;
      }

      setWordIndex((index) => index + 1);
    }, current.ms);

    return () => window.clearTimeout(timeout);
  }, [phase, wordIndex]);

  useLayoutEffect(() => {
    if (phase !== "countdown") {
      return;
    }

    bloomControls.set({ scale: 1.05 });
    void bloomControls.start({
      scale: 1,
      transition: { duration: 0.15, ease: "easeOut" },
    });
  }, [bloomControls, count, phase]);

  const word = rsvpSequence[wordIndex].text;
  const exiting = phase === "done";
  const showSequence = phase === "reading" || exiting;
  const showBloom = phase === "countdown" || phase === "reading" || exiting;

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 overflow-hidden bg-[#4545FF] text-[#DDDDFF]",
        exiting && "pointer-events-none",
      )}
    >
      <motion.div
        className="h-full w-full"
        initial={{ scale: 1 }}
        animate={{ scale: exiting ? 25 : 1 }}
        transition={{ duration: 0.9, ease: [0.83, 0, 0.39, 1] }}
        style={{ transformOrigin: "center center" }}
        onAnimationComplete={() => {
          if (exiting) {
            onComplete();
          }
        }}
      >
        <motion.div
          className="relative h-full w-full text-[#DDDDFF]"
          animate={{ opacity: exiting ? 0 : 1 }}
          transition={{ duration: 0.3, ease: "easeIn" }}
        >
          {showBloom ? (
            <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center opacity-15">
              <PhyllotaxisBloom
                className="h-[min(100vw,100vh)] w-[min(100vw,100vh)] origin-center"
                animate={bloomControls}
              />
            </div>
          ) : null}

          {phase === "countdown" ? (
            <Centered
              className={WORD_CLASS}
              style={{ fontSize: fontSizeForCount(count) }}
            >
              {String(count)}
            </Centered>
          ) : null}

          {showSequence ? (
            <>
              <PerspectiveGrid />
              <Centered>
                <FitWord className={WORD_CLASS} text={word} />
              </Centered>
            </>
          ) : null}
        </motion.div>
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 bg-[#DDDDFF]"
        initial={{ opacity: 0 }}
        animate={{ opacity: exiting ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeIn" }}
      />
    </div>
  );
}
