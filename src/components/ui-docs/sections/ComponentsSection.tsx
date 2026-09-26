"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { BookLinks } from "@/components/book/BookLinks";
import { FloorGhostDuo } from "@/components/ide/FloorGhost";
import { ProjectCard } from "@/components/ProjectCard";
import { SprayButton } from "@/components/SprayButton";
import { Telemetry } from "@/components/Telemetry";
import { TypeComment } from "@/components/TypeComment";
import { ProjectStatusChip } from "@/components/work/ProjectStatusChip";
import { UiSectionFrame } from "@/components/ui-docs/UiSectionFrame";
import { initialLinkRows } from "@/lib/book-links";
import { PROJECTS, type ProjectStatus } from "@/lib/projects";
import { SNIPPETS } from "@/lib/ui-docs/snippets";
import { cn } from "@/lib/cn";

const STATUSES: ProjectStatus[] = ["shipped", "building", "live", "pipeline"];

const softCtaClass =
  "font-jetbrains inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[4px] border border-current bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-2 text-xs font-bold tracking-wider text-on-tint transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40";

const outlineCtaClass =
  "relative inline-flex w-fit cursor-pointer items-center justify-center overflow-hidden rounded-[4px] border border-current px-3 py-1.5 font-jetbrains text-xs font-bold tracking-wider uppercase transition-colors duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40";

function Block({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 space-y-3">
      <h3 className="type-label text-muted">{title}</h3>
      {children}
    </section>
  );
}

export function ComponentsSection() {
  const [links, setLinks] = useState(() => initialLinkRows(1));
  const [needsAccess, setNeedsAccess] = useState(false);
  const [accessNote, setAccessNote] = useState("");
  const sample =
    PROJECTS.find((p) => p.listed && p.hasPage) ?? PROJECTS[0];
  const tinted =
    PROJECTS.find((p) => p.status === "pipeline") ?? sample;

  return (
    <UiSectionFrame
      comment="// Components — real imports (PipelineRunner cut). TEST COPY."
      code={SNIPPETS.components}
      example={
        <div className="space-y-10 min-w-0">
          <Block title="Buttons + spray CTAs">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex flex-col items-start gap-1.5">
                <SprayButton />
                <span className="type-caption text-muted">SprayButton</span>
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <button type="button" className={softCtaClass}>
                  Soft tint
                </button>
                <span className="type-caption text-muted">
                  soft tint · BookFaq
                </span>
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <button type="button" className={outlineCtaClass}>
                  Outline
                  <span aria-hidden="true" className="spray-shine-wash" />
                  <span aria-hidden="true" className="spray-shine-edge" />
                </button>
                <span className="type-caption text-muted">
                  outline · WorkTogetherBand
                </span>
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <button type="button" className={softCtaClass} disabled>
                  Disabled
                </button>
                <span className="type-caption text-muted">
                  soft tint · disabled
                </span>
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <Link href="/book" className={softCtaClass}>
                  Link CTA
                </Link>
                <span className="type-caption text-muted">
                  link CTA · not-found
                </span>
              </div>
            </div>
            <p className="type-caption text-syn-comment">
              {/* // TEST COPY */}
              Tab to each control for focus. Hover for opacity. Disabled has no
              pointer.
            </p>
          </Block>

          <Block title="Status chips + tones via Telemetry">
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((status) => (
                <ProjectStatusChip key={status} status={status} />
              ))}
            </div>
            <div className="mt-3 max-w-sm overflow-hidden rounded-[4px] border border-border-ide">
              <Telemetry agents={2} />
            </div>
            <p className="type-caption text-syn-comment">
              {/* // TEST COPY */}
              StatusDot stays private inside Telemetry (no extract — pixel-safe).
              Tones: online → --syn-string, building → --foreground, pending →
              --status-pending.
            </p>
          </Block>

          <Block title="Inputs + Book link rows">
            <div className="max-w-lg rounded-[4px] border border-border-ide p-3">
              <BookLinks
                links={links}
                onChange={setLinks}
                needsAccess={needsAccess}
                onNeedsAccessChange={setNeedsAccess}
                accessNote={accessNote}
                onAccessNoteChange={setAccessNote}
                idPrefix="ui-docs"
              />
            </div>
          </Block>

          <Block title="Cards — tinted + plain border">
            <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
              <ProjectCard project={sample} />
              <div
                className={cn(
                  "rounded-[4px] border border-dashed border-border-ide bg-foreground/10 p-4",
                )}
              >
                <p className="type-label text-on-tint mb-2">Tinted panel</p>
                <p className="type-body-sm text-on-tint">
                  {/* // TEST COPY */}
                  {tinted.name} · pipeline-style wash (bg-foreground/10).
                </p>
              </div>
            </div>
          </Block>

          <Block title="TypeComment">
            <TypeComment text="// Factory comment — types on when visible" />
          </Block>

          <Block title="404 ghosts">
            <div className="flex justify-center rounded-[4px] border border-border-ide py-8">
              <FloorGhostDuo />
            </div>
          </Block>

          <p className="type-caption text-syn-comment">
            {/* // TEST COPY */}
            Cut from this page: PipelineRunner (Framer Motion on the /ui bundle —
            keep it on /home only).
          </p>
        </div>
      }
    />
  );
}
