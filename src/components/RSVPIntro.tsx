"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";

type Phase = "idle" | "countdown" | "reading" | "done";

type SequenceItem = { kind: "logo" } | { kind: "word"; text: string };

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
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap",
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

  useEffect(() => {
    if (phase !== "countdown") {
      return;
    }

    let value = 3;

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
          </div>
        </div>
      ) : null}

      {phase === "countdown" ? (
        <Centered className={WORD_CLASS}>{String(count)}</Centered>
      ) : null}

      {phase === "reading" ? (
        <Centered>
          {item.kind === "logo" ? (
            <Logo className={WORD_CLASS} />
          ) : (
            <span className={WORD_CLASS}>{item.text}</span>
          )}
        </Centered>
      ) : null}
    </div>
  );
}
