import type { ReactNode } from "react";
import { StackIcon, STACK_BY_ID } from "@/components/ide/StackIconRow";
import {
  PROJECT_STATUS_LABEL,
  type FullProject,
} from "@/lib/projects";

const ROW =
  "border-border-ide grid grid-cols-1 gap-1 border-b py-3 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-start sm:gap-4";

function Key({ children }: { children: string }) {
  return (
    <dt className="font-jetbrains text-syn-property text-xs tracking-wide">
      {children}
    </dt>
  );
}

function Value({ children }: { children: ReactNode }) {
  return (
    <dd className="font-jetbrains text-foreground min-w-0 text-sm break-words">
      {children}
    </dd>
  );
}

export function ProjectSpec({
  project,
  label,
}: {
  project: FullProject;
  label: string;
}) {
  const links = project.spec.links ?? [];

  return (
    <section aria-label={label} className="mx-auto mt-8 w-full max-w-[688px]">
      <dl>
        <div className={ROW}>
          <Key>client</Key>
          <Value>{project.spec.client}</Value>
        </div>
        <div className={ROW}>
          <Key>year</Key>
          <Value>{project.spec.year}</Value>
        </div>
        <div className={ROW}>
          <Key>status</Key>
          <Value>
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="status-dot-pulse bg-foreground inline-block size-1.5 shrink-0 rounded-full"
              />
              {PROJECT_STATUS_LABEL[project.status]}
            </span>
          </Value>
        </div>
        <div className={ROW}>
          <Key>platforms</Key>
          <Value>{project.spec.platforms.join(", ")}</Value>
        </div>
        <div className={ROW}>
          <Key>role</Key>
          <Value>{project.spec.role.join(", ")}</Value>
        </div>
        <div className={ROW}>
          <Key>stack</Key>
          <Value>
            <ul className="flex flex-wrap gap-x-3 gap-y-2">
              {project.stack.map((id) => {
                const item = STACK_BY_ID[id];
                return (
                  <li key={id} className="inline-flex items-center gap-1.5">
                    <StackIcon id={id} label={item.label} />
                    <span>{item.label}</span>
                  </li>
                );
              })}
            </ul>
          </Value>
        </div>
        <div className={ROW}>
          <Key>timeline</Key>
          <Value>{project.spec.timeline}</Value>
        </div>
        {links.length > 0 ? (
          <div className={ROW}>
            <Key>links</Key>
            <Value>
              <ul className="flex flex-col gap-1">
                {links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Value>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
