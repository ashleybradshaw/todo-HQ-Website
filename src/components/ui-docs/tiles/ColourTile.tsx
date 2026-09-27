"use client";

import { useCallback, useState } from "react";
import { useSpray } from "@/components/SprayProvider";
import { UiTile } from "@/components/ui-docs/UiTile";
import {
  contrastVsCanvasAndText,
  detectBrandDrift,
  formatContrast,
  readCssVarHex,
} from "@/lib/ui-docs/readCssVar";
import { TOKEN_REGISTRY, type TokenEntry } from "@/lib/ui-docs/tokenRegistry";
import { isInnerBrandPair } from "@/lib/accessibleColorPair";
import { cn } from "@/lib/cn";
import { uiPage } from "@/content/pages/ui";

type SwatchState = {
  hex: string | null;
  vsCanvas: number | null;
  vsText: number | null;
};

function readLiveTokenMap(): Record<string, SwatchState> {
  if (typeof document === "undefined") return {};
  const next: Record<string, SwatchState> = {};
  for (const entry of TOKEN_REGISTRY) {
    const hex = readCssVarHex(entry.token);
    const contrast = contrastVsCanvasAndText(hex);
    next[`${entry.group}:${entry.name}`] = {
      hex,
      vsCanvas: contrast.vsCanvas,
      vsText: contrast.vsText,
    };
  }
  return next;
}

function SwatchPill({
  entry,
  state,
  onCopy,
}: {
  entry: TokenEntry;
  state: SwatchState | undefined;
  onCopy: (hex: string) => void;
}) {
  const hex = state?.hex;
  return (
    <button
      type="button"
      onClick={() => hex && onCopy(hex)}
      disabled={!hex}
      className={cn(
        "flex min-w-0 items-stretch overflow-hidden rounded-[4px] border border-border-ide text-left transition-opacity duration-[400ms] ease-in-out hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none",
        !hex && "cursor-default opacity-60",
      )}
      aria-label={hex ? `Copy ${entry.name} ${hex}` : `${entry.name} — unresolved`}
    >
      <span
        className="w-3 shrink-0 self-stretch sm:w-4"
        style={{ backgroundColor: hex ? `var(${entry.token})` : "transparent" }}
        aria-hidden="true"
      />
      <span className="font-jetbrains flex min-w-0 flex-1 flex-col gap-0.5 px-2.5 py-2 text-[10px] leading-4 tracking-wide">
        <span className="text-foreground break-words font-bold">{entry.name}</span>
        <span className="text-foreground tabular-nums">{hex ?? "—"}</span>
        <span className="text-muted tabular-nums">
          canvas {formatContrast(state?.vsCanvas ?? null)} · text{" "}
          {formatContrast(state?.vsText ?? null)}
        </span>
      </span>
    </button>
  );
}

export function ColourTile() {
  const { colour } = uiPage.tiles;
  const { pair } = useSpray();
  // Spray updates remount CSS vars; this re-renders and re-reads.
  const map = readLiveTokenMap();
  const drift = detectBrandDrift(pair);
  const [copied, setCopied] = useState<string | null>(null);

  const onCopy = useCallback((hex: string) => {
    void navigator.clipboard.writeText(hex).then(() => {
      setCopied(hex);
      window.setTimeout(() => setCopied(null), 1200);
    });
  }, []);

  return (
    <UiTile title={colour.title} description={colour.description}>
      <div className="flex max-h-[28rem] min-w-0 flex-col gap-2 overflow-y-auto pr-1">
        {isInnerBrandPair(pair) && drift.drifted ? (
          <p
            role="status"
            className="font-jetbrains border border-[color-mix(in_srgb,var(--status-pending)_50%,transparent)] bg-[color-mix(in_srgb,var(--status-pending)_12%,transparent)] px-2 py-1.5 text-[10px] text-foreground"
          >
            drift: {drift.details.join("; ")}
          </p>
        ) : null}
        {copied ? (
          <p role="status" className="font-jetbrains type-caption text-syn-string">
            Copied {copied}
          </p>
        ) : null}
        {TOKEN_REGISTRY.map((entry) => (
          <SwatchPill
            key={`${entry.group}:${entry.name}`}
            entry={entry}
            state={map[`${entry.group}:${entry.name}`]}
            onCopy={onCopy}
          />
        ))}
      </div>
    </UiTile>
  );
}
