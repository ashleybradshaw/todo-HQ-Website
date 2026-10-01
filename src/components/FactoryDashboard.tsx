"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useIdeBoot } from "@/hooks/useIdeBoot";
import { PipelineRunner } from "@/components/PipelineRunner";
import { Telemetry } from "@/components/Telemetry";
import { IdeTabBar, type IdeTabId } from "@/components/ide/IdeTabBar";
import { IdeStatusStrip } from "@/components/ide/IdeStatusStrip";
import { IdeBoneOverlay } from "@/components/ide/IdeBoneOverlay";
import { IdePathBar } from "@/components/ide/IdePathBar";
import { IdeReveal } from "@/components/ide/IdeReveal";
import {
  ReadmeCodePane,
  buildReadmeOutline,
  type ReadmeLiveState,
} from "@/components/ide/ReadmeCodePane";
import { OfferPane } from "@/components/ide/OfferPane";
import { DiscoveryPane } from "@/components/ide/DiscoveryPane";
import { XFeedPane } from "@/components/ide/XFeedPane";
import { IdeProjectCards } from "@/components/ide/IdeProjectCards";
import { IdeOutline } from "@/components/ide/IdeOutline";
import { HomeHero } from "@/components/ide/HomeHero";
import { HomeFeatureStrip } from "@/components/ide/HomeFeatureStrip";
import { HomePageGrid } from "@/components/ide/HomePageGrid";
import { HOME_FRAME } from "@/components/ide/homeFrame";
import { homePage } from "@/content/pages/home";
import { SHOW_X_FEED } from "@/lib/site";
import {
  buildReadmeSourceLines,
  methodologySourceLineIndex,
} from "@/components/ide/readmeSource";

const { landmarks } = homePage;
const PIPELINE_TOTAL = homePage.pipelineRunner.stages.length;
const DEFAULT_LINE = methodologySourceLineIndex(buildReadmeSourceLines()) + 1;

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

