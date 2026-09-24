import type { IdeTabId } from "@/components/ide/IdeTabBar";

const FILE_BY_TAB: Record<IdeTabId, string> = {
  todo: "TODO_HQ.ts",
  offer: "offer.md",
  discovery: "discovery.ts",
};

type IdeFactoryCrumbProps = {
  activeTab: IdeTabId;
  /** Pipeline stage label on the todo tab; defaults to ship. */
  activeStage?: string;
};

/**
 * Factory breadcrumb under the tab bar — not a filesystem path.
 */
export function IdeFactoryCrumb({
  activeTab,
  activeStage = "ship",
}: IdeFactoryCrumbProps) {
  const file = FILE_BY_TAB[activeTab];

  return (
    <p
      className="ide-boot-crumb border-border-ide text-syn-comment font-jetbrains flex shrink-0 items-center gap-1.5 overflow-x-auto border-b px-3 py-1.5 text-[10px] tracking-wide lg:text-xs"
      aria-label="Factory location"
    >
      <span className="text-syn-property/80 shrink-0">factory</span>
      <Sep />
      <span className="text-syn-property/80 shrink-0">{file}</span>
      {activeTab === "todo" ? (
        <>
          <Sep />
          <span className="shrink-0">pipeline</span>
          <Sep />
          <span className="text-syn-property/80 shrink-0">{activeStage}</span>
        </>
      ) : null}
    </p>
  );
}

function Sep() {
  return (
    <span aria-hidden="true" className="shrink-0 opacity-40">
      /
    </span>
  );
}
