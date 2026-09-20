"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

type Mode = "section" | "drill" | "none";
/** Section nav: out → swap → in. Drill / reduced: fade-in only. */
type Phase = "idle" | "out" | "swap" | "in" | "fading";

const FADE_OUT_MS = 100;
const FADE_IN_MS = 120;
const REDUCED_MS = 80;
const FAILSAFE_MS = 800;
const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const BLUR_MAX = "2px";

function sectionOf(path: string): string {
  if (path === "/" || path === "/intro") {
    return path;
  }
  const seg = path.split("/").filter(Boolean)[0] ?? "";
  return `/${seg}`;
}

function isGateway(path: string): boolean {
  return path === "/" || path === "/intro";
}

function classify(from: string, to: string): Mode {
  if (from === to) {
    return "none";
  }
  if (isGateway(from) || isGateway(to)) {
    return "none";
  }
  if (sectionOf(from) !== sectionOf(to)) {
    return "section";
  }
  return "drill";
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pathFromAnchor(anchor: HTMLAnchorElement): string | null {
  if (anchor.hasAttribute("download")) {
    return null;
  }
  const target = anchor.getAttribute("target");
  if (target && target !== "" && target !== "_self") {
    return null;
  }

  const raw = anchor.getAttribute("href");
  if (!raw || raw.startsWith("mailto:") || raw.startsWith("tel:")) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(raw, window.location.href);
  } catch {
    return null;
  }

  if (url.origin !== window.location.origin) {
    return null;
  }

  if (
    url.pathname === window.location.pathname &&
    url.search === window.location.search
  ) {
    return null;
  }

  return url.pathname;
}

function cancelAnimations(anims: Animation[]) {
  for (const anim of anims) {
    try {
      anim.cancel();
    } catch {
      /* already finished */
    }
  }
}

const BRIDGE_FALLBACK = "color-mix(in srgb, #4545FF 32%, #DDDDFF 68%)";

