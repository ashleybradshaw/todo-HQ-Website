"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { PerspectiveGrid } from "@/components/PerspectiveGrid";
import { cn } from "@/lib/cn";

type Phase = "idle" | "countdown" | "reading" | "done";

type SequenceItem = { kind: "logo" } | { kind: "word"; text: string };

class RSVPSynth {
  private readonly context: AudioContext;

  constructor() {
    this.context = new AudioContext({ latencyHint: "interactive" });
    void this.context.resume();
  }

  playTick() {
    this.ensureRunning();

    const { context } = this;
    const now = context.currentTime;
    const duration = 0.032;

    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const amp = context.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(7200, now);
    oscillator.frequency.exponentialRampToValueAtTime(1800, now + duration);

    filter.type = "highpass";
    filter.frequency.setValueAtTime(2400, now);
    filter.Q.setValueAtTime(0.8, now);

    amp.gain.setValueAtTime(0.16, now);
    amp.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(filter);
    filter.connect(amp);
    amp.connect(context.destination);

    oscillator.onended = () => {
      oscillator.disconnect();
      filter.disconnect();
      amp.disconnect();
    };

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  playBeep(frequency: number) {
    this.ensureRunning();

    const { context } = this;
    const now = context.currentTime;
    const duration = 0.09;

    const oscillator = context.createOscillator();
    const amp = context.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(frequency, now);

    amp.gain.setValueAtTime(0.08, now);
    amp.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(amp);
    amp.connect(context.destination);

    oscillator.onended = () => {
      oscillator.disconnect();
      amp.disconnect();
    };

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  close() {
    if (this.context.state !== "closed") {
      void this.context.close();
    }
  }

  private ensureRunning() {
    if (this.context.state === "suspended") {
      void this.context.resume();
    }
  }
}

function playTick(synth: RSVPSynth | null, enabled: boolean) {
  if (!synth || !enabled) {
    return;
  }

  synth.playTick();
}

function playBeep(
  synth: RSVPSynth | null,
  enabled: boolean,
  frequency: number,
) {
  if (!synth || !enabled) {
    return;
  }

  synth.playBeep(frequency);
}

const SCRIPT =
  "is an engineering team shipping AI-driven applications, multi-agent backends, and automated development lifecycles. We don’t just write code; we orchestrate the systems that write it. By leveraging multi-agent ecosystems and custom AI tooling, we automate the software development lifecycle. The result is faster shipping, scalable architecture, and a growing portfolio of in-house and client applications.";

const DISPLAY_SEQUENCE: SequenceItem[] = [
  { kind: "logo" },
  ...SCRIPT.split(/\s+/).filter(Boolean).map((text) => ({
    kind: "word" as const,
    text,
  })),
];

const BASE_WORD_MS = 160;
const LONG_WORD_EXTRA_MS = 50;
const COMMA_DELAY_MS = 250;
const PERIOD_DELAY_MS = 450;
const FINAL_HOLD_MS = 1500;
const COUNTDOWN_MS = 800;
const WORD_CLASS = "font-unbounded font-bold tracking-tight";

function getFontSize(word: string) {
  const { length } = word;

  if (length <= 4) {
    return "text-8xl";
  }

  if (length <= 8) {
    return "text-7xl";
  }

  return "text-6xl";
}

function delayForItem(item: SequenceItem, isLast: boolean) {
  if (isLast) {
    return FINAL_HOLD_MS;
  }

  if (item.kind === "logo") {
    return BASE_WORD_MS;
  }

  let delay = BASE_WORD_MS;

  if (item.text.length > 8) {
    delay += LONG_WORD_EXTRA_MS;
  }

  if (/,$/.test(item.text)) {
    delay += COMMA_DELAY_MS;
  }

  if (/[.;]$/.test(item.text)) {
    delay += PERIOD_DELAY_MS;
  }

  return delay;
}

function Centered({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function RSVPIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [count, setCount] = useState(3);
  const [wordIndex, setWordIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<RSVPSynth | null>(null);
  const soundEnabledRef = useRef(soundEnabled);

  soundEnabledRef.current = soundEnabled;

  useEffect(() => {
    return () => {
      audioRef.current?.close();
    };
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
        playTick(audioRef.current, soundEnabledRef.current);
        setPhase("reading");
        return;
      }

      playBeep(
        audioRef.current,
        soundEnabledRef.current,
        value === 1 ? 1200 : 800,
      );
      setCount(value);
    }, COUNTDOWN_MS);

    return () => window.clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== "reading") {
      return;
    }

    const item = DISPLAY_SEQUENCE[wordIndex];
    const isLast = wordIndex >= DISPLAY_SEQUENCE.length - 1;

    const timeout = window.setTimeout(() => {
      if (isLast) {
        setPhase("done");
        return;
      }

      playTick(audioRef.current, soundEnabledRef.current);
      setWordIndex((index) => index + 1);
    }, delayForItem(item, isLast));

    return () => window.clearTimeout(timeout);
  }, [phase, wordIndex]);

  const item = DISPLAY_SEQUENCE[wordIndex];
  const showSequence = phase === "reading" || phase === "done";

  return (
    <motion.div
      className={cn(
        "fixed inset-0 z-40 overflow-hidden bg-[#4545FF] text-[#DDDDFF]",
        phase === "done" && "pointer-events-none",
      )}
      initial={{ scale: 1, opacity: 1 }}
      animate={
        phase === "done" ? { scale: 25, opacity: 0 } : { scale: 1, opacity: 1 }
      }
      transition={{ duration: 0.9, ease: [0.83, 0, 0.39, 1] }}
      style={{ transformOrigin: "center center" }}
      onAnimationComplete={() => {
        if (phase === "done") {
          onComplete();
        }
      }}
    >
      {phase === "idle" ? (
        <div className="font-space flex h-full w-full flex-col items-center justify-center">
          <p className="text-center">READY?</p>
          <div className="mt-6">
            <button
              type="button"
              className="cursor-pointer bg-transparent p-0"
              onClick={() => {
                const synth = new RSVPSynth();
                audioRef.current = synth;
                playBeep(synth, soundEnabledRef.current, 800);
                setCount(3);
                setPhase("countdown");
              }}
            >
              [Yes]
            </button>
            <span> - </span>
            <button
              type="button"
              className="cursor-pointer bg-transparent p-0"
              onClick={() => {
                setPhase("done");
              }}
            >
              [No]
            </button>
            <span> </span>
            <button
              type="button"
              className="cursor-pointer bg-transparent p-0"
              aria-pressed={soundEnabled}
              onClick={() => setSoundEnabled((enabled) => !enabled)}
            >
              {`[ Sound: ${soundEnabled ? "ON" : "OFF"} ]`}
            </button>
          </div>
        </div>
      ) : null}

      {phase === "countdown" ? (
        <Centered className={cn(WORD_CLASS, getFontSize(String(count)))}>
          {String(count)}
        </Centered>
      ) : null}

      {showSequence ? (
        <>
          <PerspectiveGrid />
          <Centered>
            {item.kind === "logo" ? (
              <Logo className={cn(WORD_CLASS, "text-8xl")} />
            ) : (
              <span className={cn(WORD_CLASS, getFontSize(item.text))}>
                {item.text}
              </span>
            )}
          </Centered>
        </>
      ) : null}
    </motion.div>
  );
}
