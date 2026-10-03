"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { StackIcon, STACK_BY_ID } from "@/components/ide/StackIconRow";
import { TypeComment } from "@/components/TypeComment";
import { CountUp } from "@/components/work/CountUp";
import { ProjectStatusChip } from "@/components/work/ProjectStatusChip";
import { cn } from "@/lib/cn";
import type { FullProject, ProjectMetric } from "@/lib/projects";

/** Must match the live metric label in src/lib/projects.ts. */
export const LIVE_METRIC_LABEL = "active users";

const SPARKLINES = [
  "M0 12 L8 10 L16 11 L24 6 L32 8 L40 3 L48 5",
  "M0 11 L8 7 L16 9 L24 4 L32 6 L40 2 L48 4",
  "M0 9 L8 12 L16 8 L24 10 L32 4 L40 7 L48 3",
] as const;

function metricText(metric: ProjectMetric) {
  return `${metric.prefix ?? ""}${metric.value}${metric.suffix ?? ""}`;
}

function Sparkline({ index }: { index: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 16"
      className="text-syn-comment mt-2 h-4 w-12"
    >
      <path
        d={SPARKLINES[index % SPARKLINES.length]}
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
        className="spec-spark"
        style={{ animationDelay: `${index * 80}ms` }}
      />
    </svg>
  );
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

function Key({ children }: { children: string }) {
  return <dt className="type-caption text-muted shrink-0">{children}</dt>;
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

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <Key>{label}</Key>
      {children}
    </div>
  );
}

export function ProjectSpecPanel({
  project,
  label,
}: {
  project: FullProject;
  label: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const links = project.spec.links ?? [];

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
        "border-border-ide relative mt-10 w-full border",
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
              {metric.label}
            </dt>
            <Sparkline index={index} />
          </div>
        ))}
      </dl>

      <div className="border-border-ide grid grid-cols-1 border-t sm:grid-cols-2">
        <dl className="border-border-ide px-4 py-4 sm:border-r">
          <Fact label="client">
            <Value>{project.spec.client}</Value>
          </Fact>
          <Fact label="year">
            <Value>{project.spec.year}</Value>
          </Fact>
          <Fact label="platforms">
            <Value>{project.spec.platforms.join(", ")}</Value>
          </Fact>
          {links.length > 0 ? (
            <Fact label="links">
              <dd className="min-w-0">
                <SpecLinks project={project} />
              </dd>
            </Fact>
          ) : null}
        </dl>
        <dl className="border-border-ide border-t px-4 py-4 sm:border-t-0">
          <Fact label="role">
            <Value>{project.spec.role.join(", ")}</Value>
          </Fact>
          <Fact label="timeline">
            <Value>{project.spec.timeline}</Value>
          </Fact>
          <Fact label="stack">
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
