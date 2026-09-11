"use client";

import { useEffect, useRef } from "react";
import {
  SprayCanIcon,
  type SprayCanIconHandle,
} from "@animateicons/react/lucide";
import { useSpray } from "@/components/SprayProvider";
import { cn } from "@/lib/cn";

const SPRAY_DURATION = 1.15;

export function SprayButton({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { randomize } = useSpray();
  const iconRef = useRef<SprayCanIconHandle>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      return;
    }

    const play = () => iconRef.current?.startAnimation();
    play();
    const timer = window.setInterval(play, SPRAY_DURATION * 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <button
      type="button"
      aria-label="Spray a new accessible colour palette"
      className={cn(
        "relative inline-flex w-fit cursor-pointer items-center justify-center overflow-hidden rounded-[4px] border border-current px-3 py-1.5 font-jetbrains text-xs font-bold tracking-wider uppercase transition-colors duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none",
        compact && "size-8 px-0 py-0",
      )}
      onClick={randomize}
    >
      <span className="relative z-10 inline-flex items-center gap-2">
        <SprayCanIcon
          ref={iconRef}
          size={16}
          color="currentColor"
          duration={SPRAY_DURATION}
          isAnimated
          className="pointer-events-none shrink-0"
        />
        {compact ? <span className="sr-only">Spray</span> : "Spray"}
      </span>
      <span aria-hidden="true" className="spray-shine-wash" />
      <span aria-hidden="true" className="spray-shine-edge" />
    </button>
  );
}
