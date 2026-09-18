"use client";

import {
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
type Phase = "idle" | "covering" | "covered" | "revealing" | "fading";

const COVER_MS = 850;
const COVER_FADE_MS = 350;
const HOLD_MS = 50;
const REVEAL_MS = 850;
const REVEAL_FADE_MS = 350;
const REVEAL_FADE_DELAY_MS = 550;
const FADE_MS = 160;
const REDUCED_FADE_MS = 100;
const FAILSAFE_MS = 2800;
const STROKE_THIN = 2;
const STROKE_FLOOD = 320;
const STROKE_FALLBACK = "#0000ff";

const FLOOD_PATH =
  "M13.4746 291.27C13.4746 291.27 100.646 -18.6724 255.617 16.8418C410.588 52.356 61.0296 431.197 233.017 546.326C431.659 679.299 444.494 21.0125 652.73 100.784C860.967 180.556 468.663 430.709 617.216 546.326C765.769 661.944 819.097 48.2722 988.501 120.156C1174.21 198.957 809.424 543.841 988.501 636.726C1189.37 740.915 1301.67 149.213 1301.67 149.213";

function channelToLinear(channel: number) {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function parseCssColor(raw: string): { r: number; g: number; b: number } | null {
  const value = raw.trim();
  const hex = /^#([0-9a-fA-F]{6})$/.exec(value);
  if (hex) {
    const n = Number.parseInt(hex[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(value);
  if (rgb) {
    return {
      r: Number(rgb[1]),
      g: Number(rgb[2]),
      b: Number(rgb[3]),
    };
  }
  return null;
}

function relativeLuminance(rgb: { r: number; g: number; b: number }) {
  return (
    0.2126 * channelToLinear(rgb.r) +
    0.7152 * channelToLinear(rgb.g) +
    0.0722 * channelToLinear(rgb.b)
  );
}

/** Darker of live --background / --foreground for a subtle flood (not a light splash). */
function darkerThemeStroke(): string {
  const styles = getComputedStyle(document.documentElement);
  const bgRaw = styles.getPropertyValue("--background").trim();
  const fgRaw = styles.getPropertyValue("--foreground").trim();
  const bg = parseCssColor(bgRaw);
  const fg = parseCssColor(fgRaw);
  if (!bg || !fg) {
    return STROKE_FALLBACK;
  }
  return relativeLuminance(bg) <= relativeLuminance(fg) ? bgRaw : fgRaw;
}

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

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Section-root SVG stroke-flood (AnimMaster svg-page-transition, rAF + CSS attrs).
 * Blog drills: fast opacity fade. No GSAP/DrawSVG.
 */
export function SectionTransitionGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("idle");
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [fadeOn, setFadeOn] = useState(false);
  const [fadeMs, setFadeMs] = useState(FADE_MS);
  const [floodStroke, setFloodStroke] = useState(STROKE_FALLBACK);

  const prevPathRef = useRef(pathname);
  const phaseRef = useRef<Phase>("idle");
  const pushedRef = useRef(false);
  const floodNavRef = useRef(false);
  const pathRef = useRef<SVGPathElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathLenRef = useRef(0);
  const animGenRef = useRef(0);
  const rafRef = useRef(0);

  phaseRef.current = phase;

  const teardown = () => {
    animGenRef.current += 1;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    pushedRef.current = false;
    floodNavRef.current = false;
    setPendingHref(null);
    setFloodStroke(STROKE_FALLBACK);
    setPhase("idle");
    document.documentElement.classList.remove("is-section-transitioning");
    const path = pathRef.current;
    const overlay = overlayRef.current;
    if (overlay) {
      overlay.style.opacity = "0";
    }
    if (path && pathLenRef.current > 0) {
      path.style.setProperty("--st-flood-stroke", STROKE_FALLBACK);
      path.setAttribute("stroke-dashoffset", `${pathLenRef.current}`);
      path.setAttribute("stroke-width", `${STROKE_THIN}`);
    }
  };

  const ensurePathLength = () => {
    const path = pathRef.current;
    if (!path) {
      return 0;
    }
    if (pathLenRef.current > 0) {
      return pathLenRef.current;
    }
    const length = path.getTotalLength();
    if (length > 0) {
      pathLenRef.current = length;
      path.setAttribute("stroke-dasharray", `${length}`);
      path.setAttribute("stroke-dashoffset", `${length}`);
      path.setAttribute("stroke-width", `${STROKE_THIN}`);
    }
    return length;
  };

  useLayoutEffect(() => {
    ensurePathLength();
  }, []);

  const runCover = (onDone: () => void) => {
    const path = pathRef.current;
    const overlay = overlayRef.current;
    const length = ensurePathLength();
    if (!path || !overlay || length <= 0) {
      onDone();
      return;
    }

    const gen = ++animGenRef.current;
    const start = performance.now();
    const stroke = darkerThemeStroke();
    setFloodStroke(stroke);
    path.style.setProperty("--st-flood-stroke", stroke);

    path.setAttribute("stroke-dasharray", `${length}`);
    path.setAttribute("stroke-dashoffset", `${length}`);
    path.setAttribute("stroke-width", `${STROKE_THIN}`);
    overlay.style.opacity = "0";

    const tick = (now: number) => {
      if (gen !== animGenRef.current) {
        return;
      }
      const elapsed = now - start;
      const drawT = easeInOut(Math.min(1, elapsed / COVER_MS));
      const fadeT = easeInOut(Math.min(1, elapsed / COVER_FADE_MS));

      path.setAttribute("stroke-dashoffset", `${length * (1 - drawT)}`);
      path.setAttribute(
        "stroke-width",
        `${STROKE_THIN + (STROKE_FLOOD - STROKE_THIN) * drawT}`,
      );
      overlay.style.opacity = `${fadeT}`;

      if (elapsed < COVER_MS) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      path.setAttribute("stroke-dashoffset", "0");
      path.setAttribute("stroke-width", `${STROKE_FLOOD}`);
      overlay.style.opacity = "1";
      onDone();
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const runReveal = (onDone: () => void) => {
    const path = pathRef.current;
    const overlay = overlayRef.current;
    const length = pathLenRef.current || ensurePathLength();
    if (!path || !overlay || length <= 0) {
      onDone();
      return;
    }

    const gen = ++animGenRef.current;
    const start = performance.now();

    path.setAttribute("stroke-dashoffset", "0");
    path.setAttribute("stroke-width", `${STROKE_FLOOD}`);
    overlay.style.opacity = "1";

    const tick = (now: number) => {
      if (gen !== animGenRef.current) {
        return;
      }
      const elapsed = now - start;
      const collapseT = easeInOut(Math.min(1, elapsed / REVEAL_MS));
      path.setAttribute("stroke-dashoffset", `${-length * collapseT}`);
      path.setAttribute(
        "stroke-width",
        `${STROKE_FLOOD + (STROKE_THIN - STROKE_FLOOD) * collapseT}`,
      );

      if (elapsed >= REVEAL_FADE_DELAY_MS) {
        const fadeElapsed = elapsed - REVEAL_FADE_DELAY_MS;
        const fadeT = easeInOut(Math.min(1, fadeElapsed / REVEAL_FADE_MS));
        overlay.style.opacity = `${1 - fadeT}`;
      }

      if (elapsed < REVEAL_MS) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      overlay.style.opacity = "0";
      onDone();
    };

    rafRef.current = requestAnimationFrame(tick);
  };

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

      event.preventDefault();
      router.prefetch(nextPath);
      setPendingHref(nextPath);

      const current = phaseRef.current;
      if (current !== "idle" && current !== "fading") {
        if (!pushedRef.current) {
          floodNavRef.current = true;
          pushedRef.current = true;
          router.push(nextPath);
        }
        return;
      }

      document.documentElement.classList.add("is-section-transitioning");
      pushedRef.current = false;
      floodNavRef.current = true;
      setPhase("covering");
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [pathname, router]);

  useLayoutEffect(() => {
    if (phase !== "covering") {
      return;
    }

    let cancelled = false;
    runCover(() => {
      if (cancelled) {
        return;
      }
      window.setTimeout(() => {
        if (!cancelled) {
          setPhase("covered");
        }
      }, HOLD_MS);
    });

    return () => {
      cancelled = true;
      animGenRef.current += 1;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [phase]);

  useLayoutEffect(() => {
    if (phase !== "covered" || !pendingHref || pushedRef.current) {
      return;
    }
    pushedRef.current = true;
    floodNavRef.current = true;
    router.push(pendingHref);
  }, [phase, pendingHref, router]);

  useLayoutEffect(() => {
    if (phase !== "covered" || !pendingHref) {
      return;
    }
    if (pathname !== pendingHref) {
      return;
    }
    setPhase("revealing");
  }, [phase, pendingHref, pathname]);

  useLayoutEffect(() => {
    if (phase !== "revealing") {
      return;
    }

    let cancelled = false;
    runReveal(() => {
      if (!cancelled) {
        prevPathRef.current = pathname;
        teardown();
      }
    });

    return () => {
      cancelled = true;
      animGenRef.current += 1;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [phase, pathname]);

  useLayoutEffect(() => {
    const from = prevPathRef.current;
    const to = pathname;
    if (from === to) {
      return;
    }

    if (
      floodNavRef.current &&
      (phase === "covered" || phase === "revealing" || phase === "covering")
    ) {
      return;
    }

    if (floodNavRef.current) {
      floodNavRef.current = false;
      prevPathRef.current = to;
      return;
    }

    const mode = classify(from, to);
    prevPathRef.current = to;

    if (mode === "none") {
      return;
    }

    const reduced = prefersReducedMotion();
    setFadeMs(
      mode === "section" || reduced ? REDUCED_FADE_MS : FADE_MS,
    );
    setFadeOn(false);
    setPhase("fading");
  }, [pathname, phase]);

  useLayoutEffect(() => {
    if (phase !== "fading" || fadeOn) {
      return;
    }
    const id = requestAnimationFrame(() => {
      setFadeOn(true);
    });
    return () => cancelAnimationFrame(id);
  }, [phase, fadeOn]);

  useEffect(() => {
    if (phase !== "fading" || !fadeOn) {
      return;
    }
    const t = window.setTimeout(() => {
      setFadeOn(false);
      setPhase("idle");
    }, fadeMs);
    return () => window.clearTimeout(t);
  }, [phase, fadeOn, fadeMs]);

  useEffect(() => {
    if (phase === "idle" || phase === "fading") {
      return;
    }
    const t = window.setTimeout(() => {
      if (pendingHref && !pushedRef.current) {
        floodNavRef.current = true;
        pushedRef.current = true;
        router.push(pendingHref);
      }
      prevPathRef.current = pathname;
      teardown();
    }, FAILSAFE_MS);
    return () => window.clearTimeout(t);
  }, [phase, pendingHref, router, pathname]);

  useEffect(() => {
    return () => {
      animGenRef.current += 1;
      document.documentElement.classList.remove("is-section-transitioning");
    };
  }, []);

  const floodActive =
    phase === "covering" || phase === "covered" || phase === "revealing";

  return (
    <>
      <div
        className={cn("st-content", fadeOn && "st-content--fade")}
        style={
          {
            "--st-fade-ms": `${fadeMs}ms`,
          } as CSSProperties
        }
      >
        {children}
      </div>
      <div
        ref={overlayRef}
        className={cn("st-flood", floodActive && "st-flood--active")}
        aria-hidden
        aria-busy={floodActive}
        style={{ opacity: 0 }}
      >
        <svg
          className="st-flood-svg"
          width="100%"
          height="100%"
          viewBox="0 0 1316 664"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <path
            ref={pathRef}
            className="st-flood-path"
            d={FLOOD_PATH}
            fill="none"
            strokeWidth={STROKE_THIN}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={
              {
                "--st-flood-stroke": floodStroke,
              } as CSSProperties
            }
          />
        </svg>
      </div>
    </>
  );
}
