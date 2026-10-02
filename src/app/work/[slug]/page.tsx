import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/PageShell";
import { SiteCloser } from "@/components/SiteCloser";
import { NextProjectPanel } from "@/components/work/NextProjectPanel";
import { ProjectGlyphField } from "@/components/work/ProjectGlyphField";
import {
  CaseHero,
  ProjectMediaRows,
} from "@/components/work/ProjectMediaRows";
import { ProjectSpec } from "@/components/work/ProjectSpec";
import { ProjectStatusChip } from "@/components/work/ProjectStatusChip";
import { CountUp } from "@/components/work/CountUp";
import {
  getPageProjects,
  getProject,
  getProjectSlugs,
  projectHasPage,
  type FullProject,
} from "@/lib/projects";
import { workDetailPage } from "@/content/pages/work";
import { NavTrail } from "@/components/nav/NavTrail";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbGraph } from "@/lib/schema";
import { SITE_URL } from "@/lib/site";

type WorkProjectParams = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: WorkProjectParams): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project || !projectHasPage(project)) {
    return pageMetadata({
      title: workDetailPage.notFound.title,
      description: workDetailPage.notFound.description,
      path: `/work/${slug}`,
      index: false,
    });
  }

  return pageMetadata({
    title: `${project.name} · Work`,
    description: project.description,
    path: `/work/${project.slug}`,
    index: project.listed,
    images: [
      {
        url: `/work/${project.slug}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: project.name,
      },
    ],
  });
}

function projectJsonLd(project: FullProject) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.name,
    description: project.description,
    url: `${SITE_URL}/work/${project.slug}`,
  };
}

const copy = "mx-auto w-full max-w-[688px]";

const linkClass =
  "font-jetbrains inline-flex min-h-6 items-center rounded-[4px] text-sm underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 transition-opacity hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none";

function adjacentProjects(slug: string) {
  const pages = getPageProjects();
  const index = pages.findIndex((project) => project.slug === slug);
  if (index === -1 || pages.length < 2) {
    return { prev: null, next: null };
  }
  return {
    prev: index > 0 ? pages[index - 1] : null,
    next: pages[(index + 1) % pages.length],
  };
}

function splitCaseMedia(project: FullProject) {
  const heroIndex = project.mediaRows.findIndex(
    (row) => row.layout === "full" && row.items[0]?.ratio === "16:9",
  );
  const hero = heroIndex >= 0 ? project.mediaRows[heroIndex].items[0] : null;
  const rest = project.mediaRows
    .filter((_, index) => index !== heroIndex)
    .slice(0, 3);
  return { hero, rest };
}

export default async function WorkProjectPage({ params }: WorkProjectParams) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project || !projectHasPage(project)) {
    notFound();
  }

  const { prev, next } = adjacentProjects(project.slug);
  const { hero, rest } = splitCaseMedia(project);

  return (
    <>
      <JsonLd data={projectJsonLd(project)} />
      <JsonLd
        data={breadcrumbGraph([
          { name: workDetailPage.breadcrumbWork, path: "/work" },
          { name: project.name, path: `/work/${project.slug}` },
        ])}
      />
      <PageShell
        variant="essayMedia"
        title={project.name}
        titleClassName="mt-3 text-left"
        background={<ProjectGlyphField />}
        beforeTitle={
          <span
            aria-hidden="true"
            className="bg-foreground mt-6 inline-block size-8"
            style={{
              maskImage: `url(/logos/${project.slug}.svg)`,
              WebkitMaskImage: `url(/logos/${project.slug}.svg)`,
              maskSize: "contain",
              WebkitMaskSize: "contain",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "left center",
              WebkitMaskPosition: "left center",
            }}
          />
        }
        lede={
          <div className="flex flex-col items-start gap-3">
            <p className="type-body-sm text-foreground">
              {project.cardDescription}
            </p>
            <ProjectStatusChip status={project.status} />
            {project.slug === "readygo" ? (
              <p className="type-body-sm text-foreground">
                {workDetailPage.readygoNote}
              </p>
            ) : null}
          </div>
        }
        ledeClassName="mt-4"
        aside={
          <ProjectSpec
            project={project}
            label={workDetailPage.specAria(project.name)}
          />
        }
        breadcrumbs={
          <Breadcrumbs
            parent={{ href: "/work", label: workDetailPage.breadcrumbWork }}
            current={project.name}
          />
        }
      >
        <NavTrail
          parentHref="/work"
          parentLabel={workDetailPage.breadcrumbWork}
          current={project.name}
          progressId="work-article-body"
        />
        <div id="work-article-body">
          {hero ? <CaseHero item={hero} /> : null}

          <section
            aria-label={workDetailPage.metricsAria(project.name)}
            className="mt-8"
          >
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {project.metrics.map((metric) => (
                <li
                  key={metric.label}
                  className="border-border-ide border-t pt-4"
                >
                  <CountUp
                    variant="stat"
                    value={metric.value}
                    prefix={metric.prefix}
                    suffix={metric.suffix}
                  />
                  <span className="font-jetbrains text-syn-comment mt-1 block text-xs">
                    {metric.label}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <p className={`type-body ${copy} mt-10 text-foreground`}>
            {project.description}
          </p>

          <h2 className={`type-label ${copy} mt-8`}>
            {workDetailPage.scopeHeading}
          </h2>
          <ul
            className={`type-body ${copy} mt-3 list-disc space-y-1.5 pl-5 text-foreground`}
          >
            {project.scope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2 className={`type-label ${copy} mt-8`}>
            {workDetailPage.outcomeHeading}
          </h2>
          <p className={`type-body ${copy} mt-3 text-foreground`}>
            {project.outcome}
          </p>

          {project.phaseNotes?.map((note) => (
            <div key={note.label} className={`${copy} mt-8`}>
              <h2 className="type-label">{note.label}</h2>
              <p className="type-body mt-3 text-foreground">{note.body}</p>
            </div>
          ))}

          <ProjectMediaRows
            rows={rest}
            label={workDetailPage.stillsAria(project.name)}
          />

          <nav className="mt-12" aria-label={workDetailPage.adjacentAria}>
            {prev ? (
              <Link href={`/work/${prev.slug}`} className={linkClass}>
                ← {prev.name}
              </Link>
            ) : null}
            {next ? (
              <NextProjectPanel
                project={next}
                label={workDetailPage.nextLabel}
              />
            ) : null}
          </nav>
        </div>

        <SiteCloser route="work-detail" />
      </PageShell>
    </>
  );
}
