import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/PageShell";
import { SiteCloser } from "@/components/SiteCloser";
import { BrowserFrame } from "@/components/work/BrowserFrame";
import { ProjectGlyphField } from "@/components/work/ProjectGlyphField";
import {
  getProject,
  getProjectSlugs,
  type Project,
  type ProjectMediaOffset,
  type ProjectMediaWidth,
} from "@/lib/projects";
import { cn } from "@/lib/cn";
import { pageMetadata } from "@/lib/seo";
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
  if (!project) {
    return pageMetadata({
      title: "Not found",
      description: "This factory project does not exist.",
      path: `/work/${slug}`,
      index: false,
    });
  }

  return pageMetadata({
    title: `${project.name} · Work`,
    description: project.description,
    path: `/work/${project.slug}`,
    index: project.listed,
  });
}

function projectJsonLd(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.name,
    description: project.description,
    url: `${SITE_URL}/work/${project.slug}`,
  };
}

/**
 * B2.1 zigzag ladder — PARKED (T3 Essay lead).
 * Revive by applying ladderClass(item.width, item.offset) on BrowserFrame
 * and switching PageShell back to variant="essayMedia".
 */
function ladderClass(
  width: ProjectMediaWidth,
  offset: ProjectMediaOffset,
): string {
  const size =
    width === "hero"
      ? "w-full md:w-[60%]"
      : width === "support"
        ? "w-full md:w-[44%]"
        : "w-full md:w-[28%]";

  if (offset === "center") {
    return cn(size, "md:mx-auto");
  }

  if (offset === "left") {
    const inset =
      width === "hero"
        ? "md:ml-[8%] md:mr-auto"
        : width === "support"
          ? "md:ml-[22%] md:mr-auto"
          : "md:ml-[36%] md:mr-auto";
    return cn(size, inset);
  }

  const inset =
    width === "hero"
      ? "md:ml-auto md:mr-[8%]"
      : width === "support"
        ? "md:ml-auto md:mr-[22%]"
        : "md:ml-auto md:mr-[36%]";
  return cn(size, inset);
}

// Retain helper for revive; T3 Essay stack does not call it.
void ladderClass;

/** T3 Essay drill — centred stack in the 688 copy column (no zigzag). */
const ESSAY_FRAME = "w-full max-w-[688px] mx-auto";

const linkClass =
  "type-label font-normal normal-case tracking-normal underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

const ctaClass =
  "type-label inline-flex min-h-11 items-center justify-center rounded-[4px] border border-border-ide bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-2 text-syn-keyword transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

export default async function WorkProjectPage({ params }: WorkProjectParams) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) {
    notFound();
  }

  return (
    <>
      <JsonLd data={projectJsonLd(project)} />
      <PageShell
        variant="essay"
        title={project.name}
        titleClassName="type-title mt-10 text-center text-balance tracking-tight"
        background={<ProjectGlyphField />}
        breadcrumbs={
          <Breadcrumbs
            parent={{ href: "/work", label: "Work" }}
            current={project.name}
          />
        }
      >
        {/* Micro-study — blog-article Essay rhythm (centred header + column). */}
        <div className="mt-6">
          <p className="type-body mx-auto max-w-[688px] text-center text-foreground">
            {project.description}
          </p>

          <ul
            className="mt-5 flex flex-wrap justify-center gap-1.5"
            aria-label={`${project.name} stack`}
          >
            {project.stack.map((item) => (
              <li
                key={item}
                className="type-label border-border-ide text-syn-comment rounded-[4px] border px-2 py-0.5"
              >
                {item}
              </li>
            ))}
          </ul>

          <ul className="type-body mx-auto mt-6 max-w-[688px] list-disc space-y-1.5 pl-5 text-foreground">
            {project.scope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <p className="type-meta text-syn-string mx-auto mt-5 max-w-[688px] opacity-90">
            {project.outcome}
          </p>
        </div>

        <section
          className="mt-12 flex min-w-0 flex-col gap-8"
          aria-label={`${project.name} stills`}
        >
          {project.media.map((item, index) => (
            <div
              key={item.id}
              className={cn("work-frame-enter min-w-0", ESSAY_FRAME)}
              style={{ "--work-frame-i": index } as CSSProperties}
            >
              <BrowserFrame
                src={item.src}
                alt={item.alt}
                caption={item.caption}
                aspect={item.aspect}
                className="w-full"
              />
            </div>
          ))}
        </section>

        <div className="border-border-ide mx-auto mt-12 flex max-w-[688px] flex-wrap items-center gap-4 border-t pt-6">
          <Link href="/book" className={ctaClass}>
            Book team
          </Link>
          <Link href="/work" className={linkClass}>
            ← Work
          </Link>
        </div>
        <SiteCloser variant="book" />
      </PageShell>
    </>
  );
}
