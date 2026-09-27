"use client";

import { useLayoutEffect, useRef } from "react";
import { homePage } from "@/content/pages/home";
import { HOME_FRAME } from "@/components/ide/homeFrame";

const { strip } = homePage;

/**
 * Sets --home-strip-top / --home-strip-bottom on <main> so the page grid
 * can gap verticals through the strip and place crosshairs on its hairlines.
 */
export function HomeFeatureStrip() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const sync = () => {
      const main = el.closest("main");
      if (!main) return;
      const mainTop = main.getBoundingClientRect().top + window.scrollY;
      const rect = el.getBoundingClientRect();
      const top = Math.round(rect.top + window.scrollY - mainTop);
      const bottom = Math.round(rect.bottom + window.scrollY - mainTop);
      main.style.setProperty("--home-strip-top", `${top}px`);
      main.style.setProperty("--home-strip-bottom", `${bottom}px`);
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
      className={`${HOME_FRAME} relative z-10 my-16 border-y border-border-ide md:my-20`}
      aria-label="What we build"
    >
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
