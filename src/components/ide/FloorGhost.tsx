"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/cn";

/**
 * Symmetric sheet ghost (viewBox 72², center x=36).
 * Dome half-width 25 → walls 11 / 61 (mirrored cubics).
 * Three equal scallops across 11→61 (width 50/3).
 */
const GHOST_BODY_D =
  "M36 8C22.193 8 11 19.193 11 33v17" +
  "Q19.333 64 27.667 50" +
  "Q36 64 44.333 50" +
  "Q52.667 64 61 50" +
  "V33C61 19.193 49.807 8 36 8Z";

const SIZE_PX = {
  hero: 128,
  mini: 40,
} as const;

export type FloorGhostSize = keyof typeof SIZE_PX;
export type FloorGhostLook = "center" | "in" | "out";

const BLINK_HOLD_MS = 110;
/** Solo (non-duo) sparse blink — unused when `driven`. */
const SOLO_BLINK = {
  hero: { min: 12_000, span: 16_000 },
  mini: { min: 18_000, span: 22_000 },
} as const;

const LOOP_MS = 60_000;

type GhostMood = {
  look: FloorGhostLook;
  blinking: boolean;
  wobbling: boolean;
  giggling: boolean;
  hoverHi: boolean;
};

const IDLE: GhostMood = {
  look: "center",
  blinking: false,
  wobbling: false,
  giggling: false,
  hoverHi: false,
};

type DuoMood = { hero: GhostMood; mini: GhostMood };

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Floor ghost — libraries.dev Ghost silhouette (owned SVG, no bot-avatars).
 * Soft volume via gradient; CSS bob. Blink/look/mood owned by duo when `driven`.
 */