export function FactoryDashboard() {
  const [rebootSignal, setRebootSignal] = useState(0);
  const [activeTab, setActiveTab] = useState<IdeTabId>("todo");
  const [editorLine, setEditorLine] = useState(DEFAULT_LINE);
  const [pipelineIndex, setPipelineIndex] = useState(0);
  const [ideInView, setIdeInView] = useState(true);
  const [sectionHeading, setSectionHeading] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [sectionPlayKey, setSectionPlayKey] = useState(0);
  const ideRef = useRef<HTMLDivElement>(null);

  const headingLineIndexes = useMemo(() => {
    const lines = buildReadmeSourceLines();
    const indexes: number[] = [];
    lines.forEach((line, i) => {
      if (/^## /.test(line)) indexes.push(i);
    });
    return indexes;
  }, []);

  const boot = useIdeBoot(ideRef, headingLineIndexes);

  const outlineEntries = useMemo(
    () => buildReadmeOutline(buildReadmeSourceLines()),
    [],
  );

  const rebootPipeline = useCallback(() => {
    setRebootSignal((current) => current + 1);
  }, []);

  const onLiveChange = useCallback((state: ReadmeLiveState) => {
    setEditorLine(state.activeLine);
    setSectionHeading(state.sectionHeading);
    setSectionId(state.sectionId);
    setSectionPlayKey(state.sectionPlayKey);
  }, []);

  // Current-line band / live IO only while the IDE window is in view.
  useEffect(() => {
    const el = ideRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        setIdeInView(entries.some((e) => e.isIntersecting));
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const scrambleOk = ideInView;

  return (
    <main id="main" className="bg-bg-canvas text-syn-property relative min-h-screen w-full">
      <HomePageGrid />

      <div className="relative z-10 flex w-full flex-col pt-[var(--site-header-offset)]">
        <HomeHero />
        <HomeFeatureStrip />

        <div className={`${HOME_FRAME} relative z-10 pb-10 md:pb-14`}>
          <IdeReveal
            bootPhase={boot.phase}
            revealNonce={boot.revealNonce}
            windowRef={ideRef}
            className="ide-window ide-boot-stage relative flex w-full flex-col overflow-hidden"
            aria-label={homePage.chrome.aria}
          >
            <div className="relative flex min-h-0 w-full flex-1 flex-col">
              <IdeBoneOverlay phase={boot.phase} windowRef={ideRef} />

              <div data-bone="tabs">
                <IdeTabBar activeTab={activeTab} onChange={setActiveTab} />
              </div>
              <div data-bone="path">
                <IdePathBar
                  activeTab={activeTab}
                  sectionHeading={
                    activeTab === "todo" ? sectionHeading : null
                  }
                  sectionPlayKey={sectionPlayKey}
                />
              </div>

              <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
                <section
                  className="ide-boot-editor border-border-ide relative min-w-0 flex-1 border-b md:w-[70%] md:flex-none md:border-r md:border-b-0 lg:w-2/3"
                  aria-label={landmarks.editorAria}
                  data-ide-editor
                >
                  <IdePanel
                    tab="todo"
                    activeTab={activeTab}
                    className="flex flex-col"
                  >
                    <ReadmeCodePane
                      onExecutePipeline={rebootPipeline}
                      onActiveLineChange={setEditorLine}
                      headingPlayKeys={
                        scrambleOk ? boot.scramble.headingByLine : {}
                      }
                      onLiveChange={onLiveChange}
                      ideInView={ideInView && activeTab === "todo"}
                    />
                  </IdePanel>

                  <IdePanel
                    tab="offer"
                    activeTab={activeTab}
                    className="flex flex-col"
                  >
                    <OfferPane />
                  </IdePanel>

                  <IdePanel
                    tab="discovery"
                    activeTab={activeTab}
                    className="flex flex-col"
                  >
                    <DiscoveryPane />
                  </IdePanel>
                  {SHOW_X_FEED ? (
                    <IdePanel
                      tab="feed"
                      activeTab={activeTab}
                      className="flex flex-col"
                    >
                      <XFeedPane />
                    </IdePanel>
                  ) : null}
                </section>

                <aside
                  className="ide-boot-sidecar flex min-w-0 flex-col md:w-[30%] md:flex-none lg:w-1/3"
                  aria-label={landmarks.sidecarAria}
                  data-ide-sidecar
                >
                  <div
                    className="ide-boot-sidecar-block"
                    data-bone="sidecar"
                    style={{ "--s": 0 } as CSSProperties}
                  >
                    <PipelineRunner
                      rebootSignal={rebootSignal}
                      onActiveIndexChange={setPipelineIndex}
                      labelPlayKey={
                        scrambleOk ? boot.scramble.pipeline : 0
                      }
                    />
                  </div>
                  <div
                    className="ide-boot-sidecar-block"
                    data-bone="sidecar"
                    style={{ "--s": 1 } as CSSProperties}
                  >
                    <Telemetry
                      pipelineIndex={pipelineIndex}
                      pipelineTotal={PIPELINE_TOTAL}
                      revealPlayKey={
                        scrambleOk ? boot.scramble.telemetry : 0
                      }
                      ticksArmed={boot.ticksArmed}
                    />
                  </div>
                  <div
                    className="ide-boot-sidecar-block"
                    data-bone="sidecar"
                    style={{ "--s": 2 } as CSSProperties}
                  >
                    <IdeOutline
                      entries={outlineEntries}
                      activeId={
                        activeTab === "todo" ? sectionId : null
                      }
                      labelPlayKey={
                        scrambleOk ? boot.scramble.outline : 0
                      }
                    />
                  </div>
                  <div
                    className="min-h-0 flex-1"
                    aria-hidden="true"
                    data-ide-sidecar-spacer
                  />
                  <div
                    className="ide-boot-sidecar-block"
                    data-bone="sidecar"
                    style={{ "--s": 3 } as CSSProperties}
                  >
                    <IdeProjectCards
                      labelPlayKey={
                        scrambleOk ? boot.scramble.projects : 0
                      }
                    />
                  </div>
                </aside>
              </div>

              <div data-bone="status">
                <IdeStatusStrip
                  line={editorLine}
                  activeTab={activeTab}
                  pipelineIndex={pipelineIndex}
                  pipelineTotal={PIPELINE_TOTAL}
                />
              </div>
            </div>
          </IdeReveal>
        </div>
      </div>
    </main>
  );
}
