import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { DetailHero } from "@/components/detail/DetailHero";
import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/PageShell";
import { SiteCloser } from "@/components/SiteCloser";
import { NextProjectPanel } from "@/components/work/NextProjectPanel";
import { ProjectGlyphField } from "@/components/work/ProjectGlyphField";
import { ProjectMediaRows } from "@/components/work/ProjectMediaRows";
import {
  ContributionGraph,
  contributionLegend,
} from "@/components/work/ContributionGraph";
import { ProjectSpecPanel } from "@/components/work/ProjectSpecPanel";
import { getContributions } from "@/lib/contributions";
import {
  getPageProjects,
  getProject,
  getProjectSlugs,
  projectHasPage,
  type FullProject,
  type ProjectMediaItem,
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
  const sameAs = project.spec.links?.map((link) => link.href) ?? [];
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.name,
    description: project.description,
    url: `${SITE_URL}/work/${project.slug}`,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

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

function stillSrc(item: ProjectMediaItem) {
  return item.kind === "video" ? (item.poster ?? item.src) : item.src;
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
  const contributions = getContributions(project.slug);

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
        variant="essay"
        constrainCopy={false}
        background={<ProjectGlyphField />}
        anchorId="work-article-body"
      >
        <NavTrail
          parentHref="/work"
          parentLabel={workDetailPage.breadcrumbWork}
          current={project.name}
          progressId="work-article-body"
        />
        <DetailHeader
          title={project.name}
          breadcrumbs={
            <Breadcrumbs
              parent={{ href: "/work", label: workDetailPage.breadcrumbWork }}
              current={project.name}
            />
          }
          meta={
            <div className="flex flex-col items-center gap-3 text-center">
              <p>{project.cardDescription}</p>
              {project.slug === "readygo" ? (
                <p>{workDetailPage.readygoNote}</p>
              ) : null}
            </div>
          }
        />
        {hero ? (
          <DetailHero
            src={stillSrc(hero)}
            alt={hero.alt}
            caption={hero.caption}
          />
        ) : null}
        <ProjectSpecPanel
          project={project}
          label={workDetailPage.specAria(project.name)}
          activity={
            contributions ? (
              <ContributionGraph contributions={contributions} />
            ) : null
          }
          activityLegend={
            contributions ? contributionLegend(contributions.source) : null
          }
        />
        <div
          data-detail-copy
          className="type-body mx-auto mt-16 w-full max-w-[688px] text-left"
        >
          <p>{project.description}</p>
          <h2 className="type-label mt-8">{workDetailPage.scopeHeading}</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            {project.scope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h2 className="type-label mt-8">{workDetailPage.outcomeHeading}</h2>
          <p className="mt-3">{project.outcome}</p>
          {project.phaseNotes?.map((note) => (
            <div key={note.label} className="mt-8">
              <h2 className="type-label">{note.label}</h2>
              <p className="mt-3">{note.body}</p>
            </div>
          ))}
        </div>
        <ProjectMediaRows
          rows={rest}
          label={workDetailPage.stillsAria(project.name)}
        />
        <nav className="mt-16" aria-label={workDetailPage.adjacentAria}>
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
        <SiteCloser route="work-detail" />
      </PageShell>
    </>
  );
}
