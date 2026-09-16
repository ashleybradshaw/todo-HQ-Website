"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { BallPoolHandle } from "@/components/blog/startBlogBallPool";
import { useSpray } from "@/components/SprayProvider";

type SandboxStatus = "standby" | "loading" | "live" | "error";

const playClass =
  "inline-flex cursor-pointer items-center justify-center rounded-[4px] border border-current bg-background px-3 py-1.5 font-jetbrains text-xs font-bold tracking-wider uppercase transition-[opacity,color,background-color] duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none disabled:cursor-wait disabled:opacity-60";

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function BlogSandbox() {
  const stageRef = useRef<HTMLDivElement>(null);
  const poolRef = useRef<BallPoolHandle | null>(null);
  const visibleRef = useRef(true);
  const mountedRef = useRef(true);
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );
  const [status, setStatus] = useState<SandboxStatus>("standby");
  const { pair } = useSpray();

  const syncRun = useCallback(() => {
    const pool = poolRef.current;
    if (!pool) {
      return;
    }
    if (visibleRef.current && document.visibilityState === "visible") {
      pool.resume();
      return;
    }
    pool.pause();
  }, []);

  useEffect(() => {
    if (reducedMotion && poolRef.current) {
      poolRef.current.destroy();
      poolRef.current = null;
      setStatus("standby");
    }
  }, [reducedMotion]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || status !== "live") {
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        syncRun();
      },
      { threshold: 0.15 },
    );
    io.observe(stage);

    const onVisibility = () => syncRun();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [status, syncRun]);

  useEffect(() => {
    if (status !== "live") {
      return;
    }
    poolRef.current?.recolor({ bg: pair.bg, fg: pair.text });
  }, [pair.bg, pair.text, status]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      poolRef.current?.destroy();
      poolRef.current = null;
    };
  }, []);

  async function play() {
    if (getReducedMotion() || poolRef.current || status === "loading") {
      return;
    }

    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    setStatus("loading");
    try {
      const { startBlogBallPool } = await import(
        "@/components/blog/startBlogBallPool"
      );
      if (
        !mountedRef.current ||
        getReducedMotion() ||
        !stageRef.current
      ) {
        if (mountedRef.current) {
          setStatus("standby");
        }
        return;
      }
      poolRef.current = startBlogBallPool(stage, {
        bg: pair.bg,
        fg: pair.text,
      });
      visibleRef.current = true;
      setStatus("live");
    } catch {
      if (!mountedRef.current) {
        return;
      }
      poolRef.current = null;
      setStatus("error");
    }
  }

  const meta =
    status === "live" ? "LIVE" : status === "loading" ? "LOADING" : "STANDBY";
  const showPlay = isClient && !reducedMotion && status !== "live";

  return (
    <section
      id="blog-sandbox"
      className="border border-border-ide"
      aria-label="Sandbox playground"
    >
      <div className="flex items-center justify-between border-b border-border-ide px-3 py-2">
        <p className="font-jetbrains text-syn-keyword text-xs">
          sandbox.ballpool
        </p>
        <p
          className={
            status === "live"
              ? "font-jetbrains text-xs"
              : "font-jetbrains text-syn-comment text-xs"
          }
        >
          {meta}
        </p>
      </div>
      <div className="relative aspect-video w-full bg-background transition-[background-color] duration-[400ms] ease-in-out">
        <div ref={stageRef} className="absolute inset-0 overflow-hidden" />
        {showPlay ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            {status === "error" ? (
              <div className="flex flex-col items-center gap-3 px-4">
                <p className="font-jetbrains text-syn-comment text-center text-sm">
                  Playground unavailable
                </p>
                <button
                  type="button"
                  className={playClass}
                  onClick={() => {
                    void play();
                  }}
                >
                  TRY AGAIN
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={playClass}
                disabled={status === "loading"}
                onClick={() => {
                  void play();
                }}
              >
                {status === "loading" ? "LOADING" : "CLICK TO PLAY"}
              </button>
            )}
          </div>
        ) : null}
        {isClient && reducedMotion ? (
          <p className="font-jetbrains text-syn-comment pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-sm">
            Playground paused
          </p>
        ) : null}
      </div>
    </section>
  );
}
