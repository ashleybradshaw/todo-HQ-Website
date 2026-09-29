"use client";

import {
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import type { IdeBootPhase } from "@/hooks/useIdeBoot";

type BoneRect = {
  key: string;
  top: number;
  left: number;
  width: number;
  height: number;
  index: number;
};

type IdeBoneOverlayProps = {
  phase: IdeBootPhase;
  windowRef: RefObject<HTMLElement | null>;
};

const STATIC_ROWS = 30;
const STATIC_ROW_PITCH = 28;
const STATIC_SIDECAR = 5;
const TAB_H = 36;
const PATH_H = 28;
const STATUS_H = 28;

/**
 * Static first-paint bones (SSR / pre-measure), then swap to measured
 * `data-bone` rects relative to `.ide-window` before the boot trigger.
 * Renders nothing on `done` (repeat visits). Visibility is also CSS-gated
 * so a brief bones frame without `data-ide-first` never flashes.
 */
export function IdeBoneOverlay({ phase, windowRef }: IdeBoneOverlayProps) {
  const [measured, setMeasured] = useState<BoneRect[] | null>(null);

  useLayoutEffect(() => {
    if (phase === "done") return;

    const root = windowRef.current;
    if (!root) return;

    const measure = () => {
      const origin = root.getBoundingClientRect();
      const nodes = root.querySelectorAll<HTMLElement>("[data-bone]");
      const next: BoneRect[] = [];
      let index = 0;
      nodes.forEach((node, i) => {
        const rect = node.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return;
        const kind = node.getAttribute("data-bone");
        if (kind === "line") {
          const editor = root.querySelector("[data-ide-editor]");
          if (editor) {
            const er = editor.getBoundingClientRect();
            if (rect.bottom > er.bottom + 1 || rect.top < er.top - 1) return;
          }
        }
        // Line bones follow wrapped logical-line height; chrome bones stay slim.
        const height =
          kind === "line"
            ? Math.max(8, rect.height)
            : Math.max(6, Math.min(rect.height, 22));
        next.push({
          key: `${kind ?? "b"}-${i}`,
          top: rect.top - origin.top,
          left: rect.left - origin.left,
          width: rect.width,
          height,
          index: index++,
        });
      });
      if (next.length > 0) {
        setMeasured(next);
      }
    };

    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(root);
    return () => ro.disconnect();
  }, [phase, windowRef]);

  if (phase === "done") return null;

  return (
    <div
      className="ide-bone-overlay pointer-events-none absolute inset-0 z-20 overflow-hidden"
      aria-hidden="true"
    >
      {measured ? (
        measured.map((bone) => (
          <span
            key={bone.key}
            className="ide-bone absolute rounded-[4px] bg-foreground/20"
            style={
              {
                top: bone.top + (bone.height > 28 ? 4 : bone.height > 14 ? 4 : 0),
                left: bone.left + 8,
                width: Math.max(24, bone.width - 16),
                height:
                  bone.height > 28
                    ? bone.height - 8
                    : bone.height > 14
                      ? bone.height - 8
                      : bone.height,
                "--b": bone.index,
              } as CSSProperties
            }
          />
        ))
      ) : (
        <StaticFallbackBones />
      )}
    </div>
  );
}

/** Rough layout match: tabs, path, 30×28px rows, 5 sidecar blocks, status. */
function StaticFallbackBones() {
  let b = 0;
  return (
    <div className="relative flex h-full w-full flex-col">
      <div
        className="flex shrink-0 items-center gap-2 px-2"
        style={{ height: TAB_H }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="ide-bone h-5 w-20 rounded-[4px] bg-foreground/20 lg:w-24"
            style={{ "--b": b++ } as CSSProperties}
          />
        ))}
      </div>
      <div
        className="flex shrink-0 items-center px-3"
        style={{ height: PATH_H }}
      >
        <span
          className="ide-bone h-2.5 w-48 rounded-[4px] bg-foreground/20"
          style={{ "--b": b++ } as CSSProperties}
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="relative min-h-0 flex-1 overflow-hidden md:w-[70%] lg:w-2/3">
          {Array.from({ length: STATIC_ROWS }, (_, i) => (
            <span
              key={i}
              className="ide-bone absolute left-10 h-2.5 rounded-[4px] bg-foreground/20 lg:left-12"
              style={
                {
                  top: 12 + i * STATIC_ROW_PITCH,
                  width: `${40 + ((i * 17) % 50)}%`,
                  maxWidth: "calc(100% - 3rem)",
                  "--b": b++,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <div className="hidden flex-col gap-3 p-4 md:flex md:w-[30%] lg:w-1/3">
          {Array.from({ length: STATIC_SIDECAR }, (_, i) => (
            <span
              key={i}
              className="ide-bone h-10 w-full rounded-[4px] bg-foreground/20"
              style={{ "--b": b++ } as CSSProperties}
            />
          ))}
        </div>
      </div>
      <div
        className="mt-auto flex shrink-0 items-center px-3"
        style={{ height: STATUS_H }}
      >
        <span
          className="ide-bone h-2.5 w-full rounded-[4px] bg-foreground/20"
          style={{ "--b": b++ } as CSSProperties}
        />
      </div>
    </div>
  );
}
