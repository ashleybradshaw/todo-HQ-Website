"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Thin Spray-safe reading progress bar fixed to the top of the viewport.
 */
export function BlogReadingProgress({
  targetId = "blog-article-body",
}: {
  targetId?: string;
}) {
  const rafRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );

  useEffect(() => {
    const update = () => {
      rafRef.current = 0;
      const target = document.getElementById(targetId);
      const root = target?.closest("article") ?? target;
      if (!root) {
        setProgress(0);
        return;
      }

      const rect = root.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const start = rect.top + scrollTop;
      const end = start + root.offsetHeight - window.innerHeight;
      if (end <= start) {
        setProgress(scrollTop > start ? 1 : 0);
        return;
      }
      const next = Math.min(1, Math.max(0, (scrollTop - start) / (end - start)));
      setProgress(next);
    };

    const onScroll = () => {
      if (rafRef.current) {
        return;
      }
      rafRef.current = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetId]);

  return (
    <div
      id="blog-reading-progress"
      aria-hidden="true"
      className="pointer-events-none fixed top-0 right-0 left-0 z-50 h-0.5 bg-transparent"
    >
      <div
        className="h-full bg-current"
        style={{
          width: `${Math.round(progress * 100)}%`,
          transition: reducedMotion ? undefined : "width 80ms linear",
        }}
      />
    </div>
  );
}