export function FloorGhost({
  className,
  style,
  size = "hero",
  look = "center",
  blinking: blinkingProp,
  wobbling = false,
  giggling = false,
  hoverHi = false,
  driven = false,
}: {
  className?: string;
  style?: CSSProperties;
  size?: FloorGhostSize;
  look?: FloorGhostLook;
  blinking?: boolean;
  wobbling?: boolean;
  giggling?: boolean;
  hoverHi?: boolean;
  /** When true, parent timeline owns blink — no solo random loop. */
  driven?: boolean;
}) {
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );
  const [soloBlink, setSoloBlink] = useState(false);
  const shadeId = useId().replace(/:/g, "");
  const holdRef = useRef(0);
  const px = SIZE_PX[size];
  const blinking = driven ? Boolean(blinkingProp) : soloBlink;

  useEffect(() => {
    if (driven || reduceMotion) {
      return;
    }

    let wait = 0;
    let cancelled = false;
    const { min, span } = SOLO_BLINK[size];

    const arm = () => {
      wait = window.setTimeout(() => {
        if (cancelled) {
          return;
        }
        setSoloBlink(true);
        holdRef.current = window.setTimeout(() => {
          if (cancelled) {
            return;
          }
          setSoloBlink(false);
          arm();
        }, BLINK_HOLD_MS);
      }, min + Math.random() * span);
    };

    arm();

    return () => {
      cancelled = true;
      window.clearTimeout(wait);
      window.clearTimeout(holdRef.current);
    };
  }, [driven, reduceMotion, size]);

  return (
    <span
      className={cn(
        "floor-ghost",
        size === "mini" ? "floor-ghost--mini" : "floor-ghost--hero",
        look !== "center" && `is-looking-${look}`,
        blinking && "is-blinking",
        wobbling && "is-wobbling",
        giggling && "is-giggling",
        hoverHi && "is-hover-hi",
        className,
      )}
      style={
        {
          ["--floor-ghost-size" as string]: `${px}px`,
          ...style,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <svg
        className="floor-ghost__svg"
        viewBox="0 0 72 72"
        width={px}
        height={px}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
      >
        <defs>
          <radialGradient
            id={shadeId}
            cx="34%"
            cy="28%"
            r="72%"
            fx="30%"
            fy="22%"
          >
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="55%" stopColor="currentColor" stopOpacity="0.92" />
            <stop
              offset="100%"
              stopColor="currentColor"
              stopOpacity="0.72"
            />
          </radialGradient>
        </defs>

        <path
          className="floor-ghost__body"
          fill={`url(#${shadeId})`}
          d={GHOST_BODY_D}
        />
        <ellipse
          className="floor-ghost__highlight"
          cx="30"
          cy="22"
          rx="14"
          ry="9"
          fill="currentColor"
          opacity="0.22"
        />
        <g className="floor-ghost__eyes">
          <ellipse
            className="floor-ghost__eye"
            cx="28.5"
            cy="33"
            rx="3.6"
            ry="5.4"
          />
          <ellipse
            className="floor-ghost__eye"
            cx="43.5"
            cy="33"
            rx="3.6"
            ry="5.4"
          />
        </g>
      </svg>
    </span>
  );
}

/**
 * 60s relationship loop — one timeline, both ghosts.
 *
 * 0–8s     idle bob
 * 8–12s    LOOK in
 * 12–14s   shared blink (mini +40ms)
 * 14–22s   idle
 * 22–28s   WOBBLE
 * 28–34s   GIGGLE (mini first, hero +350ms)
 * 34–42s   HOVER-hi
 * 42–48s   glance (look in)
 * 48–52s   sequential blink (hero then mini)
 * 52–60s   settle → restart
 */
function useDuoTimeline(enabled: boolean): DuoMood {
  const [mood, setMood] = useState<DuoMood>({ hero: IDLE, mini: IDLE });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    const timers: number[] = [];

    const at = (ms: number, fn: () => void) => {
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) {
            fn();
          }
        }, ms),
      );
    };

    const pulseBlink = (
      who: "hero" | "mini",
      startMs: number,
      holdMs = BLINK_HOLD_MS,
    ) => {
      at(startMs, () => {
        setMood((prev) => ({
          ...prev,
          [who]: { ...prev[who], blinking: true },
        }));
      });
      at(startMs + holdMs, () => {
        setMood((prev) => ({
          ...prev,
          [who]: { ...prev[who], blinking: false },
        }));
      });
    };

    const scheduleCycle = (base: number) => {
      // 0 — idle
      at(base + 0, () => setMood({ hero: IDLE, mini: IDLE }));

      // 8s — LOOK
      at(base + 8_000, () =>
        setMood({
          hero: { ...IDLE, look: "in" },
          mini: { ...IDLE, look: "in" },
        }),
      );

      // 12s — shared blink (mini lags 40ms)
      pulseBlink("hero", base + 12_000);
      pulseBlink("mini", base + 12_040);

      // 14s — idle, eyes home
      at(base + 14_000, () => setMood({ hero: IDLE, mini: IDLE }));

      // 22s — WOBBLE
      at(base + 22_000, () =>
        setMood({
          hero: { ...IDLE, wobbling: true },
          mini: { ...IDLE, wobbling: true },
        }),
      );

      // 28s — GIGGLE (mini first)
      at(base + 28_000, () =>
        setMood({
          hero: IDLE,
          mini: { ...IDLE, giggling: true },
        }),
      );
      at(base + 28_350, () =>
        setMood({
          hero: { ...IDLE, giggling: true },
          mini: { ...IDLE, giggling: true },
        }),
      );

      // 34s — HOVER-hi
      at(base + 34_000, () =>
        setMood({
          hero: { ...IDLE, hoverHi: true },
          mini: { ...IDLE, hoverHi: true },
        }),
      );

      // 42s — glance
      at(base + 42_000, () =>
        setMood({
          hero: { ...IDLE, look: "in" },
          mini: { ...IDLE, look: "in" },
        }),
      );

      // 48s — sequential blink
      at(base + 48_000, () => setMood({ hero: IDLE, mini: IDLE }));
      pulseBlink("hero", base + 48_000);
      pulseBlink("mini", base + 48_400);

      // 52s — settle (already idle after blinks)
      at(base + 52_000, () => setMood({ hero: IDLE, mini: IDLE }));

      // 60s — loop
      at(base + LOOP_MS, () => scheduleCycle(base + LOOP_MS));
    };

    scheduleCycle(0);

    return () => {
      cancelled = true;
      for (const id of timers) {
        window.clearTimeout(id);
      }
    };
  }, [enabled]);

  return mood;
}

/**
 * Hero + mini cluster — staggered bob + shared 60s relationship loop.
 */
export function FloorGhostDuo({ className }: { className?: string }) {
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );
  const live = useDuoTimeline(!reduceMotion);
  const hero = reduceMotion ? IDLE : live.hero;
  const mini = reduceMotion ? IDLE : live.mini;

  return (
    <div
      className={cn("floor-ghost-duo relative", className)}
      aria-hidden="true"
    >
      <FloorGhost
        size="hero"
        driven
        look={hero.look}
        blinking={hero.blinking}
        wobbling={hero.wobbling}
        giggling={hero.giggling}
        hoverHi={hero.hoverHi}
        className="relative z-[1]"
      />
      <FloorGhost
        size="mini"
        driven
        look={mini.look}
        blinking={mini.blinking}
        wobbling={mini.wobbling}
        giggling={mini.giggling}
        hoverHi={mini.hoverHi}
        className="absolute bottom-1 left-0 z-[2]"
      />
    </div>
  );
}
