"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { FactoryPipeline } from "@/components/FactoryPipeline";
import { PhyllotaxisBloom } from "@/components/PhyllotaxisBloom";
import { useMousePosition } from "@/hooks/useMousePosition";

const PARALLAX_DISTANCE = 28;
const PARALLAX_ROTATE = 4;

function Comment({ children }: { children: ReactNode }) {
  return <span className="italic text-blue-900/50">{children}</span>;
}

function Keyword({ children }: { children: ReactNode }) {
  return <span className="font-bold text-[#0A00E6]">{children}</span>;
}

function Str({ children }: { children: ReactNode }) {
  return <span className="text-emerald-600">{children}</span>;
}

function Punct({ children }: { children: ReactNode }) {
  return <span className="text-blue-900/70">{children}</span>;
}

const CODE_LINES: ReactNode[] = [
  <Fragment key={1}>
    <Comment>{`/** A little more about us and what we do. */`}</Comment>
  </Fragment>,
  <Fragment key={2}>
    <Keyword>export const</Keyword> TODO_HQ <Punct>=</Punct> <Punct>{"{"}</Punct>
  </Fragment>,
  <Fragment key={3}>
    {"  "}manifesto<Punct>:</Punct>{" "}
    <Str>{`"We don't just write code; we build the factory."`}</Str>
    <Punct>,</Punct>
  </Fragment>,
  <Fragment key={4}>
    {"  "}coreInfrastructure<Punct>:</Punct> <Punct>[</Punct>
  </Fragment>,
  <Fragment key={5}>
    {"    "}
    <Str>{`"Multi-agent ecosystems"`}</Str>
    <Punct>,</Punct>
  </Fragment>,
  <Fragment key={6}>
    {"    "}
    <Str>{`"Automated workflows"`}</Str>
    <Punct>,</Punct>
  </Fragment>,
  <Fragment key={7}>
    {"    "}
    <Str>{`"Scalable backends"`}</Str>
  </Fragment>,
  <Fragment key={8}>
    {"  "}
    <Punct>{"],"}</Punct>
  </Fragment>,
  <Fragment key={9}>
    {"  "}inProduction<Punct>:</Punct> <Punct>[</Punct>
  </Fragment>,
  <Fragment key={10}>
    {"    "}
    <Str>{`"Repdaily"`}</Str>
    <Punct>,</Punct>
  </Fragment>,
  <Fragment key={11}>
    {"    "}
    <Str>{`"ReadyGo"`}</Str>
    <Punct>,</Punct>
  </Fragment>,
  <Fragment key={12}>
    {"    "}
    <Str>{`"Contentic"`}</Str>
  </Fragment>,
  <Fragment key={13}>
    {"  "}
    <Punct>{"],"}</Punct>
  </Fragment>,
  <Fragment key={14}>
    {"  "}velocity<Punct>:</Punct> <Str>{`"Production-ready. Fast."`}</Str>
  </Fragment>,
  <Fragment key={15}>
    <Punct>{"}"};</Punct>
  </Fragment>,
];

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
    <main className="relative h-screen min-h-screen w-full overflow-hidden bg-[#E6E6FA] text-[#111111]">
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-40">
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

      <div className="font-jetbrains relative z-10 flex h-full min-h-screen w-full flex-col pt-20">
        <h1 className="sr-only">A little more about us and what we do.</h1>
        <p className="sr-only">
          The team behind //TODO runs an internal software factory: source in
          TODO_HQ.ts, a CLI with LLM planning, a multi-agent team, then
          Repdaily, ReadyGo, and Contentic in production.
        </p>
        <div className="flex shrink-0 items-center justify-between border-b border-[rgba(10,0,230,0.15)] px-6 py-2">
          <span className="text-xs text-[#0A00E6]">TODO_HQ.ts</span>
          <span className="text-xs text-blue-900/30">TypeScript</span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-auto lg:flex-row lg:overflow-hidden">
          <div
            className="flex shrink-0 border-[rgba(10,0,230,0.15)] text-sm leading-6 lg:w-[min(36rem,50%)] lg:border-r"
            aria-label="TODO_HQ TypeScript source"
          >
            <div
              aria-hidden="true"
              className="flex w-10 shrink-0 flex-col border-r border-[rgba(10,0,230,0.15)] py-4 text-right text-blue-900/30 select-none"
            >
              {CODE_LINES.map((_, index) => (
                <span key={index} className="pr-3 leading-6">
                  {index + 1}
                </span>
              ))}
            </div>
            <pre className="min-w-0 flex-1 py-4">
              <code className="font-jetbrains">
                {CODE_LINES.map((line, index) => (
                  <div key={index} className="pr-6 pl-4 whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
              </code>
            </pre>
          </div>
          <FactoryPipeline
            reduceMotion={Boolean(reduceMotion)}
            className="shrink-0 lg:h-full lg:min-h-0 lg:flex-1"
          />
        </div>
      </div>
    </main>
  );
}
