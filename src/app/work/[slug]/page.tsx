import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/PageShell";
import {
  getProject,
  getProjectSlugs,
  type Project,
} from "@/lib/projects";
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
    title: project.name,
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
    image: `${SITE_URL}${project.imageSrc}`,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "iOS, Android, Web",
  };
}

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
        eyebrow={`CASE // ${project.slug}`}
        title={project.name}
        titleStyle="mono"
      >
        <div className="border-border-ide mt-6 aspect-[16/9] w-full overflow-hidden rounded-[4px] border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.imageSrc}
            alt={project.imageAlt}
            width={project.imageWidth}
            height={project.imageHeight}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {project.summary.map((paragraph) => (
            <p
              key={paragraph.slice(0, 24)}
              className="font-sans text-base leading-7 text-foreground"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {project.stack && project.stack.length > 0 ? (
          <ul
            className="mt-6 flex flex-wrap gap-2"
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
        ) : null}

        <p className="font-jetbrains text-syn-string mt-6 text-xs">
          {project.outcome}
        </p>

        <div className="border-border-ide mt-8 flex flex-wrap items-center gap-4 border-t pt-6">
          <Link href="/book" className={ctaClass}>
            Book team
          </Link>
          <Link href="/work" className={linkClass}>
            ← Back to work
          </Link>
        </div>
      </PageShell>
    </>
  );
}
