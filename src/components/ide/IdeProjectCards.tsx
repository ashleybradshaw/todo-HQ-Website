import Link from "next/link";
import { homePage } from "@/content/pages/home";

/**
 * Soft product chips — accent washes fade into the canvas so Spray remaps
 * the pair without fighting solid brand fills. Names/blurbs from homePage.
 */
const PROJECT_META = [
  {
    name: "RepDaily",
    logoSrc: "/logos/repdaily.svg",
    accent: "var(--foreground)",
  },
  {
    name: "ReadyGo",
    logoSrc: "/logos/readygo.svg",
    accent: "var(--blog-cat-agents)",
  },
  {
    name: "Contentic",
    logoSrc: "/logos/contentic.svg",
    accent: "var(--syn-string)",
  },
] as const;

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

export function IdeProjectCards() {
  const { projectCards } = homePage;
  const projects = PROJECT_META.map((meta, index) => ({
    ...meta,
    ...projectCards.items[index],
  }));

  return (
    <section
      className="shrink-0 border-t border-border-ide"
      aria-label={projectCards.sectionAria}
    >
      <div className="border-b border-border-ide px-3 py-2">
        <p className="font-jetbrains text-foreground text-xs">
          {projectCards.header}
        </p>
      </div>
      <ul className="flex flex-col gap-2 p-3">
        {projects.map((project) => (
          <li
            key={project.name}
            className="rounded-[4px] border border-solid px-3 py-2 transition-[background,border-color,opacity] duration-[400ms] ease-in-out hover:opacity-90"
            style={{
              borderColor: `color-mix(in srgb, ${project.accent} 34%, transparent)`,
              backgroundImage: `linear-gradient(105deg, color-mix(in srgb, ${project.accent} 16%, transparent) 0%, color-mix(in srgb, ${project.accent} 5%, transparent) 55%, transparent 100%)`,
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <ProjectLogo src={project.logoSrc} />
                <div className="min-w-0">
                  <p className="font-jetbrains text-syn-keyword text-xs font-medium">
                    {project.name}
                  </p>
                  <p className="font-jetbrains text-syn-comment mt-0.5 text-[10px] leading-4 lg:text-xs">
                    {project.blurb}
                  </p>
                </div>
              </div>
              <Link
                href="/work"
                className="font-jetbrains text-syn-property shrink-0 text-[10px] underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)] lg:text-xs"
              >
                {projectCards.viewLink}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
