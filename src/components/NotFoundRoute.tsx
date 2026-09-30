"use client";

import { useSyncExternalStore } from "react";
import { notFoundPage } from "@/content/pages/not-found";

function subscribePath(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function readPath() {
  return window.location.pathname;
}

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Gutter({ n }: { n: number }) {
  return (
    <span className="inline-block w-6 shrink-0 select-none text-syn-number tabular-nums">
      {n}
    </span>
  );
}

/**
 * 404 editor body — visited path via usePathname, blinking caret (off for reduced motion).
 */
export function NotFoundRoute() {
  // Server and the hydration render both use "" so /_not-found never mismatches.
  const path = useSyncExternalStore(subscribePath, readPath, () => "");
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );

  return (
    <div className="font-jetbrains px-4 py-6 text-sm leading-6">
      <p className="flex gap-2">
        <Gutter n={1} />
        <span>
          <span className="text-syn-keyword">const</span>{" "}
          <span className="text-syn-property">path</span>
          <span className="text-foreground"> =</span>
        </span>
      </p>
      <p className="mt-1 flex gap-2">
        <Gutter n={2} />
        <span>
          <span className="text-syn-string">{`"${path}"`}</span>
          <span className="text-foreground">;</span>
        </span>
      </p>
      <p className="mt-1 flex gap-2">
        <Gutter n={3} />
        <span className="text-syn-comment italic">
          {notFoundPage.comment}
        </span>
      </p>
      <p className="mt-1 flex gap-2">
        <Gutter n={4} />
        <span className="text-foreground" aria-hidden="true">
          <span
            className={
              reduceMotion
                ? "inline-block h-[1.1em] w-[0.55ch] bg-foreground align-text-bottom opacity-100"
                : "footer-clock-colon inline-block h-[1.1em] w-[0.55ch] bg-foreground align-text-bottom"
            }
          />
        </span>
      </p>
    </div>
  );
}
