"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { PerspectiveGrid } from "@/components/PerspectiveGrid";
import { cn } from "@/lib/cn";

type Phase = "idle" | "countdown" | "reading" | "done";

type SequenceItem = { kind: "logo" } | { kind: "word"; text: string };

type Cue = "countdown" | "start" | "tick";

type AudioEngine = {
  context: AudioContext;
  countdownBeep: HTMLAudioElement;
  startBeep: HTMLAudioElement;
  wordTick: HTMLAudioElement;
};

const SCRIPT =
  "is an engineering team shipping AI-driven applications, multi-agent backends, and automated development lifecycles. We don’t just write code; we orchestrate the systems that write it. By leveraging multi-agent ecosystems and custom AI tooling, we automate the software development lifecycle. The result is faster shipping, scalable architecture, and a growing portfolio of in-house and client applications.";

const DISPLAY_SEQUENCE: SequenceItem[] = [
  { kind: "logo" },
  ...SCRIPT.split(/\s+/).filter(Boolean).map((text) => ({
    kind: "word" as const,
    text,
  })),
];

const BASE_WORD_MS = 180;
const COMMA_DELAY_MS = 250;
const SENTENCE_DELAY_MS = 420;
const FINAL_HOLD_MS = 1500;
const COUNTDOWN_MS = 800;
const WORD_CLASS =
  "font-unbounded text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight";

function delayForItem(item: SequenceItem, isLast: boolean) {
  if (isLast) {
    return FINAL_HOLD_MS;
  }

  if (item.kind === "logo") {
    return BASE_WORD_MS;
  }

  if (/,$/.test(item.text)) {
    return BASE_WORD_MS + COMMA_DELAY_MS;
  }

  if (/[.;]$/.test(item.text)) {
    return BASE_WORD_MS + SENTENCE_DELAY_MS;
  }

  return BASE_WORD_MS;
}

function createSound(src: string) {
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.load();
  return audio;
}

function unlockAudio() {
  const context = new AudioContext();
  void context.resume();

  const engine: AudioEngine = {
    context,
    countdownBeep: createSound("/sounds/beep.mp3"),
    startBeep: createSound("/sounds/start.mp3"),
    wordTick: createSound("/sounds/tick.mp3"),
  };

  return engine;
}

function synthesize(context: AudioContext, cue: Cue) {
  const now = context.currentTime;

  if (cue === "tick") {
    const duration = 0.03;
    const frames = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, frames, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < frames; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    filter.Q.value = 0.8;
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start(now);
    source.stop(now + duration);
    return;
  }

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const duration = cue === "start" ? 0.12 : 0.08;
  oscillator.type = "square";
  oscillator.frequency.value = cue === "start" ? 1200 : 800;
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

function sampleForCue(engine: AudioEngine, cue: Cue) {
  if (cue === "countdown") {
    return engine.countdownBeep;
  }

  if (cue === "start") {
    return engine.startBeep;
  }

  return engine.wordTick;
}

function playCue(engine: AudioEngine | null, enabled: boolean, cue: Cue) {
  if (!engine || !enabled) {
    return;
  }

  const sample = sampleForCue(engine, cue);
  const fallback = () => synthesize(engine.context, cue);

  if (sample.error) {
    fallback();
    return;
  }

  sample.currentTime = 0;
  const playback = sample.play();

  if (playback && typeof playback.catch === "function") {
    playback.catch(() => {
      fallback();
    });
  }
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

export function RSVPIntro() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [count, setCount] = useState(3);
  const [wordIndex, setWordIndex] = useState(0);
  const [skipHold, setSkipHold] = useState(false);
  const [fading, setFading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<AudioEngine | null>(null);
  const soundEnabledRef = useRef(soundEnabled);
  const previousWordIndexRef = useRef<number | null>(null);

  soundEnabledRef.current = soundEnabled;

  useEffect(() => {
    if (phase !== "countdown") {
      return;
    }

    playCue(
      audioRef.current,
      soundEnabledRef.current,
      count === 1 ? "start" : "countdown",
    );

    let value = count;

    const interval = window.setInterval(() => {
      value -= 1;

      if (value < 1) {
        window.clearInterval(interval);
        setPhase("reading");
        return;
      }

      setCount(value);
    }, COUNTDOWN_MS);

    return () => window.clearInterval(interval);
  }, [phase, count]);

  useEffect(() => {
    if (phase !== "reading") {
      previousWordIndexRef.current = null;
      return;
    }

    const previousIndex = previousWordIndexRef.current;
    const shouldTick =
      previousIndex === null || wordIndex !== previousIndex;

    previousWordIndexRef.current = wordIndex;

    if (shouldTick) {
      playCue(audioRef.current, soundEnabledRef.current, "tick");
    }

    const item = DISPLAY_SEQUENCE[wordIndex];
    const isLast = wordIndex >= DISPLAY_SEQUENCE.length - 1;

    const timeout = window.setTimeout(() => {
      if (isLast) {
        setPhase("done");
        setFading(true);
        return;
      }

      setWordIndex((index) => index + 1);
    }, delayForItem(item, isLast));

    return () => window.clearTimeout(timeout);
  }, [phase, wordIndex]);

  useEffect(() => {
    if (phase !== "done" || !skipHold) {
      return;
    }

    setFading(true);
  }, [phase, skipHold]);

  const item = DISPLAY_SEQUENCE[wordIndex];

  return (
    <div
      className={cn(
        "relative h-screen w-screen text-[#DDDDFF] transition-opacity duration-[400ms] ease-out",
        fading && "pointer-events-none opacity-0",
      )}
    >
      {phase === "idle" ? (
        <div className="font-space flex h-full w-full flex-col items-center justify-center">
          <p className="text-center">READY?</p>
          <div className="mt-6">
            <button
              type="button"
              className="cursor-pointer bg-transparent p-0"
              onClick={() => {
                audioRef.current = unlockAudio();
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
                setSkipHold(true);
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
        <Centered className={WORD_CLASS}>{String(count)}</Centered>
      ) : null}

      {phase === "reading" ? (
        <>
          <PerspectiveGrid />
          <Centered>
            {item.kind === "logo" ? (
              <Logo className={WORD_CLASS} />
            ) : (
              <span className={WORD_CLASS}>{item.text}</span>
            )}
          </Centered>
        </>
      ) : null}
    </div>
  );
}
