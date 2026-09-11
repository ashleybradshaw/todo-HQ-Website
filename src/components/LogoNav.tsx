"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/cn";
import { LOGO_PATHS, LOGO_VIEWBOX } from "@/components/LogoStatic";

gsap.registerPlugin(useGSAP);

const SLASH_IDS = ["slash-1", "slash-2"] as const;
const LETTER_IDS = ["letter-t", "letter-o1", "letter-d", "letter-o2"] as const;
const GLYPH_IDS = [...SLASH_IDS, ...LETTER_IDS] as const;
const EYE_IDS = ["letter-o1", "letter-o2"] as const;

function queryGlyph(svg: SVGSVGElement, id: string) {
  const el = svg.querySelector(`[data-glyph="${id}"]`);
  return el instanceof SVGGElement ? el : null;
}

function queryGlyphs(svg: SVGSVGElement, ids: readonly string[]) {
  return ids
    .map((id) => queryGlyph(svg, id))
    .filter((el): el is SVGGElement => el !== null);
}

function playEyeWiggle(eyes: SVGGElement[], killActive = false) {
  if (killActive) {
    gsap.killTweensOf(eyes);
  }
  return gsap
    .timeline({ defaults: { transformOrigin: "50% 50%" } })
    .to(eyes, {
      scaleX: 1.15,
      scaleY: 0.85,
      duration: 0.12,
      ease: "power2.out",
    })
    .to(eyes, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.5,
      ease: "elastic.out(1, 0.4)",
    })
    .to(eyes, {
      rotation: 3,
      duration: 0.08,
      ease: "sine.inOut",
      stagger: 0.04,
    })
    .to(eyes, {
      rotation: -3,
      duration: 0.12,
      ease: "sine.inOut",
      stagger: 0.03,
    })
    .to(eyes, {
      rotation: 3,
      duration: 0.1,
      ease: "sine.inOut",
    })
    .to(eyes, {
      rotation: 0,
      duration: 0.28,
      ease: "back.out(2)",
    });
}

function foldX(letter: SVGGElement, slashes: SVGGElement[]) {
  const target = slashes[1] ?? slashes[0];
  if (!target) {
    return 0;
  }

  const from = letter.getBBox();
  const into = target.getBBox();
  return into.x + into.width / 2 - (from.x + from.width / 2);
}

const IDLE_MIN_MS = 15_000;
const IDLE_MAX_MS = 120_000;
const IDLE_STYLES = ["slide", "soft", "cascade"] as const;

type IdleStyle = (typeof IDLE_STYLES)[number];

function pickIdleStyle(previous: IdleStyle | null): IdleStyle {
  const pool = previous
    ? IDLE_STYLES.filter((style) => style !== previous)
    : [...IDLE_STYLES];

  return gsap.utils.random(pool);
}

type LogoNavProps = {
  className?: string;
};

