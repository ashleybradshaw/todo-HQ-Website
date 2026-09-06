"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const APPS = ["Repdaily", "ReadyGo", "Contentic"] as const;
const AGENTS = ["architect", "engine", "ship"] as const;
const STEPS_PER_APP = 8;
const TICK_MS = 900;
const REVEAL = { duration: 0.4, ease: "easeOut" as const };

type Agent = (typeof AGENTS)[number];
type Refine = "scaffold" | "refine" | "in production";

function frameFor(tick: number) {
  const app = APPS[Math.floor(tick / STEPS_PER_APP) % APPS.length];
  const step = tick % STEPS_PER_APP;
  const logs = [
    "$ todo factory run",
    "llm  reading TODO_HQ.ts",
    "ok   multi-agent ecosystem",
    "agent.architect  drafting graph",
    "agent.engine     compiling workflow",
    `agent.ship       assembling ${app}`,
    `refine           ${app}`,
    `ok   ${app} · in production`,
  ];

  const agent: Agent | null =
    step === 3 ? "architect" : step === 4 ? "engine" : step >= 5 ? "ship" : null;

  const refine: Refine | null =
    step < 5 ? null : step === 5 ? "scaffold" : step === 6 ? "refine" : "in production";

  return {
    app,
    logs: logs.slice(0, step + 1),
    agent,
    refine,
    complete: step === 7,
  };
}

function Spine({ ready }: { ready: boolean }) {
  return (
    <div className="flex justify-center py-1" aria-hidden="true">
      <motion.div
        className="h-6 w-px origin-top bg-[rgba(10,0,230,0.3)]"
        initial={{ scaleY: ready ? 1 : 0 }}
        animate={{ scaleY: ready ? 1 : 0 }}
        transition={REVEAL}
      />
    </div>
  );
}

export function FactoryPipeline({
  reduceMotion,
  className,
}: {
  reduceMotion: boolean;
  className?: string;
}) {
  const [tick, setTick] = useState(reduceMotion ? STEPS_PER_APP - 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const id = window.setInterval(() => {
      setTick((current) => current + 1);
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const frame = frameFor(reduceMotion ? STEPS_PER_APP - 1 : tick);

  return (
    <div
      className={cn(
        "font-jetbrains relative flex h-full min-h-0 w-full text-[#111111]",
        className,
      )}
      aria-hidden="true"
    >
      <div className="relative hidden w-12 shrink-0 lg:block">
        {[18, 30, 42].map((top) => (
          <motion.span
            key={top}
            className="absolute right-0 left-0 h-px origin-left bg-[rgba(10,0,230,0.3)]"
            style={{ top: `${top}%` }}
            initial={{ scaleX: reduceMotion ? 1 : 0 }}
            animate={{ scaleX: 1 }}
            transition={REVEAL}
          />
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-start gap-3 overflow-visible px-4 py-3 lg:justify-evenly lg:gap-0 lg:overflow-hidden lg:pr-8 lg:pl-0">
        <div className="border border-[rgba(10,0,230,0.15)]">
          <div className="flex items-center justify-between border-b border-[rgba(10,0,230,0.15)] px-3 py-1.5">
            <span className="text-[11px] text-[#0A00E6]">cli · factory</span>
            <span className="text-[11px] text-blue-900/30">llm</span>
          </div>
          <div className="space-y-0.5 px-3 py-2 text-[11px] leading-4">
            {frame.logs.map((line, index) => (
              <motion.p
                key={`${frame.app}-${index}-${line}`}
                className={
                  line.startsWith("ok") || line.startsWith("$")
                    ? "text-[#0A00E6]"
                    : "text-[#111111]"
                }
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={REVEAL}
              >
                {line}
                {index === frame.logs.length - 1 && !frame.complete ? (
                  <span className="ml-1 inline-block h-3 w-1.5 translate-y-px bg-[#0A00E6] align-middle" />
                ) : null}
              </motion.p>
            ))}
          </div>
        </div>

        <Spine ready={reduceMotion || frame.logs.length > 2} />

        <div className="border border-[rgba(10,0,230,0.15)]">
          <div className="border-b border-[rgba(10,0,230,0.15)] px-3 py-1.5 text-[11px] text-[#0A00E6]">
            agents
          </div>
          <div className="grid grid-cols-3">
            {AGENTS.map((agent) => {
              const active = frame.agent === agent;
              return (
                <div
                  key={agent}
                  className={cn(
                    "px-3 py-2 text-[11px] leading-4",
                    agent !== "ship" && "border-r border-[rgba(10,0,230,0.15)]",
                    active ? "text-[#0A00E6]" : "text-blue-900/40",
                  )}
                >
                  <span className={active ? "text-[#0A00E6]" : "opacity-0"}>
                    ▸{" "}
                  </span>
                  {agent}
                </div>
              );
            })}
          </div>
        </div>

        <Spine ready={reduceMotion || frame.refine !== null} />

        <div className="border border-[rgba(10,0,230,0.15)]">
          <div className="flex items-center justify-between border-b border-[rgba(10,0,230,0.15)] px-3 py-1.5">
            <span className="text-[11px] text-[#0A00E6]">output</span>
            <span className="text-[11px] text-blue-900/30">
              {frame.refine ?? "queued"}
            </span>
          </div>
          <div className="px-3 py-3">
            <motion.p
              key={frame.app}
              className="text-sm text-[#111111]"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={REVEAL}
            >
              {frame.app}
            </motion.p>
            <p className="mt-1 text-[11px] text-blue-900/50">
              {frame.refine ?? "waiting on factory"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
