import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
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
    <main className="relative min-h-screen overflow-x-hidden bg-background px-6 pt-28 pb-16 text-foreground transition-[background-color,color] duration-[400ms] ease-in-out">
      <JsonLd data={organizationGraph()} />
      <div className="relative z-10 mx-auto max-w-[1336px]">
        <div className="max-w-[592px]">
          <h1 className="font-jetbrains text-base leading-5 font-bold">
            The work;
          </h1>
          <p className="font-jetbrains mt-2 text-sm leading-[18px] tracking-[-0.01em]">
            {
              "//TODO Engineering operates an internal software factory. Active apps in production: RepDaily, ReadyGo, and Contentic."
            }
          </p>
        </div>
        <ul className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {PROJECTS.map((project) => (
            <li key={project.slug}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