export function LogoNav({ className }: LogoNavProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const svg = svgRef.current;

      if (!svg || !contextSafe) {
        return;
      }

      const slashes = queryGlyphs(svg, SLASH_IDS);
      const letters = queryGlyphs(svg, LETTER_IDS);
      const glyphs = queryGlyphs(svg, GLYPH_IDS);
      const eyes = queryGlyphs(svg, EYE_IDS);
      const strokes = Array.from(
        svg.querySelectorAll<SVGPathElement>("[data-stroke]"),
      );
      const fills = Array.from(
        svg.querySelectorAll<SVGPathElement>("[data-fill]"),
      );
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const hovering = { current: false };
      const collapsed = { current: false };
      const introDone = { current: false };
      const lastIdleStyle = { current: null as IdleStyle | null };
      let action: gsap.core.Timeline | null = null;
      let idleTimer = 0;

      gsap.set(svg, { transformOrigin: "0% 50%" });
      gsap.set(glyphs, { transformOrigin: "50% 50%" });

      const stopIdle = () => {
        window.clearTimeout(idleTimer);
      };

      const playAction = (build: (timeline: gsap.core.Timeline) => void) => {
        action?.kill();
        const timeline = gsap.timeline({
          onComplete: () => {
            if (action === timeline) {
              action = null;
            }
          },
        });
        action = timeline;
        build(timeline);
        return timeline;
      };

      const collapse = (delay = 0, style: IdleStyle = "slide") => {
        if (hovering.current || letters.length === 0) {
          return;
        }

        collapsed.current = true;
        playAction((timeline) => {
          if (style === "soft") {
            timeline.to(
              letters,
              {
                x: 0,
                y: 0,
                scale: 0.92,
                rotation: 0,
                autoAlpha: 0,
                duration: 0.4,
                stagger: 0.03,
                ease: "power2.inOut",
                overwrite: "auto",
              },
              delay,
            );
            return;
          }

          if (style === "cascade") {
            timeline.to(
              letters,
              {
                x: (_, el) => foldX(el as SVGGElement, slashes) * 0.35,
                y: 10,
                scale: 0.2,
                rotation: 6,
                autoAlpha: 0,
                duration: 0.7,
                stagger: { each: 0.08, from: "end" },
                ease: "power2.in",
                overwrite: "auto",
              },
              delay,
            );
            return;
          }

          timeline.to(
            letters,
            {
              x: (_, el) => foldX(el as SVGGElement, slashes),
              y: 2,
              scale: 0.12,
              rotation: 16,
              autoAlpha: 0,
              duration: 0.55,
              stagger: 0.045,
              ease: "power2.in",
              overwrite: "auto",
            },
            delay,
          );
        });
      };

      const expand = (thenCollapse: boolean, style: IdleStyle = "slide") => {
        collapsed.current = false;
        const hold =
          style === "cascade" ? 1.15 : style === "soft" ? 0.28 : 0.45;

        playAction((timeline) => {
          if (style === "soft") {
            timeline.fromTo(
              letters,
              { x: 0, y: 0, scale: 0.92, rotation: 0, autoAlpha: 0 },
              {
                x: 0,
                y: 0,
                scale: 1,
                rotation: 0,
                autoAlpha: 1,
                duration: 0.42,
                stagger: 0.035,
                ease: "power2.out",
                overwrite: "auto",
              },
            );
          } else if (style === "cascade") {
            timeline.fromTo(
              letters,
              { x: 0, y: -8, scale: 0.96, rotation: 0, autoAlpha: 0 },
              {
                x: 0,
                y: 0,
                scale: 1,
                rotation: 0,
                autoAlpha: 1,
                duration: 0.62,
                stagger: { each: 0.07, from: "end" },
                ease: "power2.out",
                overwrite: "auto",
              },
            );
            timeline.add(playEyeWiggle(eyes), ">-0.2");
          } else {
            timeline.to(letters, {
              x: 0,
              y: 0,
              scale: 1,
              rotation: 0,
              autoAlpha: 1,
              duration: 0.55,
              stagger: 0.055,
              ease: "back.out(1.4)",
              overwrite: "auto",
            });
            timeline.add(playEyeWiggle(eyes), ">-0.12");
          }

          if (thenCollapse) {
            timeline.add(() => {
              if (!hovering.current) {
                collapse(0, style);
              }
            }, `+=${hold}`);
          }
        });
      };

      const scheduleIdle = () => {
        stopIdle();
        if (reduceMotion || !introDone.current) {
          return;
        }

        idleTimer = window.setTimeout(() => {
          if (document.hidden || hovering.current || action) {
            scheduleIdle();
            return;
          }

          if (collapsed.current) {
            const style = pickIdleStyle(lastIdleStyle.current);
            lastIdleStyle.current = style;
            expand(true, style);
          } else if (!hovering.current) {
            collapse(0, lastIdleStyle.current ?? "slide");
          }

          scheduleIdle();
        }, gsap.utils.random(IDLE_MIN_MS, IDLE_MAX_MS));
      };

      if (reduceMotion) {
        gsap.set(strokes, { autoAlpha: 0 });
        gsap.set(fills, { autoAlpha: 1 });
        gsap.set(glyphs, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          autoAlpha: 1,
        });
        introDone.current = true;
      } else {
        strokes.forEach((path) => {
          const length = path.getTotalLength();
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
            autoAlpha: 1,
          });
        });

        gsap.set(fills, { autoAlpha: 0 });
        gsap.set(glyphs, {
          y: 40,
          rotation: () => gsap.utils.random(-6, 6),
        });

        const intro = gsap.timeline({
          defaults: { ease: "power2.out" },
          onComplete: () => {
            introDone.current = true;
            collapse(0);
            scheduleIdle();
          },
        });

        intro.to(
          strokes,
          {
            strokeDashoffset: 0,
            duration: 0.7,
            ease: "power2.inOut",
            stagger: 0.03,
          },
          0,
        );

        intro.to(
          slashes,
          {
            y: 0,
            rotation: 0,
            duration: 0.42,
            ease: "back.out(2)",
            stagger: 0.05,
          },
          0.08,
        );

        intro.to(
          letters,
          {
            y: 0,
            rotation: 0,
            duration: 0.9,
            ease: "elastic.out(1, 0.4)",
            stagger: 0.08,
          },
          0.26,
        );

        intro.to(fills, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0.55);
        intro.to(strokes, { autoAlpha: 0, duration: 0.3, ease: "power2.out" }, 0.72);
        intro.add(playEyeWiggle(eyes), ">-0.08");
        intro.to({}, { duration: 0.9 });
      }

      const onPointerEnter = contextSafe((event: PointerEvent) => {
        if (event.pointerType !== "mouse" || !introDone.current) {
          return;
        }

        hovering.current = true;
        if (collapsed.current) {
          expand(false);
        }
      });

      const onPointerLeave = contextSafe((event: PointerEvent) => {
        if (event.pointerType !== "mouse") {
          return;
        }

        hovering.current = false;
        if (introDone.current && !reduceMotion) {
          collapse(0.12);
        }
      });

      svg.addEventListener("pointerenter", onPointerEnter);
      svg.addEventListener("pointerleave", onPointerLeave);

      return () => {
        stopIdle();
        svg.removeEventListener("pointerenter", onPointerEnter);
        svg.removeEventListener("pointerleave", onPointerLeave);
      };
    },
    { scope: svgRef },
  );

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox={LOGO_VIEWBOX}
      overflow="visible"
      className={cn("h-[1em] w-auto cursor-pointer", className)}
      aria-hidden="true"
      focusable="false"
      style={{ touchAction: "manipulation" }}
    >
      {LOGO_PATHS.map((glyph) => (
        <g
          key={glyph.id}
          data-glyph={glyph.id}
          style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        >
          <path
            data-stroke=""
            d={glyph.d}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinejoin="miter"
            strokeLinecap="butt"
          />
          <path data-fill="" d={glyph.d} fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}
