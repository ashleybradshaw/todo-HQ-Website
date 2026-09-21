import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { ProjectCard } from "@/components/ProjectCard";
import { workPage } from "@/content/pages/work";
import { getListedProjects } from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Work",
  description: workPage.metaDescription,
  path: "/work",
});

export default function WorkPage() {
  const projects = getListedProjects();

  return (
    <PageShell
      wide
      eyebrow={workPage.eyebrow}
      title={workPage.title}
      lede={
        <p className="font-jetbrains max-w-[592px] text-sm leading-[18px] tracking-[-0.01em]">
          {workPage.lede}
        </p>
      }
    >
      <ul className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {projects.map((project) => (
          <li key={project.slug}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
