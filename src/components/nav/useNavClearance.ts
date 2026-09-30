"use client";

import { useLayoutEffect, type RefObject } from "react";

/** Keeps the menu scrollport below the live header, including the solid offset. */
export function useNavClearance(
  ref: RefObject<HTMLElement | null>,
  active = true,
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const sync = () => {
      const bottom = Math.ceil(el.getBoundingClientRect().bottom);
      document.documentElement.style.setProperty(
        "--nav-bar-bottom",
        `${bottom}px`,
      );
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync);
    };
  }, [ref, active]);
}
