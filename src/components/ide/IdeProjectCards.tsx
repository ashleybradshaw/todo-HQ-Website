import Link from "next/link";

const PROJECTS = [
  {
    name: "Repdaily",
    blurb: "Camera-based fitness tracking — in production.",
    logoSrc: "/logos/repdaily.svg",
  },
  {
    name: "ReadyGo",
    blurb: "Pre-activity planning for runners and cyclists.",
    logoSrc: "/logos/readygo.svg",
  },
  {
    name: "Contentic",
    blurb: "CMS ops and content pipelines at factory speed.",
    logoSrc: "/logos/contentic.svg",
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
  return (
    <section
      className="shrink-0 border-t border-border-ide"
      aria-label="Active project roster"
    >
      <div className="border-b border-border-ide px-3 py-2">
        <p className="font-jetbrains text-foreground text-xs">
          SYS // PROJECTS
        </p>
      </div>
      <ul className="flex flex-col gap-2 p-3">
        {PROJECTS.map((project) => (
          <li
            key={project.name}
            className="border border-border-ide rounded-[4px] px-3 py-2 transition-opacity hover:opacity-80"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2.5">
                <ProjectLogo src={project.logoSrc} />
                <div className="min-w-0">
                  <p className="font-jetbrains text-syn-keyword text-xs">
                    {project.name}
                  </p>
                  <p className="font-jetbrains text-syn-comment mt-0.5 text-[10px] leading-4 lg:text-xs">
                    {project.blurb}
                  </p>
                </div>
              </div>
              <Link
                href="/work"
                className="font-jetbrains text-syn-property shrink-0 self-center text-[10px] underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)] lg:text-xs"
              >
                View
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
