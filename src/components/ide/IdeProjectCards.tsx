import type { CSSProperties } from "react";
import Link from "next/link";
import { DecodeLabel } from "@/components/DecodeLabel";
import { homePage } from "@/content/pages/home";
import { getProject, projectHasPage } from "@/lib/projects";

/**
 * Full-bleed project rows — accent washes span the sidecar so Spray remaps
 * the pair without inset card chrome.
 */
const PROJECT_META = [
  { slug: "repdaily", logoSrc: "/logos/repdaily.svg" },
  { slug: "readygo", logoSrc: "/logos/readygo.svg" },
  { slug: "contentic", logoSrc: "/logos/contentic.svg" },
] as const;

function accentFor(slug: string) {
  const project = getProject(slug);
  if (!project || !projectHasPage(project)) return "var(--foreground)";
  return project.accent;
}

function ProjectLogo({ src }: { src: string }) {
  return (
    <span
      className="bg-foreground size-5 shrink-0 lg:size-6"
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
      aria-hidden="true"
    />
  );
}

type IdeProjectCardsProps = {
  labelPlayKey?: number;
};

export function IdeProjectCards({ labelPlayKey = 0 }: IdeProjectCardsProps) {
  const { projectCards } = homePage;
  const projects = PROJECT_META.map((meta, index) => ({
    ...meta,
    ...projectCards.items[index],
    slug: projectCards.items[index]?.slug ?? meta.slug,
  }));

  return (
    <section
      className="shrink-0 border-t border-border-ide"
      aria-label={projectCards.sectionAria}
    >
      <div className="border-b border-border-ide px-3 py-1.5">
        <p className="font-jetbrains text-muted text-[10px] tracking-wide lg:text-[11px]">
          <DecodeLabel
            text={projectCards.header}
            playKey={labelPlayKey}
            settleColor="var(--text-muted)"
          />
        </p>
      </div>
      <ul className="border-b border-border-ide flex flex-col">
        {projects.map((project, index) => {
          const accent = accentFor(project.slug);
          return (
            <li
              key={project.slug}
              className={index > 0 ? "border-t border-border-ide" : undefined}
              style={
                {
                  backgroundImage: `linear-gradient(105deg, color-mix(in srgb, ${accent} 10%, transparent) 0%, color-mix(in srgb, ${accent} 3%, transparent) 55%, transparent 100%)`,
                } as CSSProperties
              }
            >
              <Link
                href={`/work/${project.slug}`}
                aria-label={projectCards.viewLink}
                className="group/row relative flex items-center justify-between gap-3 px-3 py-3 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[400ms] ease-in-out group-hover/row:opacity-100"
                  style={{
                    backgroundImage: `linear-gradient(105deg, color-mix(in srgb, ${accent} 18%, transparent) 0%, color-mix(in srgb, ${accent} 8%, transparent) 55%, transparent 100%)`,
                  }}
                />
                <div className="relative flex min-w-0 items-center gap-2">
                  <ProjectLogo src={project.logoSrc} />
                  <div className="min-w-0">
                    <p className="font-jetbrains text-syn-keyword text-sm font-bold">
                      {project.name}
                    </p>
                    <p className="font-jetbrains text-syn-comment mt-0.5 text-[10px] leading-4">
                      {project.blurb}
                    </p>
                  </div>
                </div>
                {/*
                  View box mirrors MenuButton hover: rounded-[4px] + bg-foreground/5.
                  Transparent border/bg + px-2 reserved at rest so nothing shifts.
                  Focus ring stays on the row link; this span is decoration only.
                */}
                <span
                  aria-hidden="true"
                  className="font-jetbrains text-syn-property relative shrink-0 rounded-[4px] border border-transparent bg-transparent px-2 py-1 text-[10px] transition-[background-color,border-color,color] duration-[400ms] ease-in-out group-hover/row:bg-foreground/5 group-focus-visible/row:bg-foreground/5"
                >
                  {projectCards.viewLink}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
