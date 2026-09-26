import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import {
  getProject,
  getProjectSlugs,
  PROJECT_STATUS_LABEL,
  projectHasPage,
} from "@/lib/projects";

export const alt = "Work project";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

type OgParams = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: OgParams) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project || !projectHasPage(project)) {
    notFound();
  }

  const fontData = await readFile(
    path.join(process.cwd(), "src/fonts/Unbounded-Bold.woff"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "#DDDDFF",
          color: "#4545FF",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Unbounded",
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {project.name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            padding: "8px 14px",
            border: "1px solid #4545FF",
            borderRadius: 4,
            fontFamily: "Unbounded",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.04em",
            width: "auto",
          }}
        >
          {PROJECT_STATUS_LABEL[project.status]}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Unbounded",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
