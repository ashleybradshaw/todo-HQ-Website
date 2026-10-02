"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Off-screen frames start as bones after hydration, then fade the image in once.
 * In view on mount, reduced motion, and no-JS all leave the image visible.
 */
export function FrameReveal({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"plain" | "bone" | "shown">("plain");

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = root.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) return;

    setPhase("bone");
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setPhase("shown");
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative min-w-0">
      <div
        className={cn(
          phase === "bone" && "opacity-0",
          phase === "shown" &&
            "opacity-100 transition-opacity duration-[400ms] ease-in-out motion-reduce:transition-none",
        )}
        style={
          phase === "shown"
            ? { transitionDelay: `${index * 50}ms` }
            : undefined
        }
      >
        {children}
      </div>
      {phase === "bone" ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[4px] bg-[color-mix(in_srgb,var(--foreground)_10%,var(--background))]"
        />
      ) : null}
    </div>
  );
}
