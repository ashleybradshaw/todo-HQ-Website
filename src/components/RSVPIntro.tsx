"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useAnimation } from "framer-motion";
import { LogoAnimated } from "@/components/LogoAnimated";
import { PerspectiveGrid } from "@/components/PerspectiveGrid";
import { PhyllotaxisBloom } from "@/components/PhyllotaxisBloom";
import { cn } from "@/lib/cn";

type Phase = "idle" | "countdown" | "reading" | "done";

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
    void this.unlock().then(() => {
      this.emitTick();
    });
  }

  playBeep(frequency: number) {
    void this.unlock().then(() => {
      this.emitBeep(frequency);
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

const BASE_WORD_MS = 165;
const LONG_WORD_EXTRA_MS = 90;
const VERY_LONG_WORD_EXTRA_MS = 150;
const COMMA_DELAY_MS = 180;
const PERIOD_DELAY_MS = 380;
const FINAL_HOLD_MS = 1200;
const COUNTDOWN_MS = 800;
const WORD_CLASS = "font-unbounded font-bold tracking-tight";

function fontSizeForWord(word: string) {
  const length = Math.max(word.length, 1);
  const maxRem = length <= 4 ? 6 : length <= 8 ? 4.5 : 3.25;
  const minRem = length <= 4 ? 2.5 : 1.25;
  const vw = Math.min(16, 82 / (length * 1.02));

  return `clamp(${minRem}rem, ${vw}vw, ${maxRem}rem)`;
}

function delayForWord(word: string, isLast: boolean) {
  if (isLast) {
    return FINAL_HOLD_MS;
  }

  let delay = BASE_WORD_MS;

  if (word.length > 12) {
    delay += VERY_LONG_WORD_EXTRA_MS;
  } else if (word.length > 8) {
    delay += LONG_WORD_EXTRA_MS;
  }

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

    const available = el.parentElement?.clientWidth ?? window.innerWidth * 0.86;
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
      className={cn(
        "absolute top-1/2 left-1/2 z-10 w-[min(90vw,36rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden text-center whitespace-nowrap",
        className,
      )}
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

    const word = rsvpWords[wordIndex];
    const isLast = wordIndex >= rsvpWords.length - 1;

    const timeout = window.setTimeout(() => {
      if (isLast) {
        setPhase("done");
        return;
      }

      playTick(audioRef.current, soundEnabledRef.current);
      setWordIndex((index) => index + 1);
    }, delayForWord(word, isLast));

    return () => window.clearTimeout(timeout);
  }, [phase, wordIndex]);

  useLayoutEffect(() => {
    if (phase !== "countdown" && phase !== "reading") {
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

      {phase === "reading" ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
          <p
            className="font-jetbrains absolute bottom-4 left-1/2 -translate-x-1/2 text-sm tracking-widest text-[#DDDDFF]/70"
            aria-live="polite"
          >
            {`[ ${wordIndex + 1} / ${rsvpWords.length} ]`}
          </p>
          <div
            className="absolute bottom-0 left-0 h-[2px] w-full bg-[#DDDDFF]/20"
            role="progressbar"
            aria-label="Reading progress"
            aria-valuemin={1}
            aria-valuemax={rsvpWords.length}
            aria-valuenow={wordIndex + 1}
          >
            <div
              className="h-full bg-[#DDDDFF] transition-all duration-150"
              style={{
                width: `${((wordIndex + 1) / rsvpWords.length) * 100}%`,
              }}
            />
          </div>
        </div>
      ) : null}

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
