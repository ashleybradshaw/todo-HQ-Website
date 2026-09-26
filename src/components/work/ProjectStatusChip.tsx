import { cn } from "@/lib/cn";
import {
  PROJECT_STATUS_LABEL,
  type ProjectStatus,
} from "@/lib/projects";

export function ProjectStatusChip({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-jetbrains inline-flex w-fit rounded-[4px] border border-border-ide px-2 py-0.5 text-xs tracking-wide text-on-tint",
        className,
      )}
    >
      {PROJECT_STATUS_LABEL[status]}
    </span>
  );
}
