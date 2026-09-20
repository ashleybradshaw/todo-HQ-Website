"use client";

import {
  Fragment,
  useCallback,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useFactoryStream } from "@/hooks/useFactoryStream";
import { useIdeBoot, type IdeBootPhase } from "@/hooks/useIdeBoot";
import { PipelineRunner } from "@/components/PipelineRunner";
import { Telemetry } from "@/components/Telemetry";
import { IdeTabBar, type IdeTabId } from "@/components/ide/IdeTabBar";
import { OfferPane } from "@/components/ide/OfferPane";
import { ContactPane } from "@/components/ide/ContactPane";
import { IdeProjectCards } from "@/components/ide/IdeProjectCards";

/** 0-based index of the methodology / executePipeline() line in codeLines. */
const EXECUTE_PIPELINE_LINE = 18;

const ACTIVE_LINE_BG =
  "bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)]";

const STATUS_BY_TAB: Record<IdeTabId, string> = {
  todo: "UTF-8 · LF · TypeScript · TEST COPY",
  offer: "UTF-8 · LF · Markdown · TEST COPY",
  contact: "UTF-8 · LF · TypeScript · TEST COPY",
};

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

function TodoPane({
  lines,
}: {
  lines: ReactNode[];
}) {
  return (
    <div className="flex min-h-0 flex-1 overflow-auto text-xs leading-5 lg:text-sm lg:leading-6">
      <div
        aria-hidden="true"
        className="text-syn-number flex w-8 shrink-0 flex-col border-r border-border-ide py-4 text-right select-none lg:w-10"
      >
        {lines.map((_, index) => (
          <span
            key={index}
            className={`ide-boot-line pr-2 leading-5 lg:pr-3 lg:leading-6 ${
              index === EXECUTE_PIPELINE_LINE ? ACTIVE_LINE_BG : ""
            }`}
            style={{ "--i": index } as CSSProperties}
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
              className={`ide-boot-line whitespace-pre pr-6 pl-4 ${
                index === EXECUTE_PIPELINE_LINE ? ACTIVE_LINE_BG : ""
              }`}
              style={{ "--i": index } as CSSProperties}
            >
              {line}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

function IdeBootFrame({ phase }: { phase: IdeBootPhase }) {
  if (phase === "done") return null;

  return (
    <svg
      className="ide-boot-frame pointer-events-none absolute inset-0 z-20 h-full w-full"
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <rect
        className="ide-boot-frame-rect"
        x="0.35"
        y="0.35"
        width="99.3"
        height="99.3"
        pathLength={100}
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="0.35"
      />
    </svg>
  );
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
      <IdeProjectCards />
    </>
  );
}

export function FactoryDashboard() {
  const [rebootSignal, setRebootSignal] = useState(0);
  const [activeTab, setActiveTab] = useState<IdeTabId>("todo");
  const bootPhase = useIdeBoot();

  const rebootPipeline = useCallback(() => {
    setRebootSignal((current) => current + 1);
  }, []);

  const lines = codeLines(rebootPipeline);

  return (
    <main className="bg-bg-canvas text-syn-property relative min-h-screen w-full transition-[background-color,color] duration-[400ms] ease-in-out lg:h-[100dvh] lg:overflow-hidden">
      <div className="font-jetbrains relative z-10 flex min-h-screen w-full flex-col pt-20 lg:h-full lg:min-h-0">
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

        <div
          className="ide-boot-stage relative grid flex-1 grid-cols-1 auto-rows-auto lg:min-h-0 lg:grid-cols-[70%_30%] lg:grid-rows-1 lg:overflow-hidden"
          data-ide-boot={bootPhase}
        >
          <IdeBootFrame phase={bootPhase} />

          <section
            className="ide-boot-editor relative flex min-w-0 flex-col border-b border-border-ide lg:min-h-0 lg:overflow-hidden lg:border-b-0"
            aria-label="IDE editor"
          >
            <IdeTabBar activeTab={activeTab} onChange={setActiveTab} />

            <div
              id="ide-panel-todo"
              role="tabpanel"
              aria-labelledby="ide-tab-todo"
              hidden={activeTab !== "todo"}
              className={
                activeTab === "todo"
                  ? "flex min-h-0 flex-1 flex-col lg:overflow-hidden"
                  : undefined
              }
            >
              {activeTab === "todo" ? <TodoPane lines={lines} /> : null}
            </div>

            <div
              id="ide-panel-offer"
              role="tabpanel"
              aria-labelledby="ide-tab-offer"
              hidden={activeTab !== "offer"}
              className={
                activeTab === "offer"
                  ? "min-h-0 flex-1 overflow-auto"
                  : undefined
              }
            >
              {activeTab === "offer" ? <OfferPane /> : null}
            </div>

            <div
              id="ide-panel-contact"
              role="tabpanel"
              aria-labelledby="ide-tab-contact"
              hidden={activeTab !== "contact"}
              className={
                activeTab === "contact"
                  ? "min-h-0 flex-1 overflow-auto"
                  : undefined
              }
            >
              {activeTab === "contact" ? <ContactPane /> : null}
            </div>

            <div className="border-border-ide text-syn-comment shrink-0 border-t px-4 py-1 text-[10px] tracking-wide lg:text-xs">
              {STATUS_BY_TAB[activeTab]}
            </div>
          </section>

          <aside
            className="ide-boot-sidecar flex flex-col border-border-ide lg:min-h-0 lg:overflow-auto lg:border-l"
            aria-label="Factory sidecar"
          >
            <FactorySidecar rebootSignal={rebootSignal} />
          </aside>
        </div>
      </div>
    </main>
  );
}
