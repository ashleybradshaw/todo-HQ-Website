"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

const STREAM_MS = 1400;

const AGENT_LOGS = [
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
  "[PROCESS] Scheduling next workflow tick...",
  "[INFO] Multi-agent ecosystem: healthy.",
] as const;

function logClass(line: string) {
  if (line.startsWith("[SUCCESS]")) {
    return "text-emerald-600";
  }

  if (line.startsWith("[PROCESS]")) {
    return "text-[#0A00E6]";
  }

  return "text-blue-900/70";
}

export function LiveTerminal() {
  const reduceMotion = useReducedMotion();
  const [streamedCount, setStreamedCount] = useState(0);
  const visibleCount = reduceMotion ? AGENT_LOGS.length : streamedCount;

  useEffect(() => {
    if (reduceMotion || streamedCount >= AGENT_LOGS.length) {
      return;
    }

    const id = window.setTimeout(
      () => {
        setStreamedCount((count) => count + 1);
      },
      streamedCount === 0 ? 400 : STREAM_MS,
    );

    return () => window.clearTimeout(id);
  }, [reduceMotion, streamedCount]);

  const lines = AGENT_LOGS.slice(0, visibleCount);

  return (
    <aside
      className="flex h-full min-h-0 flex-col border-t border-[#0000FF]/15 lg:border-t-0 lg:border-l"
      aria-label="Live agent terminal"
    >
      <div className="flex shrink-0 items-center border-b border-[#0000FF]/15 px-4 py-2">
        <p className="font-jetbrains text-xs text-[#0A00E6]">
          TERMINAL // AGENT_LOGS
        </p>
      </div>
      <div className="live-terminal-mask relative min-h-0 flex-1 overflow-hidden px-4 py-3">
        <div
          className="font-jetbrains space-y-1.5 text-xs leading-4"
          aria-live="polite"
        >
          {lines.map((line, index) => (
            <motion.p
              key={`${line}-${index}`}
              className={logClass(line)}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {line}
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
    </aside>
  );
}
