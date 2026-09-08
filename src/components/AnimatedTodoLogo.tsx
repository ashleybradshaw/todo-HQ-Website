"use client";

import { useRef, type PointerEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/cn";

gsap.registerPlugin(useGSAP);

const SLASH_IDS = ["slash-1", "slash-2"] as const;
const LETTER_IDS = ["letter-t", "letter-o1", "letter-d", "letter-o2"] as const;
const GLYPH_IDS = [...SLASH_IDS, ...LETTER_IDS] as const;
const EYE_IDS = ["letter-o1", "letter-o2"] as const;

export const ANIMATED_TODO_LOGO_INTRO_MS = 2400;

type Glyph = {
  id: "slash-1" | "slash-2" | "letter-t" | "letter-o1" | "letter-d" | "letter-o2";
  d: string;
};

const GLYPHS: Glyph[] = [
  { id: "slash-1", d: "M10.943 0h9.223L9.223 34.845H0z" },
  { id: "slash-2", d: "M24.855 0h9.223L23.135 34.845h-9.223z" },
  {
    id: "letter-t",
    d: "M39 9.106V0h27.716v9.106h-9.332v25.786h-9.239V9.106z",
  },
  {
    id: "letter-o1",
    d: "M71 17.469C71 7.852 78.832 0 88.54 0s17.586 7.852 17.586 17.469-7.879 17.376-17.586 17.376C78.832 34.845 71 27.086 71 17.47m25.934-.046c0-4.6-3.751-8.317-8.394-8.317-4.596 0-8.348 3.717-8.348 8.317 0 4.553 3.752 8.316 8.348 8.316 4.643 0 8.394-3.763 8.394-8.316",
  },
  {
    id: "letter-d",
    d: "M110.682 34.845V0h13.037c9.708 0 17.587 7.805 17.587 17.423s-7.879 17.422-17.587 17.422zm9.192-25.506v16.493h3.892c4.596 0 8.348-3.717 8.348-8.27 0-4.507-3.752-8.224-8.348-8.224z",
  },
  {
    id: "letter-o2",
    d: "M146 17.469C146 7.852 153.832 0 163.54 0s17.587 7.852 17.587 17.469-7.879 17.376-17.587 17.376S146 27.086 146 17.47m25.935-.046c0-4.6-3.752-8.317-8.395-8.317-4.596 0-8.348 3.717-8.348 8.317 0 4.553 3.752 8.316 8.348 8.316 4.643 0 8.395-3.763 8.395-8.316",
  },
];

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

type AnimatedTodoLogoProps = {
  className?: string;
};

export function AnimatedTodoLogo({ className }: AnimatedTodoLogoProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const introDone = useRef(false);
  const pressed = useRef(false);

  const { contextSafe } = useGSAP(
    () => {
      const svg = svgRef.current;

      if (!svg) {
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

      gsap.set(svg, { transformOrigin: "50% 50%" });
      gsap.set(glyphs, { transformOrigin: "50% 50%" });

      if (reduceMotion) {
        gsap.set(strokes, { autoAlpha: 0 });
        gsap.set(fills, { autoAlpha: 1 });
        gsap.set(glyphs, { y: 0, rotation: 0, scaleX: 1, scaleY: 1 });
        introDone.current = true;
        return;
      }

      introDone.current = false;

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
    },
    { scope: svgRef },
  );

  const startPress = contextSafe(() => {
    const svg = svgRef.current;

    if (!svg || !introDone.current || pressed.current) {
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
    const svg = svgRef.current;

    if (!svg || !pressed.current) {
      return;
    }

    pressed.current = false;
    const eyes = queryGroups(svg, EYE_IDS);

    gsap.to(svg, {
      scale: 1,
      duration: 0.5,
      ease: "elastic.out(1, 0.4)",
      overwrite: "auto",
    });
    playEyeWiggle(eyes, true);
  });

  const onPointerEnter = contextSafe((event: PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;

    if (
      event.pointerType !== "mouse" ||
      !svg ||
      !introDone.current ||
      pressed.current
    ) {
      return;
    }

    const glyphs = queryGroups(svg, GLYPH_IDS);
    gsap.to(glyphs, {
      y: -4,
      duration: 0.32,
      ease: "back.out(2)",
      stagger: 0.04,
      overwrite: "auto",
    });
  });

  const onPointerLeave = contextSafe((event: PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;

    if (event.pointerType !== "mouse" || !svg) {
      return;
    }

    if (pressed.current) {
      endPress();
      return;
    }

    const glyphs = queryGroups(svg, GLYPH_IDS);
    gsap.to(glyphs, {
      y: 0,
      duration: 0.4,
      ease: "elastic.out(1, 0.4)",
      stagger: 0.03,
      overwrite: "auto",
    });
  });

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 182 35"
      overflow="visible"
      className={cn("h-[1em] w-auto cursor-pointer text-[#0000D6]", className)}
      aria-hidden="true"
      focusable="false"
      style={{ touchAction: "manipulation" }}
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerCancel={endPress}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {GLYPHS.map((glyph) => (
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
