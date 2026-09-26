"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  BRAND_SYN_NUMBER,
  BRAND_SYN_STRING,
  BRAND_TEXT_MUTED,
  BRAND_TEXT_ON_TINT,
  fitHueAgainstBackground,
  fitMutedAgainstBackground,
  fitTextOnTint,
  getRandomAccessiblePair,
  INNER_BRAND_PAIR,
  isInnerBrandPair,
  type AccessibleColorPair,
} from "@/lib/accessibleColorPair";
import { blogCategoryColors } from "@/lib/blogCategoryColors";
import { BLOG_CATEGORIES, BLOG_CATEGORY_VARS } from "@/lib/blog-shared";

/** Legacy Spray persistence key — cleared once; no longer read or written. */
const LEGACY_STORAGE_KEY = "todo-spray";

type SprayContextValue = {
  pair: AccessibleColorPair;
  randomize: () => void;
};

const SprayContext = createContext<SprayContextValue | null>(null);

function applyPair(pair: AccessibleColorPair) {
  const root = document.documentElement.style;
  const brand = isInnerBrandPair(pair);

  root.setProperty("--background", pair.bg);
  root.setProperty("--foreground", pair.text);
  root.setProperty("--bg-canvas", pair.bg);
  // Brand lockup stays #0B0CB4 until Spray; sprayed routes ride pair.text.
  root.setProperty("--brand-logo", brand ? "#0B0CB4" : pair.text);
  root.setProperty(
    "--border-ide",
    `color-mix(in srgb, ${pair.text} 15%, transparent)`,
  );
  root.setProperty(
    "--media-elev-shadow",
    `color-mix(in srgb, ${pair.text} 16%, transparent)`,
  );
  root.setProperty(
    "--media-elev-bloom",
    `color-mix(in srgb, ${pair.text} 12%, transparent)`,
  );

  root.setProperty("--syn-keyword", pair.text);

  if (brand) {
    root.setProperty("--text-muted", BRAND_TEXT_MUTED);
    root.setProperty("--syn-property", BRAND_TEXT_MUTED);
    root.setProperty("--syn-comment", BRAND_TEXT_MUTED);
    root.setProperty("--syn-string", BRAND_SYN_STRING);
    root.setProperty("--syn-number", BRAND_SYN_NUMBER);
    root.setProperty("--text-on-tint", BRAND_TEXT_ON_TINT);
  } else {
    const muted = fitMutedAgainstBackground(pair.bg, pair.text);
    root.setProperty("--text-muted", muted);
    root.setProperty("--syn-property", muted);
    root.setProperty("--syn-comment", muted);
    root.setProperty(
      "--syn-string",
      fitHueAgainstBackground(pair.bg, 160, 70, 55),
    );
    root.setProperty(
      "--syn-number",
      fitHueAgainstBackground(pair.bg, 35, 80, 60),
    );
    root.setProperty("--text-on-tint", fitTextOnTint(pair.bg, pair.text));
  }

  // Brand: mix toward logo blue; sprayed: mix toward canvas.
  root.setProperty(
    "--syn-bracket",
    brand
      ? `color-mix(in srgb, ${pair.text} 75%, #0B0CB4)`
      : `color-mix(in srgb, ${pair.text} 80%, ${pair.bg})`,
  );
  root.setProperty(
    "--page-bridge",
    `color-mix(in srgb, ${pair.text} 32%, ${pair.bg} 68%)`,
  );
  const categoryColors = blogCategoryColors(pair);
  for (const category of BLOG_CATEGORIES) {
    root.setProperty(BLOG_CATEGORY_VARS[category], categoryColors[category]);
  }
}

export function SprayProvider({ children }: { children: ReactNode }) {
  const [pair, setPair] = useState<AccessibleColorPair>(INNER_BRAND_PAIR);

  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // Private mode — ignore.
    }
  }, []);

  useLayoutEffect(() => {
    applyPair(pair);
  }, [pair]);

  const randomize = useCallback(() => {
    setPair(getRandomAccessiblePair());
  }, []);

  const value = useMemo(() => ({ pair, randomize }), [pair, randomize]);

  return (
    <SprayContext.Provider value={value}>{children}</SprayContext.Provider>
  );
}

export function useSpray() {
  const context = useContext(SprayContext);
  if (!context) {
    throw new Error("useSpray must be used within SprayProvider");
  }
  return context;
}
