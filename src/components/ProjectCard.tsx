"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProjectCardSkeleton } from "@/components/ProjectCardSkeleton";
import { PlaceholderStill } from "@/components/work/PlaceholderStill";
import { cn } from "@/lib/cn";
import type { Project } from "@/lib/projects";

export function ProjectCard({ project }: { project: Project }) {
  const placeholder = project.imageSrc.startsWith("/work/placeholders/");
  const [loaded, setLoaded] = useState(placeholder);
  const imageRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalHeight > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <article
      className="relative"
      aria-busy={!loaded}
      aria-label={project.name}
    >
      {!loaded ? (
        <div className="absolute inset-0 z-10">
          <ProjectCardSkeleton />
        </div>
      ) : null}
      <div
        className={cn(
          "flex flex-col items-start gap-2.5 rounded-[4px] bg-foreground/10 px-14 pt-7 pb-12 text-foreground transition-[background-color,color] duration-[400ms] ease-in-out",
          !loaded && "invisible",
        )}
      >
        <div className="aspect-[547/271] w-full shrink-0 overflow-hidden rounded-[4px]">
          {placeholder ? (
            <div
              role="img"
              aria-label={project.imageAlt}
              className="h-full w-full text-foreground"
            >
              <PlaceholderStill aspect="landscape" fit="slice" />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imageRef}
              src={project.imageSrc}
              alt={project.imageAlt}
              width={project.imageWidth}
              height={project.imageHeight}
              className="h-full w-full object-cover"
              onLoad={() => setLoaded(true)}
              onError={() => setLoaded(true)}
            />
          )}
        </div>
        <div className="flex w-full flex-col items-start">
          <h2 className="type-heading w-full tracking-tight">
            {project.name}
          </h2>
          <p className="type-body-sm w-full">{project.description}</p>
        </div>
        <Link
          href={`/work/${project.slug}`}
          className="type-label w-max cursor-pointer underline-offset-2 [text-decoration:underline_1px_wavy] [text-decoration-color:color-mix(in_srgb,var(--foreground)_55%,transparent)] [text-underline-position:from-font] transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]"
        >
          Open Project
        </Link>
      </div>
    </article>
  );
}
