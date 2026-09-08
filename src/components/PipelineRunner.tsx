"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

const STAGE_DWELL_MS = 2400;
const PROGRESS_STEP_MS = 110;
const PROGRESS_HOLD_MS = 380;
const PROGRESS_MAX = 8;
const PROGRESS_STAGE = 2;
const REBOOT_MS = 720;

const REBOOT_LOGS = [
  "> REBOOTING FACTORY PIPELINE...",
  "> flushing stage buffers...",
  "> handshake ok.",
] as const;

type Stage = {
  id: string;
  code: string;
  phase: string;
  name: string;
  subtitle?: string;
  logs: readonly string[];
  hasProgress?: boolean;
};

const STAGES: readonly Stage[] = [
  {
    id: "ingest",
    code: "01",
    phase: "INGEST",
    name: "MAGIC_MOMENT",
    subtitle: "Idea System Source",
    logs: [],
  },
  {
    id: "exec",
    code: "02",
    phase: "EXEC",
    name: "IDEATION_PROCESSOR",
    logs: [
      "Extrapolating concept...",
      "Market fit mapping...",
      "MVP Scoping...",
      "Parameter Rating: PASS",
    ],
  },
  {
    id: "build",
    code: "03",
    phase: "BUILD",
    name: "MVP_PRODUCTION",
    logs: ["Agentic stack active", "Assembling core features"],
    hasProgress: true,
  },
  {
    id: "scale",
    code: "04",
    phase: "SCALE",
    name: "PUBLIC_BUILD_v1.5",
    logs: ["Deploying extended services", "Scaling architecture"],
  },
  {
    id: "sync",
    code: "05",
    phase: "SYNC",
    name: "EXTENDED_ROADMAP",
    logs: ["12-24mo Horizon Active", "User feedback loops: LISTENING"],
  },
];

function progressBracket(equals: number) {
  const clamped = Math.min(Math.max(equals, 0), PROGRESS_MAX);
  return `[${"=".repeat(clamped)}>${" ".repeat(PROGRESS_MAX + 2 - clamped)}]`;
}

function BlockCursor({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <motion.span
      aria-hidden="true"
      className="ml-1 inline-block h-[0.8em] w-[0.45em] translate-y-px bg-current align-text-bottom"
      animate={reduceMotion ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 1.05, repeat: Infinity, ease: "linear", times: [0, 0.46, 0.5, 1] }
      }
    />
  );
}

function BuildProgress({
  reduceMotion,
  onFilled,
}: {
  reduceMotion: boolean | null;
  onFilled: () => void;
}) {
  const [step, setStep] = useState(reduceMotion ? PROGRESS_MAX : 0);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    let current = 0;
    const interval = window.setInterval(() => {
      current += 1;
      setStep(current);

      if (current >= PROGRESS_MAX) {
        window.clearInterval(interval);
        onFilled();
      }
    }, PROGRESS_STEP_MS);

    return () => window.clearInterval(interval);
  }, [onFilled, reduceMotion]);

  return (
    <p className="whitespace-pre">
      {progressBracket(step)}
      <BlockCursor reduceMotion={reduceMotion} />
    </p>
  );
}

type PipelineRunnerProps = {
  rebootSignal?: number;
};

