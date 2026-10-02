"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { DecodeLabel } from "@/components/DecodeLabel";
import { PlaceholderStill } from "@/components/work/PlaceholderStill";
import type { FullProject } from "@/lib/projects";

const SIZES = "(min-width:1384px) 1334px, calc(100vw - 50px)";

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
}: {
  project: FullProject;
  label: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [peek, setPeek] = useState(false);
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );
  const shown = reduceMotion || peek;

  useEffect(() => {
    const root = ref.current;
    if (!root || reduceMotion) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setPeek(true);
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
      className="group/next border-border-ide focus-visible:ring-current mt-4 block overflow-hidden rounded-[4px] border focus-visible:ring-[3px] focus-visible:outline-none"
    >
      <p className="type-label px-4 pt-4">{label}</p>
      <h2 className="type-heading text-foreground px-4 pt-2 tracking-tight">
        <DecodeLabel
          text={project.name}
          playKey={1}
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
