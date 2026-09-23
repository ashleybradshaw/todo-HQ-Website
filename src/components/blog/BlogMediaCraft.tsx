"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

const FADE_MS = 280;

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type BlogMediaCraftProps = {
  children: ReactNode;
  className?: string;
  /** When false, skip IO and show children immediately (e.g. empty placeholder). */
  enabled?: boolean;
};

/**
 * Blog image craft: one-shot IO fade only. No colour overlay and no
 * saturate filter — news photography stays clear; callers keep elev shadow.
 */
export function BlogMediaCraft({
  children,
  className,
  enabled = true,
}: BlogMediaCraftProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );
  const [visible, setVisible] = useState(!enabled || reducedMotion);

  useEffect(() => {
    if (!enabled || reducedMotion) {
      setVisible(true);
      return;
    }

    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    let shown = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || shown) {
          return;
        }
        shown = true;
        setVisible(true);
        io.disconnect();
      },
      { threshold: 0.2 },
    );
    io.observe(shell);
    return () => io.disconnect();
  }, [enabled, reducedMotion]);

  return (
    <div
      ref={shellRef}
      className={cn("relative overflow-hidden", className)}
      style={{ ["--blog-media-fade-ms" as string]: `${FADE_MS}ms` }}
    >
      <div
        className={cn(
          "absolute inset-0 transition-opacity ease-out",
          visible ? "opacity-100" : "opacity-0",
          "motion-reduce:opacity-100 motion-reduce:transition-none",
        )}
        style={{ transitionDuration: "var(--blog-media-fade-ms)" }}
      >
        {children}
      </div>
    </div>
  );
}
