"use client";

import { useLayoutEffect, useRef } from "react";
import { homePage } from "@/content/pages/home";
import { HOME_FRAME } from "@/components/ide/homeFrame";

const { strip } = homePage;

/**
 * Flush under the hero — shared top edge with the hero rule.
 * Sets --home-strip-bottom for the bottom hairline / crosshairs / vertical gap.
 * Top hairline is drawn once by HomePageGrid on the hero rule.
 */
export function HomeFeatureStrip() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const sync = () => {
      const grid = el
        .closest("main")
        ?.querySelector<HTMLElement>("[data-home-grid]");
      if (!grid) return;
      const gridTop = grid.getBoundingClientRect().top;
      const rect = el.getBoundingClientRect();
      // Strip top === hero rule when flush; keep both vars in sync for verticals.
      const top = Math.round(rect.top - gridTop);
      const bottom = Math.round(rect.bottom - gridTop);
      grid.style.setProperty("--home-strip-top", `${top}px`);
      grid.style.setProperty("--home-strip-bottom", `${bottom}px`);
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className={`${HOME_FRAME} relative z-10`}
      aria-label={strip.aria}
    >
      {/* Bottom hairline = IDE tab-bar top edge (flush, no gap) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-6 bottom-0 left-6 h-px"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--foreground) 18%, transparent)",
        }}
      />

      <ul className="grid grid-cols-1 md:grid-cols-3">
        {strip.items.map((item, index) => (
          <li
            key={item.title}
            className={`border-border-ide px-7 py-7 md:px-8 md:py-10 ${
              index > 0 ? "border-t md:border-t-0 md:border-l" : ""
            }`}
          >
            <h2 className="font-unbounded text-foreground text-sm font-medium tracking-tight md:text-base">
              {item.title}
            </h2>
            <p className="type-body-sm text-foreground mt-3 max-w-[34ch] leading-[1.65]">
              {item.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
