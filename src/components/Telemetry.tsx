"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { MirageSpinner } from "@/components/ide/MirageSpinner";
import { cn } from "@/lib/cn";
import { PROJECTS, type Project, type ProjectStatus } from "@/lib/projects";

const HOLD_MS = 3000;
const FADE_MS = 400;

type StatusTone = "online" | "building" | "pending";

type InfraState = {
  tone: StatusTone;
  label: "ONLINE" | "BUILDING" | "PENDING";
};

function infraForStatus(status: ProjectStatus): InfraState {
  if (status === "building") {
    return { tone: "building", label: "BUILDING" };
  }
  if (status === "pipeline") {
    return { tone: "pending", label: "PENDING" };
  }
  return { tone: "online", label: "ONLINE" };
}

function sprintLabel(project: Project) {
  return project.name.toUpperCase();
}

const SPRINT_CH = Math.max(...PROJECTS.map((project) => sprintLabel(project).length));
const INFRA_CH = Math.max(
  "ONLINE".length,
  "BUILDING".length,
  "PENDING".length,
);

function statusPhrase(status: ProjectStatus): string {
  switch (status) {
    case "shipped":
      return "shipped";
    case "building":
      return "in build";
    case "live":
      return "live";
    case "pipeline":
      return "in pipeline";
  }
}

/** Static sr-only roster line derived from PROJECTS (no live region). */
function rosterSummary(projects: readonly Project[]): string {
  const phrases: string[] = [];
  const pipelineNames: string[] = [];

  for (const project of projects) {
    if (project.status === "pipeline") {
      pipelineNames.push(project.name);
      continue;
    }
    phrases.push(`${project.name} ${statusPhrase(project.status)}`);
  }

  if (pipelineNames.length === 1) {
    phrases.push(`${pipelineNames[0]} in pipeline`);
  } else if (pipelineNames.length === 2) {
    phrases.push(`${pipelineNames[0]} and ${pipelineNames[1]} in pipeline`);
  } else if (pipelineNames.length > 2) {
    const head = pipelineNames.slice(0, -1).join(", ");
    phrases.push(`${head}, and ${pipelineNames[pipelineNames.length - 1]} in pipeline`);
  }

  return `Current roster: ${phrases.join(", ")}`;
}

const ROSTER_SUMMARY = rosterSummary(PROJECTS);

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function StatusDot({
  tone,
  pulse,
}: {
  tone: StatusTone;
  pulse: boolean;
}) {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      className="shrink-0"
      aria-hidden="true"
    >
      <circle
        cx="4"
        cy="4"
        r="3"
        className={cn(
          pulse && "animate-pulse motion-reduce:animate-none",
          tone === "online" && "fill-syn-string",
          tone === "building" && "fill-foreground",
          tone === "pending" && "fill-status-pending",
        )}
      />
    </svg>
  );
}

export function Telemetry({ agents }: { agents: number }) {
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    let holdTimer: number | undefined;
    let fadeTimer: number | undefined;
    let cancelled = false;

    const clearTimers = () => {
      if (holdTimer !== undefined) window.clearTimeout(holdTimer);
      if (fadeTimer !== undefined) window.clearTimeout(fadeTimer);
      holdTimer = undefined;
      fadeTimer = undefined;
    };

    const advance = () => {
      setVisible(false);
      fadeTimer = window.setTimeout(() => {
        if (cancelled) return;
        setIndex((current) => (current + 1) % PROJECTS.length);
        setVisible(true);
        scheduleHold();
      }, FADE_MS);
    };

    const scheduleHold = () => {
      clearTimers();
      if (cancelled || document.hidden) return;
      holdTimer = window.setTimeout(advance, HOLD_MS);
    };

    const onVisibility = () => {
      if (document.hidden) {
        clearTimers();
        setVisible(true);
        return;
      }
      scheduleHold();
    };

    document.addEventListener("visibilitychange", onVisibility);
    scheduleHold();

    return () => {
      cancelled = true;
      clearTimers();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduceMotion]);

  const project = PROJECTS[reduceMotion ? 0 : index] ?? PROJECTS[0];
  const infra = infraForStatus(project.status);
  const sprint = sprintLabel(project);
  const fadeClass = cn(
    "transition-opacity ease-out",
    reduceMotion || visible ? "opacity-100" : "opacity-0",
  );
  const fadeStyle = { transitionDuration: `${FADE_MS}ms` } as const;

  const rows = [
    {
      key: "AGENTS_ACTIVE",
      value: String(agents).padStart(2, "0"),
    },
    {
      key: "INFRASTRUCTURE",
      kind: "infra" as const,
      tone: infra.tone,
      label: infra.label,
    },
    {
      key: "CURRENT_SPRINT",
      kind: "sprint" as const,
      value: sprint,
    },
  ];

  return (
    <section
      className="shrink-0 border-t border-border-ide"
      aria-label="Factory telemetry"
    >
      <p className="sr-only">{ROSTER_SUMMARY}</p>
      <div className="flex items-center justify-between border-b border-border-ide px-3 py-2">
        <p className="font-jetbrains text-foreground text-xs">
          SYS // TELEMETRY
        </p>
        <MirageSpinner />
      </div>
      <dl className="font-jetbrains text-xs leading-5">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between gap-3 border-b border-border-ide px-3 py-2 last:border-b-0"
          >
            <dt className="text-foreground/50 shrink-0">{row.key}</dt>
            {"kind" in row && row.kind === "infra" ? (
              <dd
                className={cn(
                  "text-foreground flex shrink-0 items-center justify-end gap-1.5 tabular-nums",
                  fadeClass,
                )}
                style={{ ...fadeStyle, minWidth: `${INFRA_CH + 1.5}ch` }}
              >
                <StatusDot tone={row.tone} pulse={!reduceMotion} />
                <span className="text-right" style={{ minWidth: `${INFRA_CH}ch` }}>
                  {row.label}
                </span>
              </dd>
            ) : "kind" in row && row.kind === "sprint" ? (
              <dd
                className={cn(
                  "text-foreground shrink-0 text-right tabular-nums",
                  fadeClass,
                )}
                style={{ ...fadeStyle, minWidth: `${SPRINT_CH}ch` }}
              >
                {row.value}
              </dd>
            ) : (
              <dd className="text-foreground shrink-0 text-right tabular-nums">
                {row.value}
              </dd>
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}
