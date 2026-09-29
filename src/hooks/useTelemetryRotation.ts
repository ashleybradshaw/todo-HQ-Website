"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { PROJECTS, type Project, type ProjectStatus } from "@/lib/projects";
import { homePage } from "@/content/pages/home";

const HOLD_MS = 3000;
const FADE_MS = 400;

const { telemetry } = homePage;

export type StatusTone = "online" | "building" | "pending";

function infraForStatus(status: ProjectStatus): {
  tone: StatusTone;
  label: string;
} {
  if (status === "building") {
    return { tone: "building", label: telemetry.infra.building };
  }
  if (status === "pipeline") {
    return { tone: "pending", label: telemetry.infra.pending };
  }
  return { tone: "online", label: telemetry.infra.online };
}

function sprintLabel(project: Project) {
  return project.name.toUpperCase();
}

function statusPhrase(status: ProjectStatus): string {
  switch (status) {
    case "shipped":
      return telemetry.status.shipped;
    case "building":
      return telemetry.status.building;
    case "live":
      return telemetry.status.live;
    case "pipeline":
      return telemetry.status.pipeline;
  }
}

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
    phrases.push(`${pipelineNames[0]} ${telemetry.status.pipeline}`);
  } else if (pipelineNames.length === 2) {
    phrases.push(
      `${pipelineNames[0]} and ${pipelineNames[1]} ${telemetry.status.pipeline}`,
    );
  } else if (pipelineNames.length > 2) {
    const head = pipelineNames.slice(0, -1).join(", ");
    phrases.push(
      `${head}, and ${pipelineNames[pipelineNames.length - 1]} ${telemetry.status.pipeline}`,
    );
  }

  return `${telemetry.rosterPrefix}${phrases.join(", ")}`;
}

export const TELEMETRY_ROSTER_SUMMARY = rosterSummary(PROJECTS);

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Rotating project status for the IDE status bar (was Telemetry panel). */
export function useTelemetryRotation(options?: { armed?: boolean }) {
  const armed = options?.armed ?? true;
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reduceMotion || !armed) {
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
  }, [reduceMotion, armed]);

  const project = PROJECTS[reduceMotion ? 0 : index] ?? PROJECTS[0];
  const infra = infraForStatus(project.status);

  return {
    reduceMotion,
    visible,
    fadeMs: FADE_MS,
    projectName: sprintLabel(project),
    infra,
    rosterSummary: TELEMETRY_ROSTER_SUMMARY,
    sectionAria: telemetry.sectionAria,
  };
}
