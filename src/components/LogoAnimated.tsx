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

function queryGroup(svg: SVGSVGElement, id: string) {
  const el = svg.querySelector(`#${id}`);
  return el instanceof SVGGElement ? el : null;
}

function queryGroups(svg: SVGSVGElement, ids: readonly string[]) {
  return ids
    .map((id) => queryGroup(svg, id))
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

type LogoAnimatedProps = {
  className?: string;
};

export function LogoAnimated({ className }: LogoAnimatedProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const svg = svgRef.current;

      if (!svg || !contextSafe) {
        return;
      }

      const slashes = queryGroups(svg, SLASH_IDS);
      const letters = queryGroups(svg, LETTER_IDS);
      const glyphs = queryGroups(svg, GLYPH_IDS);
      const eyes = queryGroups(svg, EYE_IDS);
      const strokes = Array.from(
        svg.querySelectorAll<SVGPathElement>("[data-stroke]"),
      );
      const fills = Array.from(
        svg.querySelectorAll<SVGPathElement>("[data-fill]"),
      );
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const introDone = { current: false };
      const pressed = { current: false };

      gsap.set(svg, { transformOrigin: "50% 50%" });
      gsap.set(glyphs, { transformOrigin: "50% 50%" });

      if (reduceMotion) {
        gsap.set(strokes, { autoAlpha: 0 });
        gsap.set(fills, { autoAlpha: 1 });
        gsap.set(glyphs, { y: 0, rotation: 0, scaleX: 1, scaleY: 1 });
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

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          onComplete: () => {
            introDone.current = true;
          },
        });

        tl.to(
          strokes,
          {
            strokeDashoffset: 0,
            duration: 0.7,
            ease: "power2.inOut",
            stagger: 0.03,
          },
          0,
        );

        tl.to(
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

        tl.to(
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

        tl.to(fills, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0.55);
        tl.to(strokes, { autoAlpha: 0, duration: 0.3, ease: "power2.out" }, 0.72);
        tl.add(playEyeWiggle(eyes), ">-0.08");
      }

      const startPress = contextSafe(() => {
        if (!introDone.current || pressed.current) {
          return;
        }

        pressed.current = true;
        gsap.to(svg, {
          scale: 0.94,
          duration: 0.16,
          ease: "power2.out",
          overwrite: "auto",
        });
      });

      const endPress = contextSafe(() => {
        if (!pressed.current) {
          return;
        }

        pressed.current = false;
        gsap.to(svg, {
          scale: 1,
          duration: 0.5,
          ease: "elastic.out(1, 0.4)",
          overwrite: "auto",
        });
        playEyeWiggle(eyes, true);
      });

      const onPointerEnter = contextSafe((event: PointerEvent) => {
        if (event.pointerType !== "mouse" || !introDone.current || pressed.current) {
          return;
        }

        gsap.to(glyphs, {
          y: -4,
          duration: 0.32,
          ease: "back.out(2)",
          stagger: 0.04,
          overwrite: "auto",
        });
      });

      const onPointerLeave = contextSafe((event: PointerEvent) => {
        if (event.pointerType !== "mouse") {
          return;
        }

        if (pressed.current) {
          endPress();
          return;
        }

        gsap.to(glyphs, {
          y: 0,
          duration: 0.4,
          ease: "elastic.out(1, 0.4)",
          stagger: 0.03,
          overwrite: "auto",
        });
      });

      svg.addEventListener("pointerdown", startPress);
      svg.addEventListener("pointerup", endPress);
      svg.addEventListener("pointercancel", endPress);
      svg.addEventListener("pointerenter", onPointerEnter);
      svg.addEventListener("pointerleave", onPointerLeave);

      return () => {
        svg.removeEventListener("pointerdown", startPress);
        svg.removeEventListener("pointerup", endPress);
        svg.removeEventListener("pointercancel", endPress);
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
          id={glyph.id}
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
