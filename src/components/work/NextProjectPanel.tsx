"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { DecodeLabel } from "@/components/DecodeLabel";
import { PlaceholderStill } from "@/components/work/PlaceholderStill";
import type { FullProject } from "@/lib/projects";

const SIZES = "(min-width: 800px) 752px, calc(100vw - 48px)";

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function NextProjectPanel({
  project,
  label,
  prefetch,
}: {
  project: FullProject;
  label: string;
  /** Specimen panels point at a page that does not exist. */
  prefetch?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [peek, setPeek] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );
  const shown = reduceMotion || peek;

  function replay() {
    if (reduceMotion) return;
    setPlayKey((key) => key + 1);
  }

  useEffect(() => {
    const root = ref.current;
    if (!root || reduceMotion) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setPeek(true);
        setPlayKey((key) => key + 1);
        observer.disconnect();
      },
      { threshold: 0.25 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [reduceMotion]);

  const placeholder = project.imageSrc.startsWith("/work/placeholders/");

  return (
    <Link
      ref={ref}
      href={`/work/${project.slug}`}
      prefetch={prefetch}
      className="group/next border-border-ide focus-visible:ring-current mt-4 block overflow-hidden rounded-[4px] border focus-visible:ring-[3px] focus-visible:outline-none"
      onMouseEnter={replay}
      onFocus={replay}
    >
      <p className="type-label px-4 pt-4">{label}</p>
      <h2
        data-decode-play={playKey}
        className="type-heading text-foreground px-4 pt-2 tracking-tight"
      >
        <DecodeLabel
          text={project.name}
          playKey={playKey}
          settleColor="var(--foreground)"
        />
      </h2>
      <div className="mt-4 overflow-hidden">
        <div
          data-ratio="16:9"
          className={`aspect-video origin-bottom transition-transform duration-[400ms] ease-in-out motion-reduce:transform-none motion-reduce:transition-none ${
            shown ? "translate-y-0" : "translate-y-8"
          }`}
        >
          {placeholder ? (
            <div role="img" aria-label={project.imageAlt} className="h-full">
              <PlaceholderStill ratio="16:9" fit="slice" />
            </div>
          ) : (
            <Image
              src={project.imageSrc}
              alt={project.imageAlt}
              width={project.imageWidth}
              height={project.imageHeight}
              sizes={SIZES}
              className="h-full w-full object-cover"
            />
          )}
        </div>
      </div>
    </Link>
  );
}
