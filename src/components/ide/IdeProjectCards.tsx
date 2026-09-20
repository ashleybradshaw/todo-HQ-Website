import Link from "next/link";

const PROJECTS = [
  {
    name: "Repdaily",
    blurb: "Camera-based fitness tracking — in production.",
  },
  {
    name: "ReadyGo",
    blurb: "Pre-activity planning for runners and cyclists.",
  },
  {
    name: "Contentic",
    blurb: "CMS ops and content pipelines at factory speed.",
  },
] as const;

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
            className="border border-border-ide rounded-[4px] px-3 py-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-jetbrains text-syn-keyword text-xs">
                  {project.name}
                </p>
                <p className="font-jetbrains text-syn-comment mt-0.5 text-[10px] leading-4 lg:text-xs">
                  {project.blurb}
                </p>
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
