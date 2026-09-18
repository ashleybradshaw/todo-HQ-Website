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
  root.setProperty("--background", pair.bg);
  root.setProperty("--foreground", pair.text);
  root.setProperty("--bg-canvas", pair.bg);
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
  const categoryColors = blogCategoryColors(pair);
  for (const category of BLOG_CATEGORIES) {
    root.setProperty(BLOG_CATEGORY_VARS[category], categoryColors[category]);
  }
}

export function SprayProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locked = isLockedPath(pathname);
  const [pair, setPair] = useState<AccessibleColorPair>(INNER_BRAND_PAIR);

  useLayoutEffect(() => {
    const stored = readStoredPair();
    if (stored) {
      setPair(stored);
    }
  }, []);

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
