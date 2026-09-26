"use client";

import {
  Fragment,
  useCallback,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useFactoryStream } from "@/hooks/useFactoryStream";
import { useIdeBoot } from "@/hooks/useIdeBoot";
import { PipelineRunner } from "@/components/PipelineRunner";
import { Telemetry } from "@/components/Telemetry";
import { IdeTabBar, type IdeTabId } from "@/components/ide/IdeTabBar";
import { IdeStatusStrip } from "@/components/ide/IdeStatusStrip";
import { IdeBoneOverlay } from "@/components/ide/IdeBoneOverlay";
import { OfferPane } from "@/components/ide/OfferPane";
import { DiscoveryPane } from "@/components/ide/DiscoveryPane";
import { IdeProjectCards } from "@/components/ide/IdeProjectCards";

/** 0-based index of the methodology / executePipeline() line in codeLines. */
const EXECUTE_PIPELINE_LINE = 24;

const ACTIVE_LINE_BG =
  "border-l-2 border-[var(--foreground)] bg-transparent";

function Comment({ children }: { children: ReactNode }) {
  return <span className="text-syn-comment italic">{children}</span>;
}

function Keyword({ children }: { children: ReactNode }) {
  return <span className="text-syn-keyword font-medium">{children}</span>;
}

function Property({ children }: { children: ReactNode }) {
  return <span className="text-syn-property">{children}</span>;
}

function Str({ children }: { children: ReactNode }) {
  return <span className="text-syn-string font-medium">{children}</span>;
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
      aria-label="executePipeline() — restart factory pipeline"
      className="text-syn-string bg-transparent p-0 font-jetbrains font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]"
    >
      {children}
    </button>
  );
}

