"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useAnimation } from "framer-motion";
import { LogoAnimated } from "@/components/LogoAnimated";
import { PerspectiveGrid } from "@/components/PerspectiveGrid";
import { PhyllotaxisBloom } from "@/components/PhyllotaxisBloom";
import { cn } from "@/lib/cn";

type Phase = "idle" | "countdown" | "whatWeDo" | "reading" | "done";

const TICK_PITCHES = [1200, 1400, 1000] as const;
const TICK_DURATION = 0.04;

function createAudioContext() {
  const Ctor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!Ctor) {
    throw new Error("Web Audio is not available");
  }

  try {
    return new Ctor({ latencyHint: "interactive" });
  } catch {
    return new Ctor();
  }
}

class RSVPSynth {
  private context: AudioContext;
  private unlocking: Promise<void> | null = null;
  private tickIndex = 0;

  constructor() {
    this.context = createAudioContext();
    void this.unlock();
  }

  playTick() {
    if (this.context.state === "running") {
      this.emitTick();
      return;
    }

    void this.unlock().then(() => {
      if (this.context.state === "running") {
        this.emitTick();
      }
    });
  }

  playBeep(frequency: number) {
    if (this.context.state === "running") {
      this.emitBeep(frequency);
      return;
    }

    void this.unlock().then(() => {
      if (this.context.state === "running") {
        this.emitBeep(frequency);
      }
    });
  }

  close() {
    this.unlocking = null;

    if (this.context.state !== "closed") {
      void this.context.close();
    }
  }

  private unlock() {
    if (this.context.state === "closed") {
      this.context = createAudioContext();
      this.unlocking = null;
    }

    if (this.context.state === "running") {
      this.unlocking = null;
      return Promise.resolve();
    }

    this.unlocking ??= this.context.resume().then(
      () => {
        this.unlocking = null;
      },
      () => {
        this.unlocking = null;
      },
    );

    return this.unlocking;
  }

  private emitTick() {
    const { context } = this;

    if (context.state !== "running") {
      return;
    }

    const now = context.currentTime;
    const pitch = TICK_PITCHES[this.tickIndex % TICK_PITCHES.length];
    this.tickIndex += 1;

    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const amp = context.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(pitch, now);

    filter.type = "highpass";
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(0.7, now);

    amp.gain.setValueAtTime(0.18, now);
    amp.gain.linearRampToValueAtTime(0.001, now + TICK_DURATION);

    oscillator.connect(filter);
    filter.connect(amp);
    amp.connect(context.destination);

    oscillator.onended = () => {
      oscillator.disconnect();
      filter.disconnect();
      amp.disconnect();
    };

    oscillator.start(now);
    oscillator.stop(now + TICK_DURATION);
  }

  private emitBeep(frequency: number) {
    const { context } = this;

    if (context.state !== "running") {
      return;
    }

    const now = context.currentTime;
    const duration = 0.11;

    const oscillator = context.createOscillator();
    const amp = context.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(frequency, now);

    amp.gain.setValueAtTime(0.1, now);
    amp.gain.linearRampToValueAtTime(0.001, now + duration);

    oscillator.connect(amp);
    amp.connect(context.destination);

    oscillator.onended = () => {
      oscillator.disconnect();
      amp.disconnect();
    };

    oscillator.start(now);
    oscillator.stop(now + duration);
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

const rsvpWords = [
  "is",
  "an",
  "engineering",
  "team.",
  "We",
  "don’t",
  "just",
  "write",
  "code.",
  "We",
  "build",
  "the",
  "factory.",
  "Autonomous",
  "agents.",
  "Automated",
  "workflows.",
  "Scalable",
  "backends.",
  "We",
  "design,",
  "code,",
  "and",
  "ship",
  "production-ready",
  "applications.",
  "Fast.",
];

const WARMUP_MS = 750;
const WARMUP_HOP_MS = WARMUP_MS / 3;
const RAMP_WORD_MS = 220;
const MID_WORD_MS = 165;
const SPRINT_WORD_MS = 130;
const COMMA_DELAY_MS = 150;
const PERIOD_DELAY_MS = 300;
const FINAL_HOLD_MS = 1200;
const COUNTDOWN_MS = 800;
const WORD_CLASS = "font-unbounded font-bold tracking-tight";
const WORD_ANCHOR_CLASS =
  "absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2";
const WARMUP_SPRING = { type: "spring" as const, stiffness: 400, damping: 12 };
const WARMUP_WORDS = ["What", "we", "do..."] as const;

function fontSizeForWord(word: string) {
  const length = Math.max(word.length, 1);
  const maxRem = length <= 4 ? 6 : length <= 8 ? 4.5 : 3.25;
  const minRem = length <= 4 ? 2.5 : 1.25;
  const vw = Math.min(16, 82 / (length * 1.02));

  return `clamp(${minRem}rem, ${vw}vw, ${maxRem}rem)`;
}

function delayForWord(word: string, index: number, isLast: boolean) {
  if (isLast) {
    return FINAL_HOLD_MS;
  }

  let delay =
    index < 3 ? RAMP_WORD_MS : index < 8 ? MID_WORD_MS : SPRINT_WORD_MS;

  if (/,$/.test(word)) {
    delay += COMMA_DELAY_MS;
  }

  if (/\.$/.test(word)) {
    delay += PERIOD_DELAY_MS;
  }

  return delay;
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

    el.style.fontSize = fontSizeForWord(text);

    const available = window.innerWidth * 0.86;
    const width = el.scrollWidth;

    if (width > available && width > 0) {
      const current = Number.parseFloat(getComputedStyle(el).fontSize);
      el.style.fontSize = `${(current * available) / width}px`;
    }
  }, [text]);

