import { cn } from "@/lib/cn";
import {
  PROJECT_STATUS_LABEL,
  type ProjectStatus,
} from "@/lib/projects";

export function ProjectStatusChip({
  status,
  pulse = false,
  className,
}: {
  status: ProjectStatus;
  /** One live dot inside the chip. The spec bar uses this instead of a second indicator. */
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      data-status-chip=""
      className={cn(
        "font-jetbrains inline-flex w-fit items-center gap-1.5 rounded-[4px] border border-border-ide px-2 py-0.5 text-xs tracking-wide text-on-tint",
        className,
      )}
    >
      {pulse ? (
        <span
          aria-hidden="true"
          className="status-dot-pulse bg-foreground inline-block size-1.5 shrink-0 rounded-full"
        />
      ) : null}
      {PROJECT_STATUS_LABEL[status]}
    </span>
  );
}