function codeLines(onExecutePipeline: () => void): ReactNode[] {
  return [
    <Fragment key={0}>
      <Comment>{`/** //TODO Design & Engineering — factory overview. Soft sell. TEST COPY. */`}</Comment>
    </Fragment>,
    <Fragment key={1}>
      <Keyword>export const</Keyword>{" "}
      <span className="text-syn-property">TODO_HQ</span> <Punct>=</Punct>{" "}
      <Bracket>{"{"}</Bracket>
    </Fragment>,
    <Fragment key={2}>
      {"  "}
      <Property>whoWeAre</Property>
      <Punct>:</Punct>
    </Fragment>,
    <Fragment key={3}>
      {"    "}
      <Str>{`"We're //TODO — design and engineering that builds the factory, not just the tickets."`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={4}>
      {"  "}
      <Property>whatWeDoBest</Property>
      <Punct>:</Punct>
    </Fragment>,
    <Fragment key={5}>
      {"    "}
      <Str>{`"End-to-end AI and LM workflows that hold a full digital ecosystem together."`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={6}>
      {"  "}
      <Property>whoWeShipFor</Property>
      <Punct>:</Punct> <Bracket>[</Bracket>
    </Fragment>,
    <Fragment key={7}>
      {"    "}
      <Str>{`"Enterprise teams shipping major system solutions — globally"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={8}>
      {"    "}
      <Str>{`"Non-tech founders and investor groups taking MVPs to scale"`}</Str>
    </Fragment>,
    <Fragment key={9}>
      {"  "}
      <Bracket>{"]"}</Bracket>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={10}>
      {"  "}
      <Property>howWeWork</Property>
      <Punct>:</Punct> <Bracket>[</Bracket>
    </Fragment>,
    <Fragment key={11}>
      {"    "}
      <Str>{`"With you, inside your stack"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={12}>
      {"    "}
      <Str>{`"Or for you, as a tight delivery cell"`}</Str>
    </Fragment>,
    <Fragment key={13}>
      {"  "}
      <Bracket>{"]"}</Bracket>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={14}>
      {"  "}
      <Property>pipeline</Property>
      <Punct>:</Punct> <Bracket>[</Bracket>
    </Fragment>,
    <Fragment key={15}>
      {"    "}
      <Str>{`"intake"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={16}>
      {"    "}
      <Str>{`"review"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={17}>
      {"    "}
      <Str>{`"agiFlow"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={18}>
      {"    "}
      <Str>{`"lpPipeline"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={19}>
      {"    "}
      <Str>{`"analysis"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={20}>
      {"    "}
      <Str>{`"ship"`}</Str>
    </Fragment>,
    <Fragment key={21}>
      {"  "}
      <Bracket>{"]"}</Bracket>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={22}>
      {"  "}
      <Property>agiFlow</Property>
      <Punct>:</Punct>{" "}
      <Str>{`"Brief → research agents → draft → human gate → ship."`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={23}>
      {"  "}
      <Property>lpPipeline</Property>
      <Punct>:</Punct>{" "}
      <Str>{`"Offer → layout → copy pass → QA → launch."`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={24}>
      {"  "}
      <Property>methodology</Property>
      <Punct>:</Punct>{" "}
      <Fn onActivate={onExecutePipeline}>executePipeline()</Fn>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={25}>
      {"  "}
      <Property>inProduction</Property>
      <Punct>:</Punct> <Bracket>[</Bracket>
    </Fragment>,
    <Fragment key={26}>
      {"    "}
      <Str>{`"RepDaily"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={27}>
      {"    "}
      <Str>{`"ReadyGo"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={28}>
      {"    "}
      <Str>{`"ErgTrainer"`}</Str>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={29}>
      {"    "}
      <Str>{`"The Tower"`}</Str>
    </Fragment>,
    <Fragment key={30}>
      {"  "}
      <Bracket>{"]"}</Bracket>
      <Punct>,</Punct>
    </Fragment>,
    <Fragment key={31}>
      {"  "}
      <Property>promise</Property>
      <Punct>:</Punct>{" "}
      <Str>{`"Future-proof your AI implementation — without the theatre."`}</Str>
    </Fragment>,
    <Fragment key={32}>
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
    <div className="flex min-h-0 flex-1 overflow-auto text-xs leading-6 lg:text-sm lg:leading-7">
      <div
        aria-hidden="true"
        className="ide-boot-gutter text-syn-number flex w-8 shrink-0 flex-col border-r border-border-ide py-4 text-right tabular-nums select-none lg:w-10"
      >
        {lines.map((_, index) => (
          <span
            key={index}
            className={`ide-boot-line pr-2 leading-6 lg:pr-3 lg:leading-7 ${
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
              className={`ide-boot-line whitespace-pre-wrap pr-6 pl-4 ${
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

function IdePanel({
  tab,
  activeTab,
  className,
  children,
}: {
  tab: IdeTabId;
  activeTab: IdeTabId;
  className: string;
  children: ReactNode;
}) {
  const active = activeTab === tab;
  return (
    <div
      id={`ide-panel-${tab}`}
      role="tabpanel"
      aria-labelledby={`ide-tab-${tab}`}
      hidden={!active}
      className={active ? className : undefined}
    >
      {children}
    </div>
  );
}

function FactorySidecar({ rebootSignal }: { rebootSignal: number }) {
  const feed = useFactoryStream();

  return (
    <>
      <PipelineRunner rebootSignal={rebootSignal} />
      <Telemetry agents={feed.agents} />
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
    <main className="bg-bg-canvas text-syn-property relative min-h-screen w-full transition-[background-color,color] duration-[400ms] ease-in-out">
      <div className="font-jetbrains relative z-10 flex min-h-[calc(100dvh-5rem)] w-full flex-col pt-20">
        <h1 className="sr-only">
          {"//TODO Design & Engineering factory dashboard"}
        </h1>
        <p className="sr-only">
          {"//TODO Design & Engineering builds the factory, not just the tickets — "}
          end-to-end AI and LM workflows for enterprise teams and non-tech
          founders. Pipeline: intake, review, agiFlow, lpPipeline, analysis,
          ship. Methodology is executePipeline() — with RepDaily, ReadyGo,
          ErgTrainer, and The Tower in production.
        </p>

        <div
          className="ide-boot-stage relative grid min-h-[calc(100dvh-5rem)] flex-1 grid-cols-1 auto-rows-auto lg:grid-cols-[70%_30%] lg:grid-rows-1"
          data-ide-boot={bootPhase}
        >
          <IdeBoneOverlay phase={bootPhase} />

          <section
            className="ide-boot-editor relative flex min-w-0 flex-col border-b border-border-ide lg:min-h-0 lg:overflow-hidden lg:border-b-0"
            aria-label="IDE editor"
          >
            <IdeTabBar activeTab={activeTab} onChange={setActiveTab} />

            <IdePanel
              tab="todo"
              activeTab={activeTab}
              className="flex min-h-0 flex-1 flex-col lg:overflow-hidden"
            >
              <TodoPane lines={lines} />
            </IdePanel>

            <IdePanel
              tab="offer"
              activeTab={activeTab}
              className="min-h-0 flex-1 overflow-auto"
            >
              <OfferPane />
            </IdePanel>

            <IdePanel
              tab="discovery"
              activeTab={activeTab}
              className="min-h-0 flex-1 overflow-auto"
            >
              <DiscoveryPane />
            </IdePanel>

            <IdeStatusStrip activeTab={activeTab} />
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
