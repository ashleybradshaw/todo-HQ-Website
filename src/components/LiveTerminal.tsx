"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

const STREAM_MS = 900;
const MAX_VISIBLE = 11;

const BOOT_LOGS = [
  "[INFO] Initializing multi-agent pipeline...",
  "[PROCESS] Spawning orchestrator agents...",
  "[INFO] Reading TODO_HQ.ts...",
  "[PROCESS] Optimizing LLM routing...",
  "[SUCCESS] ReadyGo backend deployed.",
  "[INFO] Binding Repdaily production graph...",
  "[PROCESS] Compiling Contentic ingest queue...",
  "[SUCCESS] Handshake complete.",
  "[INFO] Evaluating tool permissions...",
  "[SUCCESS] Factory runtime ready.",
] as const;

const HEARTBEAT_LOGS = [
  "[PROCESS] Rebalancing agent load...",
  "[INFO] Repdaily graph heartbeat ok.",
  "[SUCCESS] ReadyGo healthcheck passed.",
  "[PROCESS] Contentic queue drain...",
  "[INFO] LLM router latency 41ms.",
  "[PROCESS] Compiling next workflow tick...",
  "[INFO] Multi-agent ecosystem: healthy.",
] as const;

export type FactoryLog = {
  id: number;
  text: string;
};

function logAt(tick: number): string {
  if (tick < BOOT_LOGS.length) {
    return BOOT_LOGS[tick];
  }

  return HEARTBEAT_LOGS[(tick - BOOT_LOGS.length) % HEARTBEAT_LOGS.length];
}

function logClass(line: string) {
  if (line.startsWith("[SUCCESS]")) {
    return "text-emerald-600";
  }

  if (line.startsWith("[PROCESS]")) {
    return "text-[#0A00E6]";
  }

  return "text-blue-900/70";
}

export function LiveTerminal({
  lines,
  clock,
}: {
  lines: FactoryLog[];
  clock: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="flex min-h-0 flex-1 flex-col"
      aria-label="Live agent terminal"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#0000FF]/15 px-3 py-2">
        <p className="font-jetbrains text-xs text-[#0A00E6]">
          TERMINAL // AGENT_LOGS
        </p>
        <p className="font-jetbrains text-xs tabular-nums text-blue-900/40">
          {clock}
        </p>
      </div>
      <div className="live-terminal-mask relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div
          className="font-jetbrains space-y-1.5 text-xs leading-4"
          aria-live="polite"
        >
          {lines.map((line) => (
            <motion.p
              key={line.id}
              className={logClass(line.text)}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {line.text}
            </motion.p>
          ))}
          <span
            className={cn(
              "mt-1 block h-3 w-1.5 bg-[#0A00E6]",
              !reduceMotion && "animate-pulse",
            )}
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}

export function useFactoryStream() {
  const reduceMotion = useReducedMotion();
  const [tick, setTick] = useState(reduceMotion ? BOOT_LOGS.length : 1);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const id = window.setInterval(() => {
      setTick((current) => current + 1);
    }, STREAM_MS);

    return () => window.clearInterval(id);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const count = reduceMotion ? BOOT_LOGS.length : tick;
  const lines: FactoryLog[] = [];

  for (let index = 0; index < count; index += 1) {
    lines.push({ id: index, text: logAt(index) });
  }

  const visible = lines.slice(-MAX_VISIBLE);
  const agents = 3 + ((1 + Math.floor(count / 4)) % 3);
  const sprint = (["READYGO", "REPDAILY", "CONTENTIC"] as const)[
    Math.floor(count / 5) % 3
  ];
  const clock = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  return { lines: visible, agents, sprint, clock, tick: count };
}
