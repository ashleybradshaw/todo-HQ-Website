"use client";

import { Fragment, useCallback, useState, type ReactNode } from "react";
import { useFactoryStream } from "@/hooks/useFactoryStream";
import { PipelineRunner } from "@/components/PipelineRunner";
import { Telemetry } from "@/components/Telemetry";

/** 0-based index of the methodology / executePipeline() line in codeLines. */
const EXECUTE_PIPELINE_LINE = 18;

const ACTIVE_LINE_BG =
  "bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)]";

function Comment({ children }: { children: ReactNode }) {
  return <span className="text-syn-comment italic">{children}</span>;
}

function Keyword({ children }: { children: ReactNode }) {
  return <span className="text-syn-keyword font-bold">{children}</span>;
}

function Property({ children }: { children: ReactNode }) {
  return <span className="text-syn-property">{children}</span>;
}

function Str({ children }: { children: ReactNode }) {
  return <span className="text-syn-string">{children}</span>;
}

function Bracket({ children }: { children: ReactNode }) {
  return <span className="text-syn-bracket">{children}</span>;
}

function Punct({ children }: { children: ReactNode }) {
  return <span className="text-syn-property">{children}</span>;
}

function Fn({
  children,
  onActivate,
}: {
  children: ReactNode;
  onActivate: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onActivate}
      onMouseEnter={onActivate}
      aria-label="Restart factory pipeline"
      className="text-syn-keyword cursor-pointer bg-transparent p-0 font-jetbrains hover:underline focus-visible:underline"
    >
      {children}
    </button>
  );
}

