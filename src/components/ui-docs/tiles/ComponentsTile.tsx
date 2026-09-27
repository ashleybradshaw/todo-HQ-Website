"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { BookLinks } from "@/components/book/BookLinks";
import { BookPathToggle, type BookPathId } from "@/components/book/BookPathToggle";
import { FloorGhostDuo } from "@/components/ide/FloorGhost";
import { ProjectCard } from "@/components/ProjectCard";
import { SprayButton } from "@/components/SprayButton";
import { Telemetry } from "@/components/Telemetry";
import { TypeComment } from "@/components/TypeComment";
import { MenuButton } from "@/components/nav/NavBar";
import { ProjectStatusChip } from "@/components/work/ProjectStatusChip";
import { UiTile } from "@/components/ui-docs/UiTile";
import { initialLinkRows } from "@/lib/book-links";
import { PROJECTS, type ProjectStatus } from "@/lib/projects";
import { cn } from "@/lib/cn";
import { uiPage } from "@/content/pages/ui";

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
    <section className="min-w-0 space-y-2.5">
      <h3 className="type-label text-muted">{title}</h3>
      {children}
    </section>
  );
}

export function ComponentsTile() {
  const { components } = uiPage.tiles;
  const [links, setLinks] = useState(() => initialLinkRows(1));
  const [needsAccess, setNeedsAccess] = useState(false);
  const [accessNote, setAccessNote] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [path, setPath] = useState<BookPathId>("quick");
  const sample =
    PROJECTS.find((p) => p.listed && p.hasPage) ?? PROJECTS[0];
  const tinted =
    PROJECTS.find((p) => p.status === "pipeline") ?? sample;

  return (
    <UiTile
      title={components.title}
      description={components.description}
      span="full"
      className="ui-tile-full"
    >
      <div className="grid min-w-0 gap-8 md:grid-cols-2 xl:grid-cols-3">
        <Block title="Buttons + spray CTAs">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex flex-col items-start gap-1">
              <SprayButton />
              <span className="type-caption text-muted">rest</span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <button type="button" className={softCtaClass}>
                Soft tint
              </button>
              <span className="type-caption text-muted">hover · opacity</span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <button type="button" className={outlineCtaClass}>
                Outline
                <span aria-hidden="true" className="spray-shine-wash" />
                <span aria-hidden="true" className="spray-shine-edge" />
              </button>
              <span className="type-caption text-muted">shine</span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <button type="button" className={softCtaClass} disabled>
                Disabled
              </button>
              <span className="type-caption text-muted">disabled</span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <Link href="/book" className={softCtaClass}>
                Link CTA
              </Link>
              <span className="type-caption text-muted">link</span>
            </div>
          </div>
        </Block>

        <Block title="Menu + focus ring">
          <div className="flex flex-wrap items-center gap-3">
            <MenuButton
              open={menuOpen}
              menuId="ui-docs-menu-demo"
              onToggle={() => setMenuOpen((o) => !o)}
              showLabel
            />
            <button
              type="button"
              className="font-jetbrains rounded-[4px] border border-current px-4 py-2 text-xs font-bold tracking-wider uppercase transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none"
            >
              Focus ring
            </button>
          </div>
          <div id="ui-docs-menu-demo" hidden={!menuOpen} className="sr-only">
            {/* // TEST COPY */}
            Menu demo target
          </div>
        </Block>

        <Block title="Book path + tags">
          <BookPathToggle value={path} onChange={setPath} />
          <div className="mt-3 flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <ProjectStatusChip key={status} status={status} />
            ))}
            <span className="type-label border-border-ide rounded-[4px] border px-2 py-1 text-foreground">
              chip
            </span>
          </div>
        </Block>

        <Block title="Inputs + Book link rows">
          <div className="border-border-ide max-w-lg rounded-[4px] border p-3">
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

        <Block title="Status + Telemetry">
          <div className="border-border-ide max-w-sm overflow-hidden rounded-[4px] border">
            <Telemetry agents={2} />
          </div>
        </Block>

        <Block title="Cards">
          <div className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            <ProjectCard project={sample} />
            <div
              className={cn(
                "border-border-ide rounded-[4px] border border-dashed bg-foreground/10 p-4",
              )}
            >
              <p className="type-label text-on-tint mb-2">Tinted panel</p>
              <p className="type-body-sm text-on-tint">
                {/* // TEST COPY */}
                {tinted.name} · pipeline-style wash.
              </p>
            </div>
          </div>
        </Block>

        <Block title="TypeComment">
          <TypeComment text="// Factory comment — types on when visible" />
        </Block>

        <Block title="404 ghosts">
          <div className="border-border-ide flex justify-center rounded-[4px] border py-6">
            <FloorGhostDuo />
          </div>
        </Block>
      </div>
      <p className="type-caption text-syn-comment mt-6">
        {/* // TEST COPY */}
        Cut from this page: PipelineRunner (Framer Motion weight — /home only).
      </p>
    </UiTile>
  );
}
