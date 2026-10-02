"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { StackIcon, STACK_BY_ID } from "@/components/ide/StackIconRow";
import { ProjectCardSkeleton } from "@/components/ProjectCardSkeleton";
import { CountUp } from "@/components/work/CountUp";
import { PlaceholderStill } from "@/components/work/PlaceholderStill";
import { ProjectStatusChip } from "@/components/work/ProjectStatusChip";
import type { FullProject } from "@/lib/projects";

const CARD_IMAGE_SIZES =
  "(min-width:1024px) min(548px, calc(50vw - 144px)), (min-width:640px) calc(100vw - 160px), calc(100vw - 96px)";

export function ProjectCard({
  project,
  priority = false,
}: {
  project: FullProject;
  priority?: boolean;
}) {
  const placeholder = project.imageSrc.startsWith("/work/placeholders/");
  const [loaded, setLoaded] = useState(placeholder);
  const imageRef = useRef<HTMLImageElement>(null);
  const metric = project.metrics[0];

  useLayoutEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalHeight > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <article
      className="relative isolate flex h-full flex-col rounded-[4px] transition-[background-color,color,border-color] duration-[400ms] ease-in-out"
      style={{
        backgroundColor: `color-mix(in srgb, ${project.accent} 10%, var(--background))`,
      }}
      aria-busy={!loaded}
      aria-label={project.name}
    >
      <div
        className={`pointer-events-none absolute inset-0 z-10 rounded-[4px] transition-opacity duration-[400ms] ease-in-out ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden="true"
      >
        <ProjectCardSkeleton />
      </div>
      <div className="relative z-0 flex h-full w-full flex-col items-start gap-2.5 px-6 pt-7 pb-12 text-on-tint sm:px-14">
        <div
          data-ratio="16:9"
          className="aspect-video w-full shrink-0 overflow-hidden rounded-[4px]"
        >
          {placeholder ? (
            <div
              role="img"
              aria-label={project.imageAlt}
              className="h-full w-full text-on-tint"
            >
              <PlaceholderStill ratio="16:9" fit="slice" />
            </div>
          ) : (
            <Image
              ref={imageRef}
              src={project.imageSrc}
              alt={project.imageAlt}
              width={project.imageWidth}
              height={project.imageHeight}
              sizes={CARD_IMAGE_SIZES}
              priority={priority}
              className="h-full w-full object-cover"
              onLoad={() => setLoaded(true)}
              onError={() => setLoaded(true)}
            />
          )}
        </div>
        <ProjectStatusChip status={project.status} />
        <h2 className="type-heading w-full tracking-tight">{project.name}</h2>
        {metric ? (
          <p className="flex w-full flex-wrap items-baseline gap-x-2 gap-y-1">
            <CountUp
              variant="display"
              value={metric.value}
              prefix={metric.prefix}
              suffix={metric.suffix}
            />
            <span className="font-jetbrains text-syn-comment text-xs">
              {metric.label}
            </span>
          </p>
        ) : null}
        <p className="type-body-sm w-full">{project.cardDescription}</p>
        <ul
          className="flex w-full flex-wrap gap-x-3 gap-y-2"
          aria-label={`${project.name} stack`}
        >
          {project.stack.map((id) => {
            const item = STACK_BY_ID[id];
            return (
              <li
                key={id}
                className="font-jetbrains text-syn-property flex items-center gap-1.5 text-[10px]"
              >
                <StackIcon id={id} label={item.label} />
                <span>{item.label}</span>
              </li>
            );
          })}
        </ul>
        <Link
          href={`/work/${project.slug}`}
          aria-label={`open ./${project.slug}, ${project.name} case study`}
          className="group/cta font-jetbrains mt-auto inline-flex min-h-6 w-max cursor-pointer items-center gap-1.5 rounded-[4px] border border-current px-2.5 py-1 text-xs tracking-wide before:absolute before:inset-0 before:z-[1] before:content-[''] focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none"
        >
          <span className="relative z-[2]">open ./{project.slug}</span>
          <span
            aria-hidden="true"
            className="relative z-[2] inline-block transition-transform duration-[400ms] ease-in-out group-hover/cta:translate-x-1 group-focus-visible/cta:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
          >
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
