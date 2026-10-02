import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectStatusChip } from "@/components/work/ProjectStatusChip";
import { SiteCloser } from "@/components/SiteCloser";
import { workPage } from "@/content/pages/work";
import { getListedProjects, projectHasPage } from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: workPage.seo.title,
  description: workPage.seo.description,
  path: "/work",
});

export default function WorkPage() {
  const listed = getListedProjects();
  const cards = listed.filter(projectHasPage);
  const queued = listed.filter((project) => !project.hasPage);

  return (
    <PageShell
      variant="index"
      eyebrow={workPage.eyebrow}
      title={workPage.title}
      lede={<p className="type-body-sm max-w-[592px]">{workPage.lede}</p>}
    >
      <ul className="mt-10 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        {cards.map((project, index) => (
          <li key={project.slug} className="h-full">
            <ProjectCard project={project} priority={index === 0} />
          </li>
        ))}
      </ul>

      <section className="mt-14" aria-labelledby="work-queued-heading">
        <h2 id="work-queued-heading" className="type-label">
          {workPage.queuedLabel}
        </h2>
        <ul className="border-border-ide mt-4 border-y">
          {queued.map((project) => (
            <li
              key={project.slug}
              className="border-border-ide flex flex-col items-start gap-2 border-b py-4 last:border-b-0"
            >
              <p className="font-jetbrains text-sm font-bold text-foreground">
                {project.name}
              </p>
              <p className="type-body-sm max-w-[688px] text-foreground">
                {project.cardDescription}
              </p>
              <ProjectStatusChip status={project.status} />
            </li>
          ))}
        </ul>
      </section>

      <SiteCloser route="work" />
    </PageShell>
  );
}
