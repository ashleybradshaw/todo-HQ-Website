"use client";

import {
  useCallback,
  useLayoutEffect,
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
import { ReadmeCodePane } from "@/components/ide/ReadmeCodePane";
import { OfferPane } from "@/components/ide/OfferPane";
import { DiscoveryPane } from "@/components/ide/DiscoveryPane";
import { IdeProjectCards } from "@/components/ide/IdeProjectCards";
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
  const ideRef = useRef<HTMLDivElement>(null);
  const bootPhase = useIdeBoot(ideRef);

  const rebootPipeline = useCallback(() => {
    setRebootSignal((current) => current + 1);
  }, []);

  const onRevealStart = useCallback(() => {
    setRevealPlayKey((k) => k + 1);
  }, []);

  // Sync IDE band into page grid so verticals skip the window.
  useLayoutEffect(() => {
    const el = ideRef.current;
    if (!el) return;

    const sync = () => {
      const grid = el
        .closest("main")
        ?.querySelector<HTMLElement>("[data-home-grid]");
      if (!grid) return;
      const gridTop = grid.getBoundingClientRect().top;
      const rect = el.getBoundingClientRect();
      grid.style.setProperty(
        "--home-ide-top",
        `${Math.round(rect.top - gridTop)}px`,
      );
      grid.style.setProperty(
        "--home-ide-bottom",
        `${Math.round(rect.bottom - gridTop)}px`,
      );
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync);
    };
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
            className="ide-window ide-boot-stage border-border-ide-strong relative flex w-full flex-col overflow-hidden rounded-[4px] border"
            aria-label={homePage.chrome.aria}
            onRevealStart={onRevealStart}
          >
            <div
              className="relative flex min-h-0 w-full flex-1 flex-col"
              data-ide-boot={bootPhase}
            >
              <IdeBoneOverlay phase={bootPhase} />

              <IdeTabBar activeTab={activeTab} onChange={setActiveTab} />
              <IdePathBar activeTab={activeTab} />

              <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
                <section
                  className="ide-boot-editor border-border-ide relative min-w-0 flex-1 border-b md:w-[70%] md:flex-none md:border-r md:border-b-0"
                  aria-label={landmarks.editorAria}
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
                  className="ide-boot-sidecar flex min-w-0 flex-col md:w-[30%] md:flex-none"
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
                  <IdeProjectCards labelPlayKey={revealPlayKey} />
                  <div className="min-h-0 flex-1" aria-hidden="true" />
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
