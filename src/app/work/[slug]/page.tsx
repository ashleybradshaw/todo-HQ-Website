import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/PageShell";
import { SiteCloser } from "@/components/SiteCloser";
import { ProjectGlyphField } from "@/components/work/ProjectGlyphField";
import { ProjectMediaRows } from "@/components/work/ProjectMediaRows";
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
  "type-label inline-flex min-h-6 items-center font-normal normal-case tracking-normal underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

function adjacentProjects(slug: string) {
  const pages = getPageProjects();
  const index = pages.findIndex((project) => project.slug === slug);
  if (index === -1) {
    return { prev: null, next: null };
  }
  return {
    prev: index > 0 ? pages[index - 1] : null,
    next: index < pages.length - 1 ? pages[index + 1] : null,
  };
}

export default async function WorkProjectPage({ params }: WorkProjectParams) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project || !projectHasPage(project)) {
    notFound();
  }

  const { prev, next } = adjacentProjects(project.slug);

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
        titleClassName="type-title mt-10 text-center text-balance tracking-tight"
        background={<ProjectGlyphField />}
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
          <div className={`${copy} mt-4 flex flex-col items-center gap-3`}>
            <ProjectStatusChip status={project.status} />
            {project.slug === "readygo" ? (
              // TEST COPY
              <p className="type-body-sm text-center text-foreground">
                {workDetailPage.readygoNote}
              </p>
            ) : null}
          </div>

          <p className={`type-body ${copy} mt-6 text-center text-foreground`}>
            {project.description}
          </p>

          <ProjectSpec
            project={project}
            label={workDetailPage.specAria(project.name)}
          />

          <section
            aria-label={workDetailPage.metricsAria(project.name)}
            className={`${copy} mt-8`}
          >
            <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
              {project.metrics.map((metric) => (
                <li key={metric.label} className="flex items-baseline gap-2">
                  <CountUp
                    variant="literal"
                    value={metric.value}
                    prefix={metric.prefix}
                    suffix={metric.suffix}
                  />
                  <span className="font-jetbrains text-syn-comment text-xs">
                    {metric.label}
                  </span>
                </li>
              ))}
            </ul>
          </section>

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
            project={project}
            label={workDetailPage.stillsAria(project.name)}
          />

          <nav
            className={`border-border-ide ${copy} mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-6`}
            aria-label={workDetailPage.adjacentAria}
          >
            {prev ? (
              <Link href={`/work/${prev.slug}`} className={linkClass}>
                ← {prev.name}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/work/${next.slug}`} className={linkClass}>
                {next.name} →
              </Link>
            ) : null}
          </nav>
        </div>

        <SiteCloser route="work-detail" />
      </PageShell>
    </>
  );
}
