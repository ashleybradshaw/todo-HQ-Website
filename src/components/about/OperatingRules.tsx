"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AsciiReveal } from "@/components/about/AsciiReveal";
import { MirageSpinner } from "@/components/ide/MirageSpinner";
import { aboutPage } from "@/content/pages/about";
import { cn } from "@/lib/cn";

const { operatingRules } = aboutPage;
/** Gutter spinner — default Mirage is 56px. */
const MARKER_SIZE_PX = 24;

export function OperatingRules() {
  const [scrollIndex, setScrollIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [markerY, setMarkerY] = useState(0);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const markerRef = useRef<HTMLSpanElement | null>(null);

  const activeIndex = hoverIndex ?? scrollIndex;

  useEffect(() => {
    const items = itemRefs.current.filter(
      (el): el is HTMLLIElement => el !== null,
    );
    if (items.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) {
          return;
        }

        visible.sort((a, b) => {
          const ratioDiff = b.intersectionRatio - a.intersectionRatio;
          if (ratioDiff !== 0) {
            return ratioDiff;
          }
          return (
            items.indexOf(a.target as HTMLLIElement) -
            items.indexOf(b.target as HTMLLIElement)
          );
        });

        const next = items.indexOf(visible[0].target as HTMLLIElement);
        if (next >= 0) {
          setScrollIndex(next);
        }
      },
      {
        root: null,
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      },
    );

    for (const item of items) {
      observer.observe(item);
    }

    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const measure = () => {
      const item = itemRefs.current[activeIndex];
      const marker = markerRef.current;
      if (!item || !marker) {
        return;
      }

      const offset =
        item.offsetTop + item.offsetHeight / 2 - marker.offsetHeight / 2;
      setMarkerY(offset);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeIndex]);

  return (
    <section className="mt-16 border-t border-border-ide pt-10">
      <p className="type-label">{operatingRules.eyebrow}</p>
      <h2 className="type-heading mt-3">{operatingRules.title}</h2>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
        <div className="order-2 lg:order-1 lg:sticky lg:top-28">
          <AsciiReveal
            src={operatingRules.mediaSrc}
            alt={operatingRules.mediaAlt}
          >
            <p className="type-label absolute right-3 bottom-3 left-3 text-foreground/55">
              {operatingRules.mediaLabel}
            </p>
          </AsciiReveal>
        </div>

        <div className="order-1 lg:order-2">
          <ul
            className="relative pl-10"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <span
              ref={markerRef}
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 transition-transform duration-[400ms] ease-out motion-reduce:transition-none"
              style={{ transform: `translateY(${markerY}px)` }}
            >
              <MirageSpinner
                style={{ ["--mirage-size" as string]: `${MARKER_SIZE_PX}px` }}
              />
            </span>
            {operatingRules.rules.map((rule, index) => {
              const active = index === activeIndex;
              return (
                <li
                  key={rule}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  onMouseEnter={() => setHoverIndex(index)}
                  className={cn(
                    "border-t border-border-ide py-5 first:border-t-0 first:pt-0",
                    "transition-opacity duration-200 motion-reduce:transition-none",
                    active ? "opacity-100" : "opacity-40",
                  )}
                >
                  <p
                    className={cn(
                      "type-body",
                      active ? "font-medium" : "font-normal",
                    )}
                  >
                    {rule}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
