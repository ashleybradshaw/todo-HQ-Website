import type { ReactNode } from "react";
import { StackIcon, STACK_BY_ID } from "@/components/ide/StackIconRow";
import { cn } from "@/lib/cn";
import {
  PROJECT_STATUS_LABEL,
  type FullProject,
  type ProjectStatus,
} from "@/lib/projects";

function statusWord(status: ProjectStatus) {
  return PROJECT_STATUS_LABEL[status].replace(/^\/\/\s*/, "");
}

function DrawX({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("work-draw-x bg-border-ide block h-px w-full", className)}
    />
  );
}

function Key({ children }: { children: string }) {
  return (
    <dt className="text-muted shrink-0 text-[10px] tracking-wide lg:text-[11px]">
      {children}
    </dt>
  );
}

function Value({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <dd
      className={cn(
        "text-foreground min-w-0 text-[10px] break-words lg:text-[11px]",
        className,
      )}
    >
      {children}
    </dd>
  );
}

function SpecLinks({ project }: { project: FullProject }) {
  const links = project.spec.links ?? [];
  if (links.length === 0) return null;

  return (
    <ul className="flex min-w-0 flex-wrap justify-end gap-x-3 gap-y-1 text-[10px] lg:text-[11px]">
      {links.map((link) => (
        <li key={link.href} className="min-w-0">
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.label} (opens in a new tab)`}
            className="text-muted inline-flex min-h-6 max-w-full items-center gap-1 rounded-[4px] break-words focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none"
          >
            <span className="min-w-0 break-words">{link.label}</span>
            <span aria-hidden="true">↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Compact header sidecar: client, year, platforms, links. Status stays on the chip. */
export function ProjectSpec({
  project,
  label,
  className,
}: {
  project: FullProject;
  label: string;
  className?: string;
}) {
  const links = project.spec.links ?? [];

  return (
    <section
      aria-label={label}
      className={cn(
        "border-border-ide font-jetbrains w-full rounded-[4px] border",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-3 py-1.5">
        <p className="text-muted text-[10px] tracking-wide lg:text-[11px]">
          {"// meta"}
        </p>
        <p className="text-foreground flex shrink-0 items-center gap-1.5 text-[10px] lg:text-[11px]">
          <span
            aria-hidden="true"
            className="status-dot-pulse bg-foreground inline-block size-1.5 shrink-0 rounded-full"
          />
          {statusWord(project.status)}
        </p>
      </div>
      <DrawX />
      <dl>
        <div className="flex items-start justify-between gap-3 px-3 py-2">
          <Key>client</Key>
          <Value className="text-right">{project.spec.client}</Value>
        </div>
        <DrawX />
        <div className="flex items-start justify-between gap-3 px-3 py-2">
          <Key>year</Key>
          <Value className="text-right">{project.spec.year}</Value>
        </div>
        <DrawX />
        <div className="flex items-start justify-between gap-3 px-3 py-2">
          <Key>platforms</Key>
          <Value className="text-right">{project.spec.platforms.join(", ")}</Value>
        </div>
        {links.length > 0 ? (
          <>
            <DrawX />
            <div className="flex items-start justify-between gap-3 px-3 py-2">
              <Key>links</Key>
              <dd className="min-w-0">
                <SpecLinks project={project} />
              </dd>
            </div>
          </>
        ) : null}
      </dl>
    </section>
  );
}

/** Role, timeline, and stack — sits in the stats band, not the header card. */
export function ProjectBuild({
  project,
  label,
  className,
}: {
  project: FullProject;
  label: string;
  className?: string;
}) {
  return (
    <section aria-label={label} className={cn("font-jetbrains min-w-0", className)}>
      <p className="text-muted text-[10px] tracking-wide lg:text-[11px]">
        {"// build"}
      </p>
      <dl className="mt-3 flex flex-col gap-3">
        <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-3">
          <Key>role</Key>
          <Value>{project.spec.role.join(", ")}</Value>
        </div>
        <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-3">
          <Key>timeline</Key>
          <Value>{project.spec.timeline}</Value>
        </div>
        <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-3">
          <Key>stack</Key>
          <dd className="min-w-0">
            <ul className="flex flex-wrap gap-x-3 gap-y-2">
              {project.stack.map((id) => {
                const item = STACK_BY_ID[id];
                return (
                  <li
                    key={id}
                    className="text-foreground inline-flex min-w-0 items-center gap-1.5 text-[10px] break-words lg:text-[11px]"
                  >
                    <StackIcon id={id} label={item.label} />
                    <span className="min-w-0 break-words">{item.label}</span>
                  </li>
                );
              })}
            </ul>
          </dd>
        </div>
      </dl>
    </section>
  );
}
