import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { ProjectCard } from "@/components/ProjectCard";
import { SiteCloser } from "@/components/SiteCloser";
import { workPage } from "@/content/pages/work";
import { getListedProjects } from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: workPage.seo.title,
  description: workPage.seo.description,
  path: "/work",
});

export default function WorkPage() {
  const projects = getListedProjects();

  return (
    <PageShell
      variant="index"
      eyebrow={workPage.eyebrow}
      title={workPage.title}
      lede={<p className="type-body-sm max-w-[592px]">{workPage.lede}</p>}
    >
      <ul className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {projects.map((project, index) => (
          <li key={project.slug}>
            <ProjectCard project={project} priority={index === 0} />
          </li>
        ))}
      </ul>
      <SiteCloser route="work" />
    </PageShell>
  );
}
