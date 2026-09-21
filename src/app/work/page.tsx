import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/PageShell";
import { ProjectCard } from "@/components/ProjectCard";
import { PROJECTS } from "@/lib/projects";
import { organizationGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Work",
  description:
    "Case studies from the //TODO Engineering factory — autonomous agent workflows and production apps including RepDaily, ReadyGo, and Contentic.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <>
      <JsonLd data={organizationGraph()} />
      <PageShell
        wide
        eyebrow="WORK //"
        title="The work"
        lede={
          <p className="font-jetbrains max-w-[592px] text-sm leading-[18px] tracking-[-0.01em]">
            {
              "//TODO Engineering operates an internal software factory. Active apps in production: RepDaily, ReadyGo, and Contentic."
            }
          </p>
        }
      >
        <ul className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {PROJECTS.map((project) => (
            <li key={project.slug}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </PageShell>
    </>
  );
}
