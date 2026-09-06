"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { PhyllotaxisBloom } from "@/components/PhyllotaxisBloom";
import { useMousePosition } from "@/hooks/useMousePosition";

const PARALLAX_DISTANCE = 28;
const PARALLAX_ROTATE = 4;

export default function AboutPage() {
  const { x, y, isReady } = useMousePosition();
  const reduceMotion = useReducedMotion();
  const [viewport, setViewport] = useState({ width: 1, height: 1 });

  useEffect(() => {
    const syncViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);

    return () => {
      window.removeEventListener("resize", syncViewport);
    };
  }, []);

  const nx = isReady ? (x / viewport.width) * 2 - 1 : 0;
  const ny = isReady ? (y / viewport.height) * 2 - 1 : 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#DDDDFF] text-[#0B0CB4]">
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <PhyllotaxisBloom
          className="h-[min(100vw,100vh)] w-[min(100vw,100vh)] origin-center text-[#BFBFE1]"
          animate={
            reduceMotion
              ? { x: 0, y: 0, rotate: 0 }
              : {
                  x: -nx * PARALLAX_DISTANCE,
                  y: -ny * PARALLAX_DISTANCE,
                  rotate: -nx * PARALLAX_ROTATE,
                }
          }
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="relative z-10 max-w-[592px] px-6 pt-32 pb-16 md:px-16 lg:pl-[189px] lg:pr-8">
        <h1 className="font-space text-base leading-5 font-bold">
          A little more about us and what we do.
        </h1>
        <div className="font-space mt-4 flex flex-col gap-2.5 text-sm leading-[18px] font-normal tracking-[-0.01em]">
          <p>
            //TODO Engineering is an engineering team. We don’t just write code
            — we build the factory.
          </p>
          <p>
            Multi-agent systems. Automated workflows. Scalable backends. We
            design, code, and ship production-ready applications. Fast.
          </p>
          <p>
            The team behind //TODO runs that process in production on Repdaily,
            ReadyGo, and Contentic.
          </p>
        </div>
      </div>
    </main>
  );
}
