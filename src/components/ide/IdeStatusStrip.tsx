import type { IdeTabId } from "@/components/ide/IdeTabBar";
import { homePage } from "@/content/pages/home";

/** Middle segment only — encoding / EOL live as fixed columns beside this. */
const STATUS_BY_TAB: Record<IdeTabId, string> = {
  todo: homePage.statusStrip.byTab.todo,
  offer: homePage.statusStrip.byTab.offer,
  discovery: homePage.statusStrip.byTab.discovery,
};

const { statusStrip } = homePage;

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
      aria-label={`${statusStrip.ariaPrefix}${STATUS_BY_TAB[activeTab]}`}
    >
      <span className="text-syn-property shrink-0">{statusStrip.ln}</span>
      <span aria-hidden="true" className="text-syn-comment shrink-0 opacity-40">
        ·
      </span>
      <span className="text-syn-property shrink-0">{statusStrip.utf8}</span>
      <span aria-hidden="true" className="text-syn-comment shrink-0 opacity-40">
        ·
      </span>
      <span className="text-syn-property shrink-0">{statusStrip.lf}</span>
      <span aria-hidden="true" className="text-syn-comment shrink-0 opacity-40">
        ·
      </span>
      <span className="text-syn-property shrink-0">
        {STATUS_BY_TAB[activeTab]}
      </span>
      <span aria-hidden="true" className="text-syn-comment shrink-0 opacity-40">
        ·
      </span>
      <span
        aria-hidden="true"
        className="flex shrink-0 items-center gap-1"
      >
        <span className="text-syn-string">{statusStrip.m}</span>
        <span className="text-syn-keyword">{statusStrip.n}</span>
        <span className="text-syn-comment">-</span>
      </span>
      <span aria-hidden="true" className="text-syn-comment shrink-0 opacity-40">
        ·
      </span>
      <span aria-hidden="true" className="text-syn-property/55 shrink-0">
        {statusStrip.size}
      </span>
      <span aria-hidden="true" className="text-syn-comment shrink-0 opacity-40">
        ·
      </span>
      <span aria-hidden="true" className="text-syn-property/55 shrink-0">
        {statusStrip.justNow}
      </span>
    </div>
  );
}
