"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { homePage } from "@/content/pages/home";

const STAGE_DWELL_MS = 2400;
const PROGRESS_STEP_MS = 110;
const PROGRESS_HOLD_MS = 380;
const PROGRESS_MAX = 8;
const PROGRESS_STAGE = 2;
const REBOOT_MS = 720;
const COMPILE_MS = 300;

const SKELETON_BAR_WIDTHS = ["w-[92%]", "w-[68%]", "w-[84%]", "w-[54%]"] as const;

/** Tallest stage body (BUILD: 2 lines + progress). Fixed slot — no layout thrash. */
const DETAIL_SLOT = "5.25rem";
/** Header × 5 + detail + reboot — fits at 1280/390 with overflow-hidden (no grow). */
const LOG_VIEWPORT = "17.5rem";

const { pipelineRunner } = homePage;
const REBOOT_LOGS = pipelineRunner.rebootLogs;

type Stage = {
  id: string;
  code: string;
  phase: string;
  name: string;
  subtitle?: string;
  logs: readonly string[];
  hasProgress?: boolean;
};

const STAGES = pipelineRunner.stages as readonly Stage[];
function progressBracket(equals: number) {
  const clamped = Math.min(Math.max(equals, 0), PROGRESS_MAX);
  return `[${"=".repeat(clamped)}>${" ".repeat(PROGRESS_MAX + 2 - clamped)}]`;
}

function LogSkeleton() {
  return (
    <div className="space-y-1" aria-hidden="true">
      {SKELETON_BAR_WIDTHS.map((width) => (
        <div
          key={width}
          className={cn(
            "h-3.5 rounded-[1px]",
            width,
            "animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-foreground/5 via-foreground/15 to-foreground/5 motion-reduce:animate-none",
          )}
        />
      ))}
    </div>
  );
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
  /** Lifted for status-bar "pipeline 0n/05". */
  onActiveIndexChange?: (index: number) => void;
};

export function PipelineRunner({
  rebootSignal = 0,
  onActiveIndexChange,
}: PipelineRunnerProps) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [buildReady, setBuildReady] = useState(false);
  const [rebooting, setRebooting] = useState(false);
  const compileKey = `${rebooting ? "reboot" : "live"}-${rebootSignal}-${activeIndex}-${reduceMotion ? "still" : "motion"}`;
  const [loadingKey, setLoadingKey] = useState(compileKey);
  const [isLoading, setIsLoading] = useState(true);
  const lastRebootSignal = useRef(rebootSignal);

  if (loadingKey !== compileKey) {
    setLoadingKey(compileKey);
    setIsLoading(!rebooting && !reduceMotion);
  }

  const markBuildReady = useCallback(() => {
    setBuildReady(true);
  }, []);

  useEffect(() => {
    onActiveIndexChange?.(activeIndex);
  }, [activeIndex, onActiveIndexChange]);

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
    if (!isLoading) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsLoading(false);
    }, COMPILE_MS);

    return () => window.clearTimeout(timeout);
  }, [isLoading, loadingKey]);

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
      className="bg-bg-canvas text-foreground flex shrink-0 flex-col transition-[background-color,color] duration-[400ms] ease-in-out"
      aria-label={pipelineRunner.sectionAria}
    >
      <div className="border-b border-border-ide flex shrink-0 items-center justify-between px-2 py-1.5">
        <p className="font-jetbrains text-muted text-[10px] tracking-wide lg:text-[11px]">
          {pipelineRunner.header}
        </p>
        <p className="font-jetbrains text-[10px] tabular-nums lg:text-[11px]">
          {isLoading ? (
            <span className="text-syn-number">
              {pipelineRunner.compiling}
            </span>
          ) : (
            <span className="text-muted">
              {rebooting
                ? pipelineRunner.mode.reboot
                : pinned
                  ? pipelineRunner.mode.pinned
                  : pipelineRunner.mode.live}
              {" · "}
              {String(activeIndex + 1).padStart(2, "0")}/
              {String(STAGES.length).padStart(2, "0")}
            </span>
          )}
        </p>
      </div>

      <div
        className="overflow-hidden px-2 py-1"
        style={{ height: LOG_VIEWPORT }}
      >
        <AnimatePresence>
          {rebooting ? (
            <motion.div
              key={`reboot-${rebootSignal}`}
              className="font-jetbrains text-foreground mb-1.5 space-y-0.5 border-b border-border-ide pb-1.5 text-xs leading-4"
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
                className="border-b border-border-ide last:border-b-0"
              >
                <button
                  type="button"
                  aria-expanded={active}
                  aria-current={active ? "step" : undefined}
                  onClick={() => selectStage(index)}
                  className={cn(
                    "flex w-full cursor-pointer items-baseline gap-2 bg-transparent py-1 text-left text-xs leading-4",
                    active ? "text-foreground" : "text-muted",
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
                      ? { height: DETAIL_SLOT, opacity: 1 }
                      : { height: 0, opacity: 0 }
                  }
                  transition={{
                    duration: reduceMotion ? 0 : 0.3,
                    ease: "easeOut",
                  }}
                  className="overflow-hidden"
                >
                  <div
                    className="text-foreground space-y-0.5 overflow-hidden pb-1 pl-5 text-xs leading-4"
                    style={{ height: DETAIL_SLOT }}
                    aria-hidden={!active}
                    aria-busy={active && isLoading}
                  >
                    {active && isLoading ? (
                      <LogSkeleton />
                    ) : (
                      <>
                        {lines.map((line, lineIndex) => (
                          <motion.p
                            key={`${stage.id}-${line}`}
                            className="whitespace-pre"
                            initial={reduceMotion ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                              duration: reduceMotion ? 0 : 0.4,
                              ease: "easeOut",
                            }}
                          >
                            {line}
                            {active &&
                            !stage.hasProgress &&
                            lineIndex === lines.length - 1 ? (
                              <BlockCursor reduceMotion={reduceMotion} />
                            ) : null}
                          </motion.p>
                        ))}
                        {stage.hasProgress && active ? (
                          <BuildProgress
                            reduceMotion={reduceMotion}
                            onFilled={markBuildReady}
                          />
                        ) : null}
                      </>
                    )}
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
