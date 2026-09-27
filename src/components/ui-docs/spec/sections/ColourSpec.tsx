"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { useSpray } from "@/components/SprayProvider";
import { MetricChips } from "@/components/ui-docs/spec/MetricChips";
import { SpecGrid } from "@/components/ui-docs/spec/SpecGrid";
import { SpecSection } from "@/components/ui-docs/spec/SpecSection";
import {
  contrastVsCanvasAndText,
  formatContrast,
  readCssVarHex,
} from "@/lib/ui-docs/readCssVar";
import { TOKEN_REGISTRY, type TokenEntry } from "@/lib/ui-docs/tokenRegistry";
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

function countAa(map: Record<string, SwatchState>) {
  let pass = 0;
  for (const state of Object.values(map)) {
    const best = Math.max(state.vsCanvas ?? 0, state.vsText ?? 0);
    if (best >= 4.5) pass += 1;
  }
  return pass;
}

function SwatchBlock({
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
        "border-border-ide flex min-w-0 flex-col overflow-hidden rounded-[4px] border text-left transition-opacity duration-[400ms] ease-in-out hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none",
        !hex && "cursor-default opacity-60",
      )}
      aria-label={hex ? `Copy ${entry.name} ${hex}` : `${entry.name} — unresolved`}
    >
      <span
        className="border-border-ide block h-24 w-full border-b"
        style={{ backgroundColor: hex ? `var(${entry.token})` : "transparent" }}
        aria-hidden="true"
      />
      <span className="font-jetbrains flex min-w-0 flex-col gap-1 p-3 text-[10px] leading-4 tracking-wide">
        <span className="text-foreground break-words font-bold">{entry.name}</span>
        <span className="text-muted break-words">{entry.token}</span>
        <span className="text-foreground tabular-nums">{hex ?? "—"}</span>
        <MetricChips
          name="contrast"
          values={[
            `canvas ${formatContrast(state?.vsCanvas ?? null)}`,
            `text ${formatContrast(state?.vsText ?? null)}`,
          ]}
          className="mt-1"
        />
      </span>
    </button>
  );
}

export function ColourSpec() {
  const { colour } = uiPage.sections;
  const { pair } = useSpray();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const map = mounted ? readLiveTokenMap() : {};
  void pair;
  const [copied, setCopied] = useState<string | null>(null);

  const onCopy = useCallback((hex: string) => {
    void navigator.clipboard.writeText(hex).then(() => {
      setCopied(hex);
      window.setTimeout(() => setCopied(null), 1200);
    });
  }, []);

  const n = TOKEN_REGISTRY.length;
  const aa = mounted ? countAa(map) : null;
  const metric = mounted
    ? `${n} TOKENS · AA ${aa}/${n}`
    : colour.metricFallback;

  return (
    <SpecSection
      eyebrow={colour.eyebrow}
      metric={metric}
      title={colour.title}
      description={colour.description}
    >
      {copied ? (
        <p role="status" className="font-jetbrains type-caption text-syn-string mb-3">
          Copied {copied}
        </p>
      ) : null}
      <SpecGrid cols={4}>
        {TOKEN_REGISTRY.map((entry) => (
          <SwatchBlock
            key={`${entry.group}:${entry.name}`}
            entry={entry}
            state={map[`${entry.group}:${entry.name}`]}
            onCopy={onCopy}
          />
        ))}
      </SpecGrid>
    </SpecSection>
  );
}
