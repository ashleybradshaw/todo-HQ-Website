import type { CSSProperties } from "react";
import type { IdeBootPhase } from "@/hooks/useIdeBoot";

const ROW_WIDTHS = [40, 55, 72, 48, 88, 63, 90, 52, 70, 45] as const;
const GUTTER_COUNT = 12;

const boneClass = "rounded-[4px] bg-foreground/20";

type IdeBoneOverlayProps = {
  phase: IdeBootPhase;
};

/**
 * Boneyard-feel skeleton over the IDE stage during boot.
 * Unmounts on `done`. CSS drives pulse / dissolve via data-ide-boot ancestors.
 */
export function IdeBoneOverlay({ phase }: IdeBoneOverlayProps) {
  if (phase === "done") return null;

  return (
    <div
      className="ide-bone-overlay pointer-events-none absolute inset-0 z-20 grid grid-cols-1 lg:grid-cols-[70%_30%]"
      aria-hidden="true"
    >
      {/* Editor column */}
      <div className="ide-bone-editor flex min-h-0 flex-col border-b border-transparent lg:border-b-0">
        {/* Tab capsules */}
        <div className="ide-bone-tabs flex shrink-0 items-center gap-2 border-b border-transparent px-3 py-2.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`ide-bone ide-bone-tab h-5 w-20 lg:w-24 ${boneClass}`}
              style={{ "--b": i } as CSSProperties}
            />
          ))}
        </div>

        {/* Crumb bone */}
        <div className="ide-bone-crumb-wrap shrink-0 border-b border-transparent px-3 py-2">
          <span
            className={`ide-bone ide-bone-crumb block h-2 w-2/5 ${boneClass}`}
            style={{ "--b": 0 } as CSSProperties}
          />
        </div>

        {/* Gutter + content rows */}
        <div className="ide-bone-body flex min-h-0 flex-1 overflow-hidden px-0 py-4">
          <div className="ide-bone-gutter flex w-8 shrink-0 flex-col items-end gap-[0.65rem] border-r border-transparent pr-2 lg:w-10 lg:pr-3">
            {Array.from({ length: GUTTER_COUNT }, (_, i) => (
              <span
                key={i}
                className={`ide-bone ide-bone-gutter-cell h-2.5 w-3 lg:w-4 ${boneClass}`}
                style={{ "--b": i } as CSSProperties}
              />
            ))}
          </div>
          <div className="ide-bone-rows flex min-w-0 flex-1 flex-col gap-[0.65rem] px-4">
            {ROW_WIDTHS.map((width, i) => (
              <span
                key={i}
                className={`ide-bone ide-bone-row h-2.5 ${boneClass}`}
                style={
                  {
                    "--b": i,
                    width: `${width}%`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>

        {/* Status bar bone */}
        <div className="ide-bone-status-wrap shrink-0 border-t border-transparent px-4 py-2">
          <span
            className={`ide-bone ide-bone-status block h-2.5 w-full ${boneClass}`}
            style={{ "--b": 0 } as CSSProperties}
          />
        </div>
      </div>

      {/* Sidecar column — light card bones */}
      <div className="ide-bone-sidecar-col hidden flex-col gap-4 border-l border-transparent p-4 lg:flex">
        {[0, 1].map((card) => (
          <div
            key={card}
            className="ide-bone-card flex flex-col gap-2"
            style={{ "--b": card } as CSSProperties}
          >
            <span
              className={`ide-bone ide-bone-card-head h-3 w-1/3 ${boneClass}`}
              style={{ "--b": card * 2 } as CSSProperties}
            />
            <span
              className={`ide-bone ide-bone-card-body h-16 w-full ${boneClass}`}
              style={{ "--b": card * 2 + 1 } as CSSProperties}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
