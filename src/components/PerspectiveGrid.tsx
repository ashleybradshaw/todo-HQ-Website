"use client";

import { useId } from "react";
import { motion } from "framer-motion";

export function PerspectiveGrid() {
  const patternId = `perspective-wireframe-${useId().replace(/:/g, "")}`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden text-foreground"
    >
      <motion.div
        className="absolute top-1/2 left-1/2 h-[140%] w-[140%] opacity-15"
        initial={{ scale: 1, x: "-50%", y: "-50%" }}
        animate={{ scale: 1.3, x: "-50%", y: "-50%" }}
        transition={{ duration: 15, ease: "linear" }}
      >
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id={patternId}
              width="64"
              height="64"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 64 0 L 0 0 0 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
      </motion.div>
    </div>
  );
}
