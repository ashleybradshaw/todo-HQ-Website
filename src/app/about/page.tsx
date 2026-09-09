"use client";

import { Fragment, useCallback, useState, type ReactNode } from "react";
import { useFactoryStream } from "@/hooks/useFactoryStream";
import { PipelineRunner } from "@/components/PipelineRunner";
import { Telemetry } from "@/components/Telemetry";

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
      <Comment>{`/** A little more about us and what we do. */`}</Comment>
    </Fragment>,
    <Fragment key={2}>
      <Keyword>export const</Keyword> TODO_HQ <Punct>=</Punct>{" "}
      <Bracket>{"{"}</Bracket>
    </Fragment>,
    <Fragment key={3}>
      {"  "}
      <Property>manifesto</Property>
      <Punct>:</Punct>{" "}
      <Str>{`"We don't just write code; we build the factory."`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={4}>
      {"  "}
      <Property>coreInfrastructure</Property>
      <Punct>:</Punct> <Bracket>[</Bracket>
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
      <Bracket>{"]"}</Bracket>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={9}>
      {"  "}
      <Property>methodology</Property>
      <Punct>:</Punct>{" "}
      <Fn onActivate={onExecutePipeline}>executePipeline()</Fn>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={10}>
      {"  "}
      <Property>inProduction</Property>
      <Punct>:</Punct> <Bracket>[</Bracket>
    </Fragment>,
    <Fragment key={11}>
      {"    "}
      <Str>{`"Repdaily"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={12}>
      {"    "}
      <Str>{`"ReadyGo"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={13}>
      {"    "}
      <Str>{`"Contentic"`}</Str>
    </Fragment>,
    <Fragment key={14}>
      {"  "}
      <Bracket>{"]"}</Bracket>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={15}>
      {"  "}
      <Property>velocity</Property>
      <Punct>:</Punct> <Str>{`"Production-ready. Fast."`}</Str>
    </Fragment>,
    <Fragment key={16}>
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

export default function AboutPage() {
  const [rebootSignal, setRebootSignal] = useState(0);

  const rebootPipeline = useCallback(() => {
    setRebootSignal((current) => current + 1);
  }, []);

  const lines = codeLines(rebootPipeline);

  return (
    <main className="bg-bg-canvas relative h-screen min-h-screen w-full overflow-hidden text-syn-property">
      <div className="font-jetbrains relative z-10 flex h-full min-h-screen w-full flex-col pt-20">
        <h1 className="sr-only">A little more about us and what we do.</h1>
        <p className="sr-only">
          The team behind //TODO runs an internal software factory: source in
          TODO_HQ.ts, executePipeline() as methodology, a multi-agent team, then
          Repdaily, ReadyGo, and Contentic in production.
        </p>
        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(14rem,42%)] overflow-hidden lg:grid-cols-[70%_30%] lg:grid-rows-1">
          <section
            className="flex min-h-0 min-w-0 flex-col overflow-auto"
            aria-label="TODO_HQ TypeScript source"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border-ide px-6 py-2">
              <span className="text-syn-keyword text-xs">TODO_HQ.ts</span>
              <span className="text-syn-comment text-xs">TypeScript</span>
            </div>
            <div className="flex min-h-0 flex-1 text-xs leading-5 lg:text-sm lg:leading-6">
              <div
                aria-hidden="true"
                className="text-syn-number flex w-8 shrink-0 flex-col border-r border-border-ide py-4 text-right select-none lg:w-10"
              >
                {lines.map((_, index) => (
                  <span
                    key={index}
                    className="pr-2 leading-5 lg:pr-3 lg:leading-6"
                  >
                    {index + 1}
                  </span>
                ))}
              </div>
              <pre className="min-w-0 flex-1 py-4">
                <code className="font-jetbrains">
                  {lines.map((line, index) => (
                    <div key={index} className="pr-6 pl-4 whitespace-pre-wrap">
                      {line}
                    </div>
                  ))}
                </code>
              </pre>
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
