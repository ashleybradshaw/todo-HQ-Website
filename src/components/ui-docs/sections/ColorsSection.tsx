"use client";

import { useCallback, useMemo, useState } from "react";
import { useSpray } from "@/components/SprayProvider";
import { UiSectionFrame } from "@/components/ui-docs/UiSectionFrame";
import {
  INNER_BRAND_PAIR,
  BRAND_TEXT_MUTED,
  BRAND_TEXT_ON_TINT,
  BRAND_SYN_STRING,
  BRAND_SYN_NUMBER,
  isInnerBrandPair,
} from "@/lib/accessibleColorPair";
import {
  contrastVsCanvasAndText,
  detectBrandDrift,
  formatContrast,
  readCssVarHex,
} from "@/lib/ui-docs/readCssVar";
import { SNIPPETS } from "@/lib/ui-docs/snippets";
import { TOKEN_REGISTRY, type TokenEntry } from "@/lib/ui-docs/tokenRegistry";
import { cn } from "@/lib/cn";

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

function useLiveTokens(pair: { bg: string; text: string }) {
  return useMemo(() => {
    return {
      map: readLiveTokenMap(),
      drift: detectBrandDrift(pair),
    };
  }, [pair]);
}

function SwatchCard({
  entry,
  state,
  onCopy,
}: {
  entry: TokenEntry;
  state: SwatchState | undefined;
  onCopy: (hex: string) => void;
}) {
  const hex = state?.hex;
  const tokenList = [entry.token, ...(entry.alsoTokens ?? [])];
  return (
    <button
      type="button"
      onClick={() => hex && onCopy(hex)}
      disabled={!hex}
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-[4px] border border-border-ide text-left transition-opacity duration-[400ms] ease-in-out hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none",
        !hex && "cursor-default opacity-60",
      )}
      aria-label={
        hex
          ? `Copy ${entry.name} ${hex}`
          : `${entry.name} — unresolved`
      }
    >
      <span
        className="block h-14 w-full border-b border-border-ide"
        style={{ backgroundColor: hex ? `var(${entry.token})` : "transparent" }}
        aria-hidden="true"
      />
      <span className="font-jetbrains flex min-w-0 flex-col gap-0.5 p-2 text-[10px] leading-4 tracking-wide">
        <span className="text-foreground break-words font-bold">{entry.name}</span>
        <span className="text-muted break-words">{tokenList.join(", ")}</span>
        <span className="text-foreground tabular-nums">{hex ?? "—"}</span>
        <span className="text-muted tabular-nums">
          vs canvas {formatContrast(state?.vsCanvas ?? null)}
        </span>
        <span className="text-muted tabular-nums">
          vs text {formatContrast(state?.vsText ?? null)}
        </span>
        {entry.note ? (
          <span className="text-syn-comment mt-1 break-words">{entry.note}</span>
        ) : null}
      </span>
    </button>
  );
}

function Group({
  title,
  entries,
  map,
  onCopy,
}: {
  title: string;
  entries: readonly TokenEntry[];
  map: Record<string, SwatchState>;
  onCopy: (hex: string) => void;
}) {
  if (entries.length === 0) return null;
  return (
    <div className="min-w-0">
      <h3 className="type-label text-muted mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {entries.map((entry) => (
          <SwatchCard
            key={`${entry.group}:${entry.name}`}
            entry={entry}
            state={map[`${entry.group}:${entry.name}`]}
            onCopy={onCopy}
          />
        ))}
      </div>
    </div>
  );
}

export function ColorsSection() {
  const { pair } = useSpray();
  const { map, drift } = useLiveTokens(pair);
  const [copied, setCopied] = useState<string | null>(null);

  const onCopy = useCallback((hex: string) => {
    void navigator.clipboard.writeText(hex).then(() => {
      setCopied(hex);
      window.setTimeout(() => setCopied(null), 1200);
    });
  }, []);

  const byGroup = (group: TokenEntry["group"]) =>
    TOKEN_REGISTRY.filter((t) => t.group === group);

  return (
    <UiSectionFrame
      comment="// Colours — live CSS vars. Click to copy. TEST COPY."
      code={SNIPPETS.colors}
      example={
        <div className="space-y-8 min-w-0">
          <div className="rounded-[4px] border border-border-ide p-3">
            <h3 className="type-label text-muted mb-2">
              Brand constants (TS)
            </h3>
            <p className="type-caption text-syn-comment mb-3">
              {/* // TEST COPY */}
              INNER_BRAND_PAIR and BRAND_* from accessibleColorPair.ts —
              reference only. Live swatches below read CSS.
            </p>
            <ul className="font-jetbrains grid grid-cols-1 gap-1 text-[10px] sm:grid-cols-2">
              <li>
                INNER_BRAND_PAIR.bg{" "}
                <span className="text-foreground">{INNER_BRAND_PAIR.bg}</span>
              </li>
              <li>
                INNER_BRAND_PAIR.text{" "}
                <span className="text-foreground">{INNER_BRAND_PAIR.text}</span>
              </li>
              <li>
                BRAND_TEXT_MUTED{" "}
                <span className="text-foreground">{BRAND_TEXT_MUTED}</span>
              </li>
              <li>
                BRAND_TEXT_ON_TINT{" "}
                <span className="text-foreground">{BRAND_TEXT_ON_TINT}</span>
              </li>
              <li>
                BRAND_SYN_STRING{" "}
                <span className="text-foreground">{BRAND_SYN_STRING}</span>
              </li>
              <li>
                BRAND_SYN_NUMBER{" "}
                <span className="text-foreground">{BRAND_SYN_NUMBER}</span>
              </li>
            </ul>
            {isInnerBrandPair(pair) ? (
              drift.drifted ? (
                <p
                  role="status"
                  className="font-jetbrains mt-3 border border-[color-mix(in_srgb,var(--status-pending)_50%,transparent)] bg-[color-mix(in_srgb,var(--status-pending)_12%,transparent)] px-2 py-1.5 text-[10px] text-foreground"
                >
                  drift: {drift.details.join("; ")}
                </p>
              ) : (
                <p className="font-jetbrains text-syn-string mt-3 text-[10px]">
                  brand state — CSS matches INNER_BRAND_PAIR
                </p>
              )
            ) : (
              <p className="font-jetbrains text-muted mt-3 text-[10px]">
                sprayed — brand constant drift check paused until Reset
              </p>
            )}
          </div>

          {copied ? (
            <p role="status" className="font-jetbrains type-caption text-syn-string">
              Copied {copied}
            </p>
          ) : null}

          <Group title="Core" entries={byGroup("core")} map={map} onCopy={onCopy} />
          <Group title="Status" entries={byGroup("status")} map={map} onCopy={onCopy} />
          <Group title="Syntax" entries={byGroup("syntax")} map={map} onCopy={onCopy} />
          <Group title="Blog categories" entries={byGroup("blog")} map={map} onCopy={onCopy} />
          <Group
            title="Derived mixes (blue / powder via live pair)"
            entries={byGroup("derived")}
            map={map}
            onCopy={onCopy}
          />
          <Group
            title="Selection"
            entries={byGroup("selection")}
            map={map}
            onCopy={onCopy}
          />
        </div>
      }
    />
  );
}
