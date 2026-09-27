import { BrowserFrame } from "@/components/work/BrowserFrame";
import { UiTile } from "@/components/ui-docs/UiTile";
import { uiPage } from "@/content/pages/ui";

const FRAMES = [
  uiPage.previews.home,
  uiPage.previews.about,
  uiPage.previews.project,
] as const;

export function InTheWildTile() {
  const { inTheWild } = uiPage.tiles;

  return (
    <UiTile
      title={inTheWild.title}
      description={inTheWild.description}
      span="full"
      className="ui-tile-full"
    >
      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3">
        {FRAMES.map((frame) => (
          <BrowserFrame
            key={frame.src}
            src={frame.src}
            alt={frame.alt}
            caption={frame.caption}
            aspect="landscape"
          />
        ))}
      </div>
    </UiTile>
  );
}