export function PipelineRunner({ rebootSignal = 0 }: PipelineRunnerProps) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [buildReady, setBuildReady] = useState(false);
  const [rebooting, setRebooting] = useState(false);
  const lastRebootSignal = useRef(rebootSignal);

  const markBuildReady = useCallback(() => {
    setBuildReady(true);
  }, []);

  useEffect(() => {
    if (lastRebootSignal.current === rebootSignal) {
      return;
    }

    lastRebootSignal.current = rebootSignal;
    setPinned(false);
    setActiveIndex(0);
    setBuildReady(false);
    setRebooting(true);

    const timeout = window.setTimeout(() => {
      setRebooting(false);
    }, reduceMotion ? 0 : REBOOT_MS);

    return () => window.clearTimeout(timeout);
  }, [rebootSignal, reduceMotion]);

  useEffect(() => {
    if (pinned || reduceMotion || rebooting) {
      return;
    }

    const waitingOnBuild =
      activeIndex === PROGRESS_STAGE && !buildReady && !reduceMotion;
    const delay =
      activeIndex === PROGRESS_STAGE ? PROGRESS_HOLD_MS : STAGE_DWELL_MS;

    if (waitingOnBuild) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setBuildReady(false);
      setActiveIndex((current) => (current + 1) % STAGES.length);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [activeIndex, buildReady, pinned, rebooting, reduceMotion]);

  function selectStage(index: number) {
    if (pinned && index === activeIndex) {
      setPinned(false);
      return;
    }

    setBuildReady(false);
    setActiveIndex(index);
    setPinned(true);
  }

  return (
    <section
      className="flex min-h-0 flex-1 flex-col bg-[#E6E6FA] text-[#0000FF]"
      aria-label="Factory pipeline"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[rgba(10,0,230,0.15)] px-3 py-2">
        <p className="font-jetbrains text-xs text-[#0000FF]">pipeline.log</p>
        <p className="font-jetbrains text-xs tabular-nums text-[#0000FF]/40">
          {rebooting ? "REBOOT" : pinned ? "PINNED" : "LIVE"}
          {" · "}
          {String(activeIndex + 1).padStart(2, "0")}/
          {String(STAGES.length).padStart(2, "0")}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <AnimatePresence>
          {rebooting ? (
            <motion.div
              key={`reboot-${rebootSignal}`}
              className="font-jetbrains mb-3 space-y-1 border-b border-[rgba(10,0,230,0.15)] pb-3 text-xs leading-4 text-[#0000FF]"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {REBOOT_LOGS.map((line, index) => (
                <motion.p
                  key={line}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                    delay: reduceMotion ? 0 : index * 0.08,
                  }}
                >
                  {line}
                  {index === REBOOT_LOGS.length - 1 ? (
                    <BlockCursor reduceMotion={reduceMotion} />
                  ) : null}
                </motion.p>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <ol className="font-jetbrains">
          {STAGES.map((stage, index) => {
            const active = index === activeIndex && !rebooting;
            const lines = [
              ...(stage.subtitle ? [stage.subtitle] : []),
              ...stage.logs,
            ];

            return (
              <li
                key={stage.id}
                className="border-b border-[rgba(10,0,230,0.15)] last:border-b-0"
              >
                <button
                  type="button"
                  aria-expanded={active}
                  aria-current={active ? "step" : undefined}
                  onClick={() => selectStage(index)}
                  className={cn(
                    "flex w-full cursor-pointer items-baseline gap-2 bg-transparent py-2 text-left text-xs leading-4 lg:text-[13px] lg:leading-5",
                    active ? "text-[#0000FF]" : "text-[#0000FF]/40",
                  )}
                >
                  <span className="w-3 shrink-0" aria-hidden="true">
                    {active ? ">" : " "}
                  </span>
                  <span>
                    [{stage.code}] {stage.phase}: {stage.name}
                  </span>
                </button>

                <motion.div
                  initial={false}
                  animate={
                    active
                      ? { height: "auto", opacity: 1 }
                      : { height: 0, opacity: 0 }
                  }
                  transition={{
                    duration: reduceMotion ? 0 : 0.3,
                    ease: "easeOut",
                  }}
                  className="overflow-hidden"
                >
                  <div
                    className="space-y-1 pb-2 pl-5 text-xs leading-4 text-[#0000FF]"
                    aria-hidden={!active}
                  >
                    {lines.map((line, lineIndex) => (
                      <p key={`${stage.id}-${line}`} className="whitespace-pre">
                        {line}
                        {active &&
                        !stage.hasProgress &&
                        lineIndex === lines.length - 1 ? (
                          <BlockCursor reduceMotion={reduceMotion} />
                        ) : null}
                      </p>
                    ))}
                    {stage.hasProgress && active ? (
                      <BuildProgress
                        reduceMotion={reduceMotion}
                        onFilled={markBuildReady}
                      />
                    ) : null}
                  </div>
                </motion.div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
