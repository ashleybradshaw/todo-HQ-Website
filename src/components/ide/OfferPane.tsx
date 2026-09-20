import type { CSSProperties } from "react";

function lineStyle(i: number): CSSProperties {
  return { "--i": i } as CSSProperties;
}

export function OfferPane() {
  return (
    <div className="font-jetbrains text-xs leading-5 lg:text-sm lg:leading-6">
      <pre className="min-w-0 flex-1 py-4">
        <code className="block space-y-0 whitespace-pre-wrap pr-6 pl-4">
          <div className="ide-boot-line text-syn-comment italic" style={lineStyle(0)}>
            {"# offer.md — TEST COPY"}
          </div>
          <div className="ide-boot-line" style={lineStyle(1)}>
            {" "}
          </div>
          <div className="ide-boot-line text-syn-keyword font-bold" style={lineStyle(2)}>
            {"## What we do"}
          </div>
          <div className="ide-boot-line text-syn-property" style={lineStyle(3)}>
            {"We run an internal software factory — multi-agent systems"}
          </div>
          <div className="ide-boot-line text-syn-property" style={lineStyle(4)}>
            {"and full-stack apps, not one-off freelance."}
          </div>
          <div className="ide-boot-line" style={lineStyle(5)}>
            {" "}
          </div>
          <div className="ide-boot-line text-syn-keyword font-bold" style={lineStyle(6)}>
            {"## Who we ship for"}
          </div>
          <div className="ide-boot-line text-syn-string" style={lineStyle(7)}>
            {"- CTOs who need the stack shipped this quarter"}
          </div>
          <div className="ide-boot-line text-syn-string" style={lineStyle(8)}>
            {"- Non-tech founders with an idea, not an eng org"}
          </div>
          <div className="ide-boot-line text-syn-string" style={lineStyle(9)}>
            {"- CMS / content contracts that need ops, not just pages"}
          </div>
          <div className="ide-boot-line" style={lineStyle(10)}>
            {" "}
          </div>
          <div className="ide-boot-line text-syn-keyword font-bold" style={lineStyle(11)}>
            {"## Pipelines"}
          </div>
          <div className="ide-boot-line text-syn-property" style={lineStyle(12)}>
            <span className="text-syn-bracket">{"`agiFlow`"}</span>
            {" — Brief → research agents → draft → human gate → ship."}
          </div>
          <div className="ide-boot-line text-syn-property" style={lineStyle(13)}>
            <span className="text-syn-bracket">{"`lpPipeline`"}</span>
            {" — Offer → layout → copy pass → QA → launch."}
          </div>
          <div className="ide-boot-line" style={lineStyle(14)}>
            {" "}
          </div>
          <div className="ide-boot-line text-syn-comment italic" style={lineStyle(15)}>
            {"// In production: Repdaily · ReadyGo · Contentic"}
          </div>
        </code>
      </pre>
    </div>
  );
}
