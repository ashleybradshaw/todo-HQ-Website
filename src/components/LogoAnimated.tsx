"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { LOGO_PATHS, LOGO_VIEWBOX } from "@/components/LogoStatic";

type LogoAnimatedProps = {
  className?: string;
};

export function LogoAnimated({ className }: LogoAnimatedProps) {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={LOGO_VIEWBOX}
      fill="none"
      className={cn("h-[1em] w-auto", className)}
      aria-hidden="true"
      focusable="false"
    >
      {LOGO_PATHS.map((path, index) => (
        <g key={path.id}>
          {reduceMotion ? null : (
            <motion.path
              d={path.d}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinejoin="miter"
              strokeLinecap="butt"
              initial={{ pathLength: 0, opacity: 1 }}
              animate={{ pathLength: 1, opacity: 0 }}
              transition={{
                pathLength: {
                  duration: 0.4,
                  ease: "easeOut",
                  delay: index * 0.05,
                },
                opacity: {
                  duration: 0.3,
                  ease: "easeOut",
                  delay: 0.35 + index * 0.05,
                },
              }}
            />
          )}
          <motion.path
            d={path.d}
            fill="currentColor"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    duration: 0.4,
                    ease: "easeOut",
                    delay: 0.28 + index * 0.05,
                  }
            }
          />
        </g>
      ))}
    </svg>
  );
}