/** Resolve --page-bridge (or any CSS color) to a concrete rgb() for freeze. */
function freezePageBridge(): string {
  const styles = getComputedStyle(document.documentElement);
  const raw =
    styles.getPropertyValue("--page-bridge").trim() || BRIDGE_FALLBACK;
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;left:-9999px;top:0;background-color:${raw}`;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).backgroundColor;
  document.body.removeChild(probe);
  return resolved && resolved !== "rgba(0, 0, 0, 0)" ? resolved : raw;
}

/**
 * Primary section nav: CTA-style content fade (~220ms). No veils / flood / GSAP.
 * Blog drills: same short fade-in. Gateway + first paint skip.
 * Mid-tone --page-bridge under shell covers body house-blue during opacity gap.
 */
export function SectionTransitionGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("idle");
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [fadeOn, setFadeOn] = useState(false);
  const [fadeMs, setFadeMs] = useState(FADE_IN_MS);

  const prevPathRef = useRef(pathname);
  const phaseRef = useRef<Phase>("idle");
  const pushedRef = useRef(false);
  const gatedNavRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const bridgeRef = useRef<HTMLDivElement>(null);
  const animGenRef = useRef(0);
  const activeAnimsRef = useRef<Animation[]>([]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const resetShell = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    el.style.opacity = "";
    el.style.filter = "";
  }, []);

  /**
   * Freeze colour and force bridge visible in this frame via the live DOM node.
   * No React setState — avoids one blue frame before paint and effect lint.
   */
  const paintBridgeNow = useCallback(() => {
    const color = freezePageBridge();
    const el = bridgeRef.current;
    if (el) {
      el.style.backgroundColor = color;
      el.classList.add("st-page-bridge--active");
    }
    return color;
  }, []);

  const clearBridge = useCallback(() => {
    const el = bridgeRef.current;
    if (el) {
      el.classList.remove("st-page-bridge--active");
      el.style.backgroundColor = "";
    }
  }, []);

  const teardown = useCallback(() => {
    animGenRef.current += 1;
    cancelAnimations(activeAnimsRef.current);
    activeAnimsRef.current = [];
    pushedRef.current = false;
    gatedNavRef.current = false;
    setPendingHref(null);
    clearBridge();
    setPhase("idle");
    document.documentElement.classList.remove("is-section-transitioning");
    resetShell();
  }, [clearBridge, resetShell]);

  const runFadeOut = useCallback(
    (onDone: () => void) => {
      const el = contentRef.current;
      if (!el) {
        onDone();
        return;
      }

      const gen = ++animGenRef.current;
      cancelAnimations(activeAnimsRef.current);
      activeAnimsRef.current = [];

      const reduced = prefersReducedMotion();
      const duration = reduced ? REDUCED_MS : FADE_OUT_MS;
      const from = { opacity: "1", filter: "blur(0px)" };
      const to = reduced
        ? { opacity: "0", filter: "blur(0px)" }
        : { opacity: "0", filter: `blur(${BLUR_MAX})` };

      el.style.opacity = "1";
      el.style.filter = "blur(0px)";

      const anim = el.animate([from, to], {
        duration,
        easing: EASE_OUT,
        fill: "forwards",
      });
      activeAnimsRef.current.push(anim);

      anim.finished.then(
        () => {
          if (gen !== animGenRef.current) return;
          el.style.opacity = "0";
          el.style.filter = reduced ? "blur(0px)" : `blur(${BLUR_MAX})`;
          onDone();
        },
        () => {
          /* cancelled */
        },
      );
    },
    [],
  );

  const runFadeIn = useCallback(
    (onDone: () => void) => {
      const el = contentRef.current;
      if (!el) {
        onDone();
        return;
      }

      const gen = ++animGenRef.current;
      cancelAnimations(activeAnimsRef.current);
      activeAnimsRef.current = [];

      const reduced = prefersReducedMotion();
      const duration = reduced ? REDUCED_MS : FADE_IN_MS;
      const from = reduced
        ? { opacity: "0", filter: "blur(0px)" }
        : { opacity: "0", filter: `blur(${BLUR_MAX})` };
      const to = { opacity: "1", filter: "blur(0px)" };

      el.style.opacity = "0";
      el.style.filter = from.filter;

      const anim = el.animate([from, to], {
        duration,
        easing: EASE_OUT,
        fill: "forwards",
      });
      activeAnimsRef.current.push(anim);

      anim.finished.then(
        () => {
          if (gen !== animGenRef.current) return;
          resetShell();
          onDone();
        },
        () => {
          /* cancelled */
        },
      );
    },
    [resetShell],
  );

  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const nextPath = pathFromAnchor(anchor);
      if (!nextPath) {
        return;
      }
      if (classify(pathname, nextPath) !== "section") {
        return;
      }
      if (prefersReducedMotion()) {
        return;
      }

      const current = phaseRef.current;
      if (current !== "idle" && current !== "fading") {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      router.prefetch(nextPath);
      setPendingHref(nextPath);
      document.documentElement.classList.add("is-section-transitioning");
      pushedRef.current = false;
      gatedNavRef.current = true;
      paintBridgeNow();
      setPhase("out");
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [pathname, router, paintBridgeNow]);

  useLayoutEffect(() => {
    if (phase !== "out") {
      return;
    }

    // Same-frame guarantee: freeze + show bridge on the live node before fade.
    paintBridgeNow();

    let cancelled = false;
    runFadeOut(() => {
      if (cancelled) return;
      setPhase("swap");
    });

    return () => {
      cancelled = true;
      animGenRef.current += 1;
      cancelAnimations(activeAnimsRef.current);
      activeAnimsRef.current = [];
    };
  }, [phase, runFadeOut, paintBridgeNow]);

  useLayoutEffect(() => {
    if (phase !== "swap" || !pendingHref || pushedRef.current) {
      return;
    }
    pushedRef.current = true;
    gatedNavRef.current = true;
    router.push(pendingHref);
  }, [phase, pendingHref, router]);

  useLayoutEffect(() => {
    if (phase !== "swap" || !pendingHref) {
      return;
    }
    if (pathname !== pendingHref) {
      return;
    }
    const id = window.setTimeout(() => {
      setPhase("in");
    }, 0);
    return () => window.clearTimeout(id);
  }, [phase, pendingHref, pathname]);

  useLayoutEffect(() => {
    if (phase !== "in") {
      return;
    }

    let cancelled = false;
    runFadeIn(() => {
      if (!cancelled) {
        prevPathRef.current = pathname;
        teardown();
      }
    });

    return () => {
      cancelled = true;
      animGenRef.current += 1;
      cancelAnimations(activeAnimsRef.current);
      activeAnimsRef.current = [];
    };
  }, [phase, pathname, teardown, runFadeIn]);

  useLayoutEffect(() => {
    const from = prevPathRef.current;
    const to = pathname;
    if (from === to) {
      return;
    }

    if (
      gatedNavRef.current &&
      (phase === "out" || phase === "swap" || phase === "in")
    ) {
      return;
    }

    if (gatedNavRef.current) {
      gatedNavRef.current = false;
      prevPathRef.current = to;
      return;
    }

    const mode = classify(from, to);
    prevPathRef.current = to;

    if (mode === "none") {
      return;
    }

    const reduced = prefersReducedMotion();
    setFadeMs(reduced ? REDUCED_MS : FADE_IN_MS);
    setFadeOn(false);
    paintBridgeNow();
    setPhase("fading");
  }, [pathname, phase, paintBridgeNow]);

  useLayoutEffect(() => {
    if (phase !== "fading" || fadeOn) {
      return;
    }
    paintBridgeNow();
    const id = requestAnimationFrame(() => {
      setFadeOn(true);
    });
    return () => cancelAnimationFrame(id);
  }, [phase, fadeOn, paintBridgeNow]);

  useEffect(() => {
    if (phase !== "fading" || !fadeOn) {
      return;
    }
    const t = window.setTimeout(() => {
      setFadeOn(false);
      clearBridge();
      setPhase("idle");
    }, fadeMs);
    return () => window.clearTimeout(t);
  }, [phase, fadeOn, fadeMs, clearBridge]);

  useEffect(() => {
    if (phase === "idle" || phase === "fading") {
      return;
    }
    const t = window.setTimeout(() => {
      if (pendingHref && !pushedRef.current) {
        gatedNavRef.current = true;
        pushedRef.current = true;
        router.push(pendingHref);
      }
      prevPathRef.current = pathname;
      teardown();
    }, FAILSAFE_MS);
    return () => window.clearTimeout(t);
  }, [phase, pendingHref, router, pathname, teardown]);

  useEffect(() => {
    return () => {
      animGenRef.current += 1;
      cancelAnimations(activeAnimsRef.current);
      document.documentElement.classList.remove("is-section-transitioning");
    };
  }, []);

  return (
    <>
      <div ref={bridgeRef} className="st-page-bridge" aria-hidden />
      <div
        ref={contentRef}
        className={cn("st-content", fadeOn && "st-content--fade")}
        style={
          {
            "--st-fade-ms": `${fadeMs}ms`,
          } as CSSProperties
        }
      >
        {children}
      </div>
    </>
  );
}
