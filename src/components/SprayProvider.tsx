"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  getRandomAccessiblePair,
  INNER_BRAND_PAIR,
  isAccessibleColorPair,
  isInnerBrandPair,
  type AccessibleColorPair,
} from "@/lib/accessibleColorPair";
import { blogCategoryColors } from "@/lib/blogCategoryColors";
import { BLOG_CATEGORIES, BLOG_CATEGORY_VARS } from "@/lib/blog-shared";

const STORAGE_KEY = "todo-spray";

type SprayContextValue = {
  pair: AccessibleColorPair;
  locked: boolean;
  randomize: () => void;
};

const SprayContext = createContext<SprayContextValue | null>(null);

function isLockedPath(pathname: string) {
  return pathname === "/" || pathname === "/intro";
}

function readStoredPair(): AccessibleColorPair | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return isAccessibleColorPair(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredPair(pair: AccessibleColorPair) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pair));
  } catch {
    // Private mode or quota — in-memory pair still applies.
  }
}

function applyInnerPair(pair: AccessibleColorPair) {
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
  root.setProperty(
    "--syn-property",
    `color-mix(in srgb, ${pair.text} 68%, ${pair.bg})`,
  );
  root.setProperty(
    "--syn-comment",
    `color-mix(in srgb, ${pair.text} 45%, transparent)`,
  );
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
  const pathname = usePathname();
  const locked = isLockedPath(pathname);
  const [pair, setPair] = useState<AccessibleColorPair>(() => {
    if (typeof window === "undefined") {
      return INNER_BRAND_PAIR;
    }
    return readStoredPair() ?? INNER_BRAND_PAIR;
  });

  useLayoutEffect(() => {
    applyInnerPair(locked ? INNER_BRAND_PAIR : pair);
  }, [locked, pair]);

  const randomize = useCallback(() => {
    const next = getRandomAccessiblePair();
    setPair(next);
    writeStoredPair(next);
  }, []);

  const value = useMemo(
    () => ({ pair, locked, randomize }),
    [locked, pair, randomize],
  );

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
