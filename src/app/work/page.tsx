import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ProjectCard, type Project } from "@/components/ProjectCard";
import { organizationGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Work",
  description:
    "Case studies from the //TODO Engineering factory — autonomous agent workflows and production apps including Repdaily, ReadyGo, and Contentic.",
  path: "/work",
});

const PROJECTS: readonly Project[] = [
  {
    name: "ReadyGo",
    description:
      "A pre-activity planning app for runners and cyclists. Designed and shipped using a fully integrated AI workflow stack to bypass sequential handoffs.",
    imageSrc: "/work/readygo.jpg",
    imageAlt:
      "ReadyGo still: a cyclist and a runner on a mountain road under the line Take it out on the road.",
    imageWidth: 1400,
    imageHeight: 756,
  },
  {
    name: "RepDaily",
    description:
      "A camera-based fitness tracking app. Designed, prototyped, and shipped using an advanced AI-assisted engineering workflow.",
    imageSrc: "/work/repdaily.jpg",
    imageAlt:
      "Repdaily production interface on a phone, showing workout progression and a January training calendar.",
    imageWidth: 1400,
    imageHeight: 787,
  },
];

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
              "//TODO Engineering operates an internal software factory. Active apps in production: Repdaily, ReadyGo, and Contentic."
            }
          </p>
        </div>
        <ul className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {PROJECTS.map((project) => (
            <li key={project.name}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
