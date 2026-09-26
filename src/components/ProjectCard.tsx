"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProjectCardSkeleton } from "@/components/ProjectCardSkeleton";
import { PlaceholderStill } from "@/components/work/PlaceholderStill";
import { ProjectStatusChip } from "@/components/work/ProjectStatusChip";
import { cn } from "@/lib/cn";
import type { Project } from "@/lib/projects";

export function ProjectCard({
  project,
  priority = false,
}: {
  project: Project;
  priority?: boolean;
}) {
  const placeholder = project.imageSrc.startsWith("/work/placeholders/");
  const [loaded, setLoaded] = useState(placeholder);
  const imageRef = useRef<HTMLImageElement>(null);
  const isPipeline = !project.hasPage;

  useLayoutEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalHeight > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <article
      className={cn(
        "relative isolate rounded-[4px] bg-foreground/10 transition-[background-color,color,border-color] duration-[400ms] ease-in-out",
        isPipeline
          ? "border border-dashed border-border-ide"
          : "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--foreground)]",
      )}
      aria-busy={!loaded}
      aria-label={project.name}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-10 rounded-[4px] transition-opacity duration-[400ms] ease-in-out",
          loaded ? "opacity-0" : "opacity-100",
        )}
        aria-hidden="true"
      >
        <ProjectCardSkeleton />
      </div>
      <div className="relative z-0 flex flex-col items-start gap-2.5 px-6 pt-7 pb-12 text-on-tint sm:px-14">
        <div className="aspect-[547/271] w-full shrink-0 overflow-hidden rounded-[4px]">
          {placeholder ? (
            <div
              role="img"
              aria-label={project.imageAlt}
              className="h-full w-full text-on-tint"
            >
              <PlaceholderStill aspect="landscape" fit="slice" />
            </div>
          ) : (
            <Image
              ref={imageRef}
              src={project.imageSrc}
              alt={project.imageAlt}
              width={project.imageWidth}
              height={project.imageHeight}
              sizes="(min-width:1024px) 50vw, 100vw"
              priority={priority}
              className="h-full w-full object-cover"
              onLoad={() => setLoaded(true)}
              onError={() => setLoaded(true)}
            />
          )}
        </div>
        <ProjectStatusChip status={project.status} />
        <div className="flex w-full flex-col items-start">
          <h2 className="type-heading w-full tracking-tight">{project.name}</h2>
          <p className="type-body-sm w-full">{project.description}</p>
        </div>
        {project.hasPage ? (
          <Link
            href={`/work/${project.slug}`}
            // Stretched link: ::before is clipped to this article (relative + isolate),
            // so neighbouring pipeline cards never receive the hit target.
            className="type-label w-max cursor-pointer underline-offset-2 before:absolute before:inset-0 before:z-[1] before:content-[''] [text-decoration:underline_1px_wavy] [text-decoration-color:color-mix(in_srgb,var(--foreground)_55%,transparent)] [text-underline-position:from-font] transition-opacity hover:opacity-80 focus-visible:outline-none"
          >
            <span className="relative z-[2]">Open {project.name}</span>
          </Link>
        ) : null}
      </div>
    </article>
  );
}
