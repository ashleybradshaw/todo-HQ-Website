"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { StackIcon, STACK_BY_ID } from "@/components/ide/StackIconRow";
import { ProjectCardSkeleton } from "@/components/ProjectCardSkeleton";
import { CountUp } from "@/components/work/CountUp";
import { PlaceholderStill } from "@/components/work/PlaceholderStill";
import { ProjectStatusChip } from "@/components/work/ProjectStatusChip";
import { cn } from "@/lib/cn";
import type { FullProject } from "@/lib/projects";

const CARD_IMAGE_SIZES =
  "(min-width:1024px) min(523px, calc(50vw - 169px)), (min-width:640px) calc(100vw - 210px), calc(100vw - 130px)";

const WIDE_IMAGE_SIZES =
  "(min-width:1024px) min(587px, calc((100vw - 210px) / 2)), (min-width:640px) calc(100vw - 210px), calc(100vw - 130px)";

function StatusStrip({ project }: { project: FullProject }) {
  const platforms = project.spec.platforms
    .map((platform) => platform.toLowerCase())
    .join(" / ");

  return (
    <p className="work-status-strip font-jetbrains text-foreground flex items-center gap-1.5 text-[10px] tracking-wide">
      <span
        aria-hidden="true"
        className="status-dot-pulse bg-foreground inline-block size-1.5 shrink-0 rounded-full"
      />
      <span>
        {project.release} · {platforms}
      </span>
    </p>
  );
}

export function ProjectCard({
  project,
  priority = false,
  wide = false,
  prefetch,
}: {
  project: FullProject;
  priority?: boolean;
  wide?: boolean;
  /** Specimen cards point at a page that does not exist. */
  prefetch?: boolean;
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
      className="group relative isolate flex h-full flex-col rounded-[4px] transition-[background-color,color,border-color] duration-[400ms] ease-in-out"
      style={{
        backgroundColor: `color-mix(in srgb, ${project.accent} 6%, var(--background))`,
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
      <div
        className={cn(
          "relative z-0 flex h-full w-full flex-col items-start gap-2.5 px-6 pt-7 pb-12 text-on-tint sm:px-14",
          wide && "lg:flex-row lg:items-stretch lg:gap-8",
        )}
      >
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-[4px]",
            wide && "lg:w-1/2",
          )}
        >
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
                sizes={wide ? WIDE_IMAGE_SIZES : CARD_IMAGE_SIZES}
                priority={priority}
                fetchPriority={priority ? "high" : "auto"}
                className="h-full w-full object-cover"
                onLoad={() => setLoaded(true)}
                onError={() => setLoaded(true)}
              />
            )}
          </div>
          <StatusStrip project={project} />
        </div>
        <div
          className={cn(
            "flex w-full flex-1 flex-col items-start gap-2.5",
            wide && "lg:w-1/2 lg:justify-center",
          )}
        >
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
            prefetch={prefetch}
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
      </div>
    </article>
  );
}
