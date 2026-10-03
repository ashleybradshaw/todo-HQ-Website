"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { DecodeLabel } from "@/components/DecodeLabel";
import { StackIcon, STACK_BY_ID } from "@/components/ide/StackIconRow";
import { TypeComment } from "@/components/TypeComment";
import { CountUp } from "@/components/work/CountUp";
import { ProjectStatusChip } from "@/components/work/ProjectStatusChip";
import { cn } from "@/lib/cn";
import type { FullProject, ProjectMetric } from "@/lib/projects";

/** Must match the live metric label in src/lib/projects.ts. */
export const LIVE_METRIC_LABEL = "active users";

function metricText(metric: ProjectMetric) {
  return `${metric.prefix ?? ""}${metric.value}${metric.suffix ?? ""}`;
}

function StatValue({ metric }: { metric: ProjectMetric }) {
  const text = metricText(metric);
  const count = (
    <CountUp
      variant="stat"
      value={metric.value}
      prefix={metric.prefix}
      suffix={metric.suffix}
      live={metric.label === LIVE_METRIC_LABEL}
    />
  );

  if (metric.label !== LIVE_METRIC_LABEL) return count;

  return (
    <>
      <span className="sr-only">{text}</span>
      {count}
    </>
  );
}

function DrawX() {
  return (
    <span
      aria-hidden="true"
      className="bg-border-ide work-draw-x block h-px w-full"
    />
  );
}

function Fact({
  gutter,
  label,
  playKey,
  children,
}: {
  gutter: string;
  label: string;
  playKey: number;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <dt className="text-muted flex shrink-0 items-baseline gap-2 text-[10px] lg:text-[11px]">
        <span
          aria-hidden="true"
          className="text-syn-number w-5 shrink-0 text-right tabular-nums"
        >
          {gutter}
        </span>
        <DecodeLabel
          text={label}
          playKey={playKey}
          settleColor="var(--text-muted)"
        />
      </dt>
      {children}
    </div>
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
        "text-foreground min-w-0 text-right text-[10px] break-words lg:text-[11px]",
        className,
      )}
    >
      {children}
    </dd>
  );
}

function DotJoined({ items }: { items: readonly string[] }) {
  return (
    <Value>
      <span className="sr-only">{items.join(", ")}</span>
      <span aria-hidden="true">
        {items.map((item, index) => (
          <span key={`${item}-${index}`}>
            {index > 0 ? (
              <span aria-hidden="true" className="opacity-40">
                {" · "}
              </span>
            ) : null}
            {item}
          </span>
        ))}
      </span>
    </Value>
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
            <span aria-hidden="true">{"\u2197\uFE0E"}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ProjectSpecPanel({
  project,
  label,
  activity = null,
  activityLegend = null,
}: {
  project: FullProject;
  label: string;
  /** Server-rendered contribution graph. Omitted on the specimen sheet. */
  activity?: ReactNode;
  activityLegend?: string | null;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const links = project.spec.links ?? [];
  const playKey = revealed ? 1 : 0;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setRevealed(true);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={rootRef}
      data-spec-panel
      aria-label={label}
      className={cn(
        "border-border-ide font-jetbrains relative mt-10 w-full border",
        revealed && "is-revealed",
      )}
    >
      <div className="border-border-ide flex items-center justify-between gap-3 border-b px-6 py-2">
        <TypeComment
          text={`// ${project.slug}.spec`}
          className="text-syn-keyword"
        />
        <div className="flex shrink-0 items-center gap-1.5">
          <span
            aria-hidden="true"
            className="status-dot-pulse bg-foreground inline-block size-1.5 shrink-0 rounded-full"
          />
          <ProjectStatusChip status={project.status} />
        </div>
      </div>

      <dl data-metric-list="" className="grid grid-cols-2 sm:grid-cols-3">
        {project.metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={cn(
              "border-border-ide px-4 py-4",
              index === 0 && "border-r",
              index === 1 && "sm:border-r",
              index === 2 && "col-span-2 border-t sm:col-span-1 sm:border-t-0",
            )}
          >
            <dd>
              <StatValue metric={metric} />
            </dd>
            <dt className="font-jetbrains text-syn-comment mt-1 block text-xs">
              <DecodeLabel text={metric.label} playKey={playKey} />
            </dt>
          </div>
        ))}
      </dl>

      {activity}
      <DrawX />

      <div className="grid grid-cols-1 sm:grid-cols-2">
        <dl className="border-border-ide px-4 py-4 sm:border-r">
          <Fact gutter="01" label="client" playKey={playKey}>
            <Value>{project.spec.client}</Value>
          </Fact>
          <DrawX />
          <Fact gutter="02" label="year" playKey={playKey}>
            <Value>{project.spec.year}</Value>
          </Fact>
          <DrawX />
          <Fact gutter="03" label="platforms" playKey={playKey}>
            <DotJoined items={project.spec.platforms} />
          </Fact>
          {links.length > 0 ? (
            <>
              <DrawX />
              <Fact gutter="04" label="links" playKey={playKey}>
                <dd className="min-w-0">
                  <SpecLinks project={project} />
                </dd>
              </Fact>
            </>
          ) : null}
        </dl>
        <span
          aria-hidden="true"
          className="bg-border-ide work-draw-x col-span-full block h-px w-full sm:hidden"
        />
        <dl className="px-4 py-4">
          <Fact gutter="05" label="role" playKey={playKey}>
            <DotJoined items={project.spec.role} />
          </Fact>
          <DrawX />
          <Fact gutter="06" label="timeline" playKey={playKey}>
            <Value>{project.spec.timeline}</Value>
          </Fact>
          <DrawX />
          <Fact gutter="07" label="stack" playKey={playKey}>
            <dd className="min-w-0">
              <ul className="flex flex-wrap justify-end gap-x-3 gap-y-2">
                {project.stack.map((id, index) => {
                  const item = STACK_BY_ID[id];
                  return (
                    <li
                      key={id}
                      className="spec-stack-in text-foreground inline-flex min-w-0 items-center gap-1.5 text-[10px] break-words lg:text-[11px]"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <StackIcon id={id} label={item.label} />
                      <span className="min-w-0 break-words">{item.label}</span>
                    </li>
                  );
                })}
              </ul>
            </dd>
          </Fact>
        </dl>
      </div>

      <div className="bg-ide-chrome border-border-ide text-muted flex items-center justify-between gap-3 border-t px-6 py-1 font-jetbrains text-[10px] lg:text-[11px]">
        <span className="min-w-0">
          {`main · ${project.release} · ${project.spec.platforms.join(" / ")}`}
        </span>
        {activityLegend ? <span className="shrink-0">{activityLegend}</span> : null}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ containerType: "size" }}
      >
        <div className="spec-scan" />
      </div>
    </section>
  );
}