function codeLines(onExecutePipeline: () => void): ReactNode[] {
  return [
    <Fragment key={1}>
      <Comment>{`/** Internal software factory. Source of record. TEST COPY — rewrite later. */`}</Comment>
    </Fragment>,
    <Fragment key={2}>
      <Keyword>export const</Keyword> TODO_HQ <Punct>=</Punct>{" "}
      <Bracket>{"{"}</Bracket>
    </Fragment>,
    <Fragment key={3}>
      {"  "}
      <Property>manifesto</Property>
      <Punct>:</Punct>{" "}
      <Str>{`"Most teams just write code. We build the entire factory."`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={4}>
      {"  "}
      <Property>whoWeShipFor</Property>
      <Punct>:</Punct> <Bracket>[</Bracket>
    </Fragment>,
    <Fragment key={5}>
      {"    "}
      <Str>{`"CTOs who need the stack shipped this quarter"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={6}>
      {"    "}
      <Str>{`"Non-tech founders with an idea, not an eng org"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={7}>
      {"    "}
      <Str>{`"CMS / content contracts that need ops, not just pages"`}</Str>
    </Fragment>,
    <Fragment key={8}>
      {"  "}
      <Bracket>{"]"}</Bracket>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={9}>
      {"  "}
      <Property>pipeline</Property>
      <Punct>:</Punct> <Bracket>[</Bracket>
    </Fragment>,
    <Fragment key={10}>
      {"    "}
      <Str>{`"intake"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={11}>
      {"    "}
      <Str>{`"review"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={12}>
      {"    "}
      <Str>{`"agiFlow"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={13}>
      {"    "}
      <Str>{`"lpPipeline"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={14}>
      {"    "}
      <Str>{`"analysis"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={15}>
      {"    "}
      <Str>{`"ship"`}</Str>
    </Fragment>,
    <Fragment key={16}>
      {"  "}
      <Bracket>{"]"}</Bracket>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={17}>
      {"  "}
      <Property>agiFlow</Property>
      <Punct>:</Punct>{" "}
      <Str>{`"Brief → research agents → draft → human gate → ship."`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={18}>
      {"  "}
      <Property>lpPipeline</Property>
      <Punct>:</Punct>{" "}
      <Str>{`"Offer → layout → copy pass → QA → launch."`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={19}>
      {"  "}
      <Property>methodology</Property>
      <Punct>:</Punct>{" "}
      <Fn onActivate={onExecutePipeline}>executePipeline()</Fn>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={20}>
      {"  "}
      <Property>inProduction</Property>
      <Punct>:</Punct> <Bracket>[</Bracket>
    </Fragment>,
    <Fragment key={21}>
      {"    "}
      <Str>{`"Repdaily"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={22}>
      {"    "}
      <Str>{`"ReadyGo"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={23}>
      {"    "}
      <Str>{`"Contentic"`}</Str>
    </Fragment>,
    <Fragment key={24}>
      {"  "}
      <Bracket>{"]"}</Bracket>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={25}>
      {"  "}
      <Property>velocity</Property>
      <Punct>:</Punct> <Str>{`"Production-ready. Fast."`}</Str>
    </Fragment>,
    <Fragment key={26}>
      <Bracket>{"}"}</Bracket>
      <Punct>;</Punct>
    </Fragment>,
  ];
}

function FactorySidecar({ rebootSignal }: { rebootSignal: number }) {
  const feed = useFactoryStream();

  return (
    <>
      <PipelineRunner rebootSignal={rebootSignal} />
      <Telemetry
        agents={feed.agents}
        sprint={feed.sprint}
        tick={feed.tick}
      />
    </>
  );
}

export function FactoryDashboard() {
  const [rebootSignal, setRebootSignal] = useState(0);

  const rebootPipeline = useCallback(() => {
    setRebootSignal((current) => current + 1);
  }, []);

  const lines = codeLines(rebootPipeline);

  return (
    <main className="bg-bg-canvas text-syn-property relative h-screen min-h-screen w-full overflow-hidden transition-[background-color,color] duration-[400ms] ease-in-out">
      <div className="font-jetbrains relative z-10 flex h-full min-h-screen w-full flex-col pt-20">
        <h1 className="sr-only">
          {"//TODO Engineering factory dashboard"}
        </h1>
        <p className="sr-only">
          The team behind //TODO runs an internal software factory for CTOs,
          non-tech founders, and CMS ops contracts. Pipeline: intake, review,
          agiFlow, lpPipeline, analysis, ship. Methodology is executePipeline()
          — AGI brief-to-ship and LP offer-to-launch — with Repdaily, ReadyGo,
          and Contentic in production.
        </p>
        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(14rem,42%)] overflow-hidden lg:grid-cols-[70%_30%] lg:grid-rows-1">
          <section
            className="flex min-h-0 min-w-0 flex-col overflow-hidden"
            aria-label="TODO_HQ TypeScript source"
          >
            <div
              className="flex shrink-0 items-stretch border-b border-border-ide"
              aria-hidden="true"
            >
              <span
                className={`border-border-ide text-syn-keyword border-b-2 px-4 py-2 text-xs ${ACTIVE_LINE_BG}`}
              >
                TODO_HQ.ts
              </span>
              <span className="text-syn-comment px-4 py-2 text-xs opacity-50 select-none">
                pipeline.run
              </span>
              <span className="text-syn-comment px-4 py-2 text-xs opacity-50 select-none">
                telemetry.json
              </span>
            </div>
            <div className="flex min-h-0 flex-1 overflow-auto text-xs leading-5 lg:text-sm lg:leading-6">
              <div
                aria-hidden="true"
                className="text-syn-number flex w-8 shrink-0 flex-col border-r border-border-ide py-4 text-right select-none lg:w-10"
              >
                {lines.map((_, index) => (
                  <span
                    key={index}
                    className={`pr-2 leading-5 lg:pr-3 lg:leading-6 ${
                      index === EXECUTE_PIPELINE_LINE ? ACTIVE_LINE_BG : ""
                    }`}
                  >
                    {index + 1}
                  </span>
                ))}
              </div>
              <pre className="min-w-0 flex-1 py-4">
                <code className="font-jetbrains">
                  {lines.map((line, index) => (
                    <div
                      key={index}
                      className={`whitespace-pre pr-6 pl-4 ${
                        index === EXECUTE_PIPELINE_LINE ? ACTIVE_LINE_BG : ""
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </code>
              </pre>
            </div>
            <div className="border-border-ide text-syn-comment shrink-0 border-t px-4 py-1 text-[10px] tracking-wide lg:text-xs">
              UTF-8 · LF · TypeScript · TEST COPY
            </div>
          </section>
          <aside
            className="flex min-h-0 flex-col border-t border-border-ide lg:border-t-0 lg:border-l"
            aria-label="Factory sidecar"
          >
            <FactorySidecar rebootSignal={rebootSignal} />
          </aside>
        </div>
      </div>
    </main>
  );
}
