"use client";

import { useSpray } from "@/components/SprayProvider";
import { isInnerBrandPair } from "@/lib/accessibleColorPair";
import { cn } from "@/lib/cn";
import { uiPage } from "@/content/pages/ui";
import Link from "next/link";
import type { ReactNode } from "react";

function ResetButton() {
  const { reset, pair } = useSpray();
  const isBrand = isInnerBrandPair(pair);

  return (
    <button
      type="button"
      onClick={reset}
      disabled={isBrand}
      aria-label={uiPage.resetAria}
      className={cn(
        "font-jetbrains inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-current px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none disabled:cursor-default disabled:opacity-40",
      )}
    >
      {uiPage.resetLabel}
    </button>
  );
}

/**
 * Shared-edge tile grid: one outer border, internal dividers only.
 * Children paint border-b (+ md:border-r); negative margin pulls the outer
 * edge under the parent border so edges never double. Full-span = md:col-span-2.
 */
export function UiShowcaseGrid({ children }: { children: ReactNode }) {
  return (
    <div className="border-border-ide min-w-0 overflow-hidden rounded-[4px] border">
      <div
        className={cn(
          "grid min-w-0 grid-cols-1 -mb-px md:-mr-px md:grid-cols-2",
          "[&>*]:border-border-ide [&>*]:min-w-0 [&>*]:border-b",
          "md:[&>*]:border-r",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function UiShowcaseHeader() {
  return (
    <header className="border-border-ide mb-6 min-w-0 border-b pb-6 sm:mb-8 sm:pb-8">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <Link
          href={uiPage.hqLinkHref}
          className="font-jetbrains text-muted hover:text-foreground focus-visible:ring-current rounded-[4px] text-xs font-bold tracking-wider uppercase transition-colors duration-[400ms] ease-in-out focus-visible:ring-[3px] focus-visible:outline-none"
        >
          {uiPage.hqLinkLabel}
        </Link>
        <ResetButton />
      </div>
      <h1 className="type-title text-foreground mt-4 min-w-0 break-words">
        {uiPage.title}
      </h1>
      <p className="type-body text-foreground mt-2 max-w-2xl min-w-0 break-words">
        {/* // TEST COPY */}
        {uiPage.intro}
      </p>
      <p className="type-caption text-muted mt-2">
        {/* // TEST COPY */}
        {uiPage.tokensNote}
      </p>
    </header>
  );
}
