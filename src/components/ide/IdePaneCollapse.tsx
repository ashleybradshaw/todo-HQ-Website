"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { homePage } from "@/content/pages/home";

const { chrome } = homePage;

const COLLAPSE_MAX = "75svh";

type IdePaneCollapseProps = {
  children: ReactNode;
  /** Total line count for the "Show all {n} lines" label. */
  lineCount: number;
};

/**
 * Under md: clamp tall panes at ~75svh with a token fade + expand toggle.
 * Focus stays on the button; label flips to "Show fewer lines" when expanded.
 * No internal scrollbar — the page remains the only scroller.
 */
export function IdePaneCollapse({ children, lineCount }: IdePaneCollapseProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [needsCollapse, setNeedsCollapse] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const regionId = useId();

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => {
      if (mq.matches) {
        setNeedsCollapse(false);
        return;
      }
      // Compare natural height against 75svh.
      const cap = window.innerHeight * 0.75;
      setNeedsCollapse(el.scrollHeight > cap + 8);
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    mq.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, [children, lineCount]);

  const collapsed = needsCollapse && !expanded;
  const label = expanded
    ? chrome.showFewerLines
    : chrome.showAllLines.replace("{n}", String(lineCount));

  return (
    <div className="relative">
      <div
        id={regionId}
        ref={contentRef}
        className={collapsed ? "overflow-hidden" : undefined}
        style={collapsed ? { maxHeight: COLLAPSE_MAX } : undefined}
      >
        {children}
      </div>

      {needsCollapse ? (
        <div
          className={`relative flex justify-center ${collapsed ? "-mt-12 pt-12" : "mt-3"}`}
        >
          {collapsed ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
              style={{
                backgroundImage:
                  "linear-gradient(to top, var(--bg-canvas) 0%, color-mix(in srgb, var(--bg-canvas) 70%, transparent) 55%, transparent 100%)",
              }}
            />
          ) : null}
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={regionId}
            onClick={() => setExpanded((current) => !current)}
            className="font-jetbrains relative z-10 rounded-[4px] border border-border-ide bg-bg-canvas px-3 py-1.5 text-[11px] text-foreground transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none"
          >
            {label}
          </button>
        </div>
      ) : null}
    </div>
  );
}
