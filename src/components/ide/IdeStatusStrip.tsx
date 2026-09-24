import type { IdeTabId } from "@/components/ide/IdeTabBar";

/** Middle segment only — encoding / EOL live as fixed columns beside this. */
const STATUS_BY_TAB: Record<IdeTabId, string> = {
  todo: "TypeScript · Soft sell · TEST COPY",
  offer: "Markdown · Soft sell · TEST COPY",
  discovery: "TypeScript · Soft sell · TEST COPY",
};

type IdeStatusStripProps = {
  activeTab: IdeTabId;
};

/**
 * Dense eza-feel status chrome under the main IDE panes.
 * Git marks / size / relative time are fixed theatre strings.
 */
export function IdeStatusStrip({ activeTab }: IdeStatusStripProps) {
  return (
    <div
      className="ide-boot-status font-jetbrains flex shrink-0 items-center gap-x-2 overflow-x-auto border-t border-border-ide border-t-foreground/15 px-4 py-1 text-[10px] tracking-wide tabular-nums lg:gap-x-3 lg:text-xs"
      role="status"
      aria-label={`Editor status: ${STATUS_BY_TAB[activeTab]}`}
    >
      <span className="text-syn-property/80 shrink-0">Ln 25, Col 1</span>
      <span aria-hidden="true" className="text-syn-comment shrink-0 opacity-40">
        ·
      </span>
      <span className="text-syn-property/80 shrink-0">UTF-8</span>
      <span aria-hidden="true" className="text-syn-comment shrink-0 opacity-40">
        ·
      </span>
      <span className="text-syn-property/80 shrink-0">LF</span>
      <span aria-hidden="true" className="text-syn-comment shrink-0 opacity-40">
        ·
      </span>
      <span className="text-syn-property/80 shrink-0">
        {STATUS_BY_TAB[activeTab]}
      </span>
      <span aria-hidden="true" className="text-syn-comment shrink-0 opacity-40">
        ·
      </span>
      <span
        aria-hidden="true"
        className="flex shrink-0 items-center gap-1"
      >
        <span className="text-syn-string">M</span>
        <span className="text-syn-keyword">N</span>
        <span className="text-syn-comment">-</span>
      </span>
      <span aria-hidden="true" className="text-syn-comment shrink-0 opacity-40">
        ·
      </span>
      <span aria-hidden="true" className="text-syn-property/55 shrink-0">
        2.4K
      </span>
      <span aria-hidden="true" className="text-syn-comment shrink-0 opacity-40">
        ·
      </span>
      <span aria-hidden="true" className="text-syn-property/55 shrink-0">
        just now
      </span>
    </div>
  );
}