  return (
    <span
      ref={ref}
      className={className}
      style={{ fontSize: fontSizeForWord(text) }}
    >
      {text}
    </span>
  );
}

function WhatWeDoWarmUp() {
  const phraseRef = useRef<HTMLParagraphElement>(null);
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [hop, setHop] = useState(0);
  const [x, setX] = useState(0);

  useLayoutEffect(() => {
    const phrase = phraseRef.current;
    const word = wordRefs.current[hop];

    if (!phrase || !word) {
      return;
    }

    const phraseBox = phrase.getBoundingClientRect();
    const wordBox = word.getBoundingClientRect();
    const center = wordBox.left + wordBox.width / 2 - phraseBox.left;

    setX(center - 6);
  }, [hop]);

  useEffect(() => {
    const hopToWe = window.setTimeout(() => setHop(1), WARMUP_HOP_MS);
    const hopToDo = window.setTimeout(() => setHop(2), WARMUP_HOP_MS * 2);

    return () => {
      window.clearTimeout(hopToWe);
      window.clearTimeout(hopToDo);
    };
  }, []);

  return (
    <div className={WORD_ANCHOR_CLASS}>
      <div className="relative">
        <motion.span
          aria-hidden="true"
          className="absolute top-0 left-0 h-3 w-3 rounded-full bg-[#DDDDFF]"
          style={{ marginTop: "-20px" }}
          animate={{ x }}
          transition={WARMUP_SPRING}
        />
        <p
          ref={phraseRef}
          className={`${WORD_CLASS} whitespace-nowrap text-[clamp(1.75rem,6vw,2.75rem)]`}
        >
          {WARMUP_WORDS.map((word, index) => (
            <span key={word}>
              {index > 0 ? " " : null}
              <span
                ref={(node) => {
                  wordRefs.current[index] = node;
                }}
              >
                {word}
              </span>
            </span>
          ))}
        </p>
      </div>
    </div>
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
  const [phase, setPhase] = useState<Phase>("idle");
  const [count, setCount] = useState(3);
  const [wordIndex, setWordIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bypassReading, setBypassReading] = useState(false);
  const audioRef = useRef<RSVPSynth | null>(null);
  const soundEnabledRef = useRef(soundEnabled);
  const bloomControls = useAnimation();

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

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
        setPhase("whatWeDo");
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
    if (phase !== "whatWeDo") {
      return;
    }

    const timeout = window.setTimeout(() => {
      playTick(audioRef.current, soundEnabledRef.current);
      setWordIndex(0);
      setPhase("reading");
    }, WARMUP_MS);

    return () => window.clearTimeout(timeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== "reading") {
      return;
    }

    const word = rsvpWords[wordIndex];
    const isLast = wordIndex >= rsvpWords.length - 1;

    const timeout = window.setTimeout(() => {
      if (isLast) {
        setPhase("done");
        return;
      }

      playTick(audioRef.current, soundEnabledRef.current);
      setWordIndex((index) => index + 1);
    }, delayForWord(word, wordIndex, isLast));

    return () => window.clearTimeout(timeout);
  }, [phase, wordIndex]);

  useLayoutEffect(() => {
    if (phase !== "countdown" && phase !== "whatWeDo" && phase !== "reading") {
      return;
    }

    bloomControls.set({ scale: 1.05 });
    void bloomControls.start({
      scale: 1,
      transition: { duration: 0.15, ease: "easeOut" },
    });
  }, [bloomControls, count, phase, wordIndex]);

  const word = rsvpWords[wordIndex];
  const exiting = phase === "done";
  const showIdle = phase === "idle" || (exiting && bypassReading);
  const showSequence = (phase === "reading" || exiting) && !bypassReading;
  const showBloom =
    phase === "countdown" ||
    phase === "whatWeDo" ||
    phase === "reading" ||
    (exiting && !bypassReading);

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
          {showIdle ? (
            <div className="flex h-full w-full flex-col items-center justify-center px-6">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center py-2.5">
                  <LogoAnimated className="h-[35px] w-auto text-[#0B0CB4]" />
                </div>
                <p className={`${WORD_CLASS} py-5 text-center text-[40px] leading-12`}>
                  First time?
                </p>
                <div className="font-jetbrains flex items-center justify-center py-2.5 text-base leading-5 font-bold">
                  <button
                    type="button"
                    className="min-h-11 cursor-pointer bg-transparent px-1 py-2.5"
                    onClick={() => {
                      const synth = new RSVPSynth();
                      audioRef.current = synth;
                      playBeep(synth, soundEnabled, 800);
                      setCount(3);
                      setPhase("countdown");
                    }}
                  >
                    [Yes]
                  </button>
                  <span>&nbsp;-&nbsp;</span>
                  <button
                    type="button"
                    className="min-h-11 cursor-pointer bg-transparent px-1 py-2.5"
                    onClick={() => {
                      setBypassReading(true);
                      setPhase("done");
                    }}
                  >
                    [No]
                  </button>
                </div>
                <button
                  type="button"
                  className="font-jetbrains min-h-11 cursor-pointer bg-transparent py-2.5 text-base leading-5 font-bold"
                  aria-pressed={soundEnabled}
                  onClick={() => {
                    setSoundEnabled((enabled) => {
                      const next = !enabled;
                      soundEnabledRef.current = next;
                      return next;
                    });
                  }}
                >
                  {`[ Sound: ${soundEnabled ? "ON" : "OFF"} ]`}
                </button>
              </div>
            </div>
          ) : null}

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
              style={{ fontSize: fontSizeForWord(String(count)) }}
            >
              {String(count)}
            </Centered>
          ) : null}

          {phase === "whatWeDo" ? <WhatWeDoWarmUp /> : null}

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
