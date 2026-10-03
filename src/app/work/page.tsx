import type { Metadata } from "next";
import { IdeFrame } from "@/components/ide/IdeFrame";
import { PageShell } from "@/components/PageShell";
import { ProjectCard } from "@/components/ProjectCard";
import { QueuedProjectList } from "@/components/work/QueuedProjectList";
import { SiteCloser } from "@/components/SiteCloser";
import { workCountLine, workPage } from "@/content/pages/work";
import { cn } from "@/lib/cn";
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
  const lastWide = cards.length % 2 === 1;
  const live = cards.filter(
    (project) => project.status === "shipped" || project.status === "live",
  ).length;

  return (
    <PageShell
      variant="index"
      eyebrow={workPage.eyebrow}
      title={workPage.title}
      lede={workPage.lede}
    >
      <IdeFrame
        label={workPage.frameLabel}
        meta={workCountLine(cards.length, live, queued.length)}
        labelledBy="work-frame-label"
      >
        <ul className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
          {cards.map((project, index) => {
            const wide = lastWide && index === cards.length - 1;
            return (
              <li
                key={project.slug}
                className={cn("h-full", wide && "lg:col-span-2")}
              >
                <ProjectCard
                  project={project}
                  priority={index === 0}
                  wide={wide}
                />
              </li>
            );
          })}
        </ul>

        <QueuedProjectList projects={queued} label={workPage.queuedLabel} />
      </IdeFrame>

      <SiteCloser route="work" />
    </PageShell>
  );
}
