"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useSpray } from "@/components/SprayProvider";
import { MetricChips } from "@/components/ui-docs/spec/MetricChips";
import { SpecSection } from "@/components/ui-docs/spec/SpecSection";
import { contrastRatio } from "@/lib/accessibleColorPair";
import {
  formatContrast,
  readCssVarHex,
} from "@/lib/ui-docs/readCssVar";
import { TOKEN_REGISTRY, type TokenEntry } from "@/lib/ui-docs/tokenRegistry";
import { cn } from "@/lib/cn";
import { uiPage } from "@/content/pages/ui";

/** Named non-fill / effect tokens — always MetricChips, never swatches. */
const EFFECT_TOKEN_NAMES = new Set([
  "--syn-bracket",
  "--border-ide",
  "--page-bridge",
  "--media-elev-shadow",
  "--media-elev-bloom",
]);

type ContrastPair = {
  /** CSS var to contrast against (without needing the swatch hex as both sides). */
  againstToken: string;
  /** Short chip label, e.g. "vs text" / "vs canvas" / "vs selection-bg". */
  label: string;
};

/** Background-type tokens use their real pair; everything else vs powder canvas. */
function contrastPairFor(token: string): ContrastPair {
  if (token === "--bg-canvas") {
    return { againstToken: "--foreground", label: "vs text" };
  }
  if (token === "--selection-fg") {
    return { againstToken: "--selection-bg", label: "vs selection-bg" };
  }
  return { againstToken: "--bg-canvas", label: "vs canvas" };
}

type SwatchState = {
  hex: string | null;
  ratio: number | null;
  pairLabel: string;
};

function readLiveTokenMap(): Record<string, SwatchState> {
  if (typeof document === "undefined") return {};
  const next: Record<string, SwatchState> = {};
  for (const entry of TOKEN_REGISTRY) {
    const hex = readCssVarHex(entry.token);
    const pair = contrastPairFor(entry.token);
    const against = readCssVarHex(pair.againstToken);
    const ratio =
      hex && against ? contrastRatio(hex, against) : null;
    next[`${entry.group}:${entry.name}`] = {
      hex,
      ratio,
      pairLabel: pair.label,
    };
  }
  return next;
}

function isEffectEntry(entry: TokenEntry, hex: string | null) {
  return EFFECT_TOKEN_NAMES.has(entry.token) || !hex;
}

function aaChip(ratio: number | null, pairLabel: string): string {
  const formatted = formatContrast(ratio);
  if (formatted === "n/a") return `AA ${pairLabel} n/a`;
  const pass = (ratio ?? 0) >= 4.5;
  return `AA ${pairLabel} ${formatted} ${pass ? "pass" : "fail"}`;
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
      aria-label={hex ? `Copy ${entry.name} ${hex}` : `${entry.name}, unresolved`}
    >
      <span
        className="border-border-ide block h-16 w-full border-b md:h-24"
        style={{ backgroundColor: hex ? `var(${entry.token})` : "transparent" }}
        aria-hidden="true"
      />
      <span className="font-jetbrains flex min-w-0 flex-col gap-1 p-3 text-[10px] leading-4 tracking-wide">
        <span className="text-foreground break-words font-bold">{entry.name}</span>
        <span className="text-muted break-words">{entry.token}</span>
        <span className="text-foreground tabular-nums">{hex ?? "unset"}</span>
        <MetricChips
          name="contrast"
          values={[aaChip(state?.ratio ?? null, state?.pairLabel ?? "vs canvas")]}
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
  const map = useMemo(
    () => (mounted ? readLiveTokenMap() : {}),
    // pair forces re-read when Spray remaps CSS vars
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pair identity drives live CSS
    [mounted, pair.bg, pair.text],
  );

  const [copied, setCopied] = useState<string | null>(null);

  const onCopy = useCallback((hex: string) => {
    void navigator.clipboard.writeText(hex).then(() => {
      setCopied(hex);
      window.setTimeout(() => setCopied(null), 1200);
    });
  }, []);

  const { solids, effects } = useMemo(() => {
    const solids: TokenEntry[] = [];
    const effects: TokenEntry[] = [];
    for (const entry of TOKEN_REGISTRY) {
      const key = `${entry.group}:${entry.name}`;
      const hex = mounted ? (map[key]?.hex ?? null) : null;
      if (!mounted) {
        if (EFFECT_TOKEN_NAMES.has(entry.token)) effects.push(entry);
        else solids.push(entry);
        continue;
      }
      if (isEffectEntry(entry, hex)) effects.push(entry);
      else solids.push(entry);
    }
    return { solids, effects };
  }, [map, mounted]);

  const aaPass = mounted
    ? solids.filter((entry) => {
        const state = map[`${entry.group}:${entry.name}`];
        return (state?.ratio ?? 0) >= 4.5;
      }).length
    : null;
  const n = solids.length;
  const metric = mounted
    ? `${n} TOKENS · AA ${aaPass}/${n}`
    : colour.metricFallback;

  const effectLabels = effects.map((e) => e.token.replace(/^--/, ""));

  return (
    <SpecSection
      id="ui-colour"
      eyebrow={colour.eyebrow}
      metric={metric}
      title={colour.title}
      description={colour.description}
    >
      {copied ? (
        <p
          role="status"
          className="font-jetbrains type-caption text-syn-string mb-3"
        >
          Copied {copied}
        </p>
      ) : null}
      <div className="grid min-w-0 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {solids.map((entry) => (
          <SwatchBlock
            key={`${entry.group}:${entry.name}`}
            entry={entry}
            state={map[`${entry.group}:${entry.name}`]}
            onCopy={onCopy}
          />
        ))}
      </div>
      {effectLabels.length > 0 ? (
        <MetricChips
          name="// EFFECT TOKENS"
          values={effectLabels}
          className="mt-4"
        />
      ) : null}
    </SpecSection>
  );
}
