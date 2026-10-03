import { ProjectStatusChip } from "@/components/work/ProjectStatusChip";
import type { PipelineProject } from "@/lib/projects";

export function QueuedProjectList({
  projects,
  label,
}: {
  projects: readonly PipelineProject[];
  label: string;
}) {
  return (
    <section aria-labelledby="work-queued-heading">
      <h2 id="work-queued-heading" className="type-label">
        {label}
      </h2>
      <ul className="border-border-ide mt-4 border-y">
        {projects.map((project) => (
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
  );
}
