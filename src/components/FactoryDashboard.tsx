"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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
import { IdeProjectCards } from "@/components/ide/IdeProjectCards";
import { IdeOutline } from "@/components/ide/IdeOutline";
import { HomeHero } from "@/components/ide/HomeHero";
import { HomeFeatureStrip } from "@/components/ide/HomeFeatureStrip";
import { HomePageGrid } from "@/components/ide/HomePageGrid";
import { HOME_FRAME } from "@/components/ide/homeFrame";
import { homePage } from "@/content/pages/home";
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
  const [revealPlayKey, setRevealPlayKey] = useState(0);
  const [ideInView, setIdeInView] = useState(true);
  const [sectionHeading, setSectionHeading] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [sectionPlayKey, setSectionPlayKey] = useState(0);
  const ideRef = useRef<HTMLDivElement>(null);
  const bootPhase = useIdeBoot(ideRef);

  const outlineEntries = useMemo(
    () => buildReadmeOutline(buildReadmeSourceLines()),
    [],
  );

  const rebootPipeline = useCallback(() => {
    setRebootSignal((current) => current + 1);
  }, []);

  const onRevealStart = useCallback(() => {
    setRevealPlayKey((k) => k + 1);
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

  return (
    <main className="bg-bg-canvas text-syn-property relative min-h-screen w-full">
      <HomePageGrid />

      <div className="relative z-10 flex w-full flex-col pt-[var(--site-header-offset)]">
        <HomeHero />
        <HomeFeatureStrip />

        <div className={`${HOME_FRAME} relative z-10 pb-10 md:pb-14`}>
          <IdeReveal
            bootPhase={bootPhase}
            windowRef={ideRef}
            className="ide-window ide-boot-stage relative flex w-full flex-col overflow-hidden"
            aria-label={homePage.chrome.aria}
            onRevealStart={onRevealStart}
          >
            <div
              className="relative flex min-h-0 w-full flex-1 flex-col"
              data-ide-boot={bootPhase}
            >
              <IdeBoneOverlay phase={bootPhase} />

              <IdeTabBar activeTab={activeTab} onChange={setActiveTab} />
              <IdePathBar
                activeTab={activeTab}
                sectionHeading={
                  activeTab === "todo" ? sectionHeading : null
                }
                sectionPlayKey={sectionPlayKey}
              />

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
                      scramblePlayKey={revealPlayKey}
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
                </section>

                <aside
                  className="ide-boot-sidecar flex min-w-0 flex-col md:w-[30%] md:flex-none lg:w-1/3"
                  aria-label={landmarks.sidecarAria}
                  data-ide-sidecar
                >
                  <PipelineRunner
                    rebootSignal={rebootSignal}
                    onActiveIndexChange={setPipelineIndex}
                    labelPlayKey={revealPlayKey}
                  />
                  <Telemetry
                    pipelineIndex={pipelineIndex}
                    pipelineTotal={PIPELINE_TOTAL}
                    revealPlayKey={revealPlayKey}
                  />
                  <IdeOutline
                    entries={outlineEntries}
                    activeId={
                      activeTab === "todo" ? sectionId : null
                    }
                    labelPlayKey={revealPlayKey}
                  />
                  <IdeProjectCards labelPlayKey={revealPlayKey} />
                  <div
                    className="min-h-0 flex-1"
                    aria-hidden="true"
                    data-ide-sidecar-spacer
                  />
                </aside>
              </div>

              <IdeStatusStrip
                line={editorLine}
                activeTab={activeTab}
                pipelineIndex={pipelineIndex}
                pipelineTotal={PIPELINE_TOTAL}
              />
            </div>
          </IdeReveal>
        </div>
      </div>
    </main>
  );
}
