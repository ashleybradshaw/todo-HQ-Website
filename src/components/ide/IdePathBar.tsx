import { homePage } from "@/content/pages/home";
import type { IdeTabId } from "@/components/ide/IdeTabBar";

const { chrome, ideTabs } = homePage;

type IdePathBarProps = {
  activeTab: IdeTabId;
};

export function IdePathBar({ activeTab }: IdePathBarProps) {
  const file = ideTabs.tabs[activeTab];

  return (
    <nav
      aria-label={chrome.pathAria}
      className="ide-boot-chrome border-border-ide font-jetbrains text-muted flex shrink-0 items-center gap-1.5 border-b px-2 py-1.5 text-[11px] lg:text-xs"
    >
      <span>{chrome.pathRoot}</span>
      <span aria-hidden="true">{chrome.pathSeparator}</span>
      <span>{chrome.pathFolder}</span>
      <span aria-hidden="true">{chrome.pathSeparator}</span>
      <span className="text-syn-property truncate" aria-current="page">
        {file}
      </span>
    </nav>
  );
}
