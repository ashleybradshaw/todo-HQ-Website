"use client";

import {
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useIdeBoot } from "@/hooks/useIdeBoot";
import { PipelineRunner } from "@/components/PipelineRunner";
import { IdeTabBar, type IdeTabId } from "@/components/ide/IdeTabBar";
import { IdeStatusStrip } from "@/components/ide/IdeStatusStrip";
import { IdeBoneOverlay } from "@/components/ide/IdeBoneOverlay";
import { IdePathBar } from "@/components/ide/IdePathBar";
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
  const ideRef = useRef<HTMLDivElement>(null);
  const bootPhase = useIdeBoot(ideRef);

  const rebootPipeline = useCallback(() => {
    setRebootSignal((current) => current + 1);
  }, []);

  return (
    <main className="bg-bg-canvas text-syn-property relative min-h-screen w-full">
      <HomePageGrid />

      <div className="relative z-10 flex w-full flex-col pt-[var(--site-header-offset)]">
        <HomeHero />
        <HomeFeatureStrip />

        <div className={`${HOME_FRAME} relative z-10 pb-10 md:pb-14`}>
          <div
            ref={ideRef}
            className="ide-window ide-boot-stage border-border-ide-strong relative flex w-full flex-col rounded-[4px] border"
            data-ide-boot={bootPhase}
            aria-label={homePage.chrome.aria}
          >
            <IdeBoneOverlay phase={bootPhase} />

            <IdeTabBar activeTab={activeTab} onChange={setActiveTab} />
            <IdePathBar activeTab={activeTab} />

            <div className="relative flex flex-col md:flex-row">
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
                className="ide-boot-sidecar min-w-0 md:w-[30%] md:flex-none"
                aria-label={landmarks.sidecarAria}
              >
                <PipelineRunner
                  rebootSignal={rebootSignal}
                  onActiveIndexChange={setPipelineIndex}
                />
                <IdeProjectCards />
              </aside>
            </div>

            <IdeStatusStrip
              line={editorLine}
              pipelineIndex={pipelineIndex}
              pipelineTotal={PIPELINE_TOTAL}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
