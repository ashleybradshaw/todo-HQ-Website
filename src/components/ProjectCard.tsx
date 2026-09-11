"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ProjectCardSkeleton } from "@/components/ProjectCardSkeleton";
import { cn } from "@/lib/cn";

export type Project = {
  name: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
};

export function ProjectCard({ project }: { project: Project }) {
  const [loaded, setLoaded] = useState(false);
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
        </div>
        <div className="flex w-full flex-col items-start">
          <h2 className="font-jetbrains w-full text-[28px] leading-9 font-bold tracking-[-0.01em] uppercase">
            {project.name}
          </h2>
          <p className="font-jetbrains w-full text-sm leading-6 tracking-[-0.01em]">
            {project.description}
          </p>
        </div>
        <span className="font-unbounded w-max text-base leading-6 font-bold tracking-[-0.01em] uppercase [text-decoration:underline_1px_wavy] [text-underline-position:from-font]">
          Open Project
        </span>
      </div>
    </article>
  );
}
