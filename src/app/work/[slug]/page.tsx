import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/PageShell";
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

const WIDTH_CLASS: Record<ProjectMediaWidth, string> = {
  hero: "w-full max-w-[1000px]",
  support: "w-full max-w-[760px]",
  tall: "w-full max-w-[520px]",
};

const OFFSET_CLASS: Record<ProjectMediaOffset, string> = {
  left: "mr-auto",
  center: "mx-auto",
  right: "ml-auto",
};

const linkClass =
  "font-jetbrains text-xs underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

const ctaClass =
  "font-jetbrains inline-flex min-h-11 items-center justify-center rounded-[4px] border border-border-ide bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-2 text-xs font-bold text-syn-keyword transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

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
        wide
        headerClassName="max-w-[760px]"
        eyebrow="WORK //"
        title={project.name}
        background={<ProjectGlyphField />}
        lede={
          <p className="font-sans text-base leading-7">{project.description}</p>
        }
      >
        <div className="max-w-[760px]">
          <ul
            className="mt-8 flex flex-wrap gap-2"
            aria-label={`${project.name} stack`}
          >
            {project.stack.map((item) => (
              <li
                key={item}
                className="font-jetbrains border-border-ide rounded-[4px] border px-2.5 py-1 text-[10px] tracking-wide uppercase"
              >
                {item}
              </li>
            ))}
          </ul>

          <ul className="mt-8 list-disc space-y-2 pl-5 font-sans text-base leading-7">
            {project.scope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <p className="font-jetbrains text-syn-string mt-8 text-xs">
            {project.outcome}
          </p>
        </div>

        <section
          className="mt-16 flex flex-col gap-12"
          aria-label={`${project.name} stills`}
        >
          {project.media.map((item) => (
            <BrowserFrame
              key={item.id}
              src={item.src}
              alt={item.alt}
              caption={item.caption}
              aspect={item.aspect}
              className={cn(WIDTH_CLASS[item.width], OFFSET_CLASS[item.offset])}
            />
          ))}
        </section>

        <div className="border-border-ide mt-16 flex max-w-[760px] flex-wrap items-center gap-4 border-t pt-6">
          <Link href="/book" className={ctaClass}>
            Book team
          </Link>
          <Link href="/work" className={linkClass}>
            ← Work
          </Link>
        </div>
      </PageShell>
    </>
  );
}
