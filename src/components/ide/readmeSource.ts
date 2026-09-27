import { homePage } from "@/content/pages/home";
import { PROJECTS } from "@/lib/projects";

const { todoHq } = homePage;

/** Production rows for README table (pipeline status excluded). */
export function inProductionProjects() {
  return PROJECTS.filter((project) => project.status !== "pipeline");
}

function productionStatusLabel(slug: string, status: keyof typeof todoHq.inProductionStatus) {
  return todoHq.inProductionDetail[slug] ?? todoHq.inProductionStatus[status];
}

/** Raw markdown lines generated from the same todoHq keys as Preview. */
export function buildReadmeSourceLines(): string[] {
  const lines: string[] = [
    todoHq.fileComment,
    "",
    `# ${todoHq.hook}`,
    "",
    todoHq.whoWeAre,
    "",
    todoHq.whatWeDoBest,
    "",
    `[${todoHq.primaryCta.label}](${todoHq.primaryCta.href}) · [${todoHq.secondaryCta.label}](${todoHq.secondaryCta.href})`,
    "",
    `## ${todoHq.whatWeBuildHeading}`,
    "",
    ...todoHq.whatWeBuild.map((item) => `- ${item}`),
    "",
    `## ${todoHq.whoWeShipForHeading}`,
    "",
    ...todoHq.whoWeShipFor.map((item) => `- ${item}`),
    "",
    `## ${todoHq.howWeWorkHeading}`,
    "",
    ...todoHq.howWeWork.map((item) => `- ${item}`),
    "",
    `## ${todoHq.pipelineHeading}`,
    "",
    todoHq.pipelineIntro,
    "",
    ...todoHq.pipeline.map((step) => `- \`${step.fn}\` — ${step.line}`),
    "",
    todoHq.methodologyLabel,
    "",
    `## ${todoHq.inProductionHeading}`,
    "",
    `| ${todoHq.inProductionColumns.project} | ${todoHq.inProductionColumns.status} |`,
    "| --- | --- |",
    ...inProductionProjects().map(
      (project) =>
        `| ${project.name} | ${productionStatusLabel(project.slug, project.status)} |`,
    ),
    "",
    todoHq.promise,
  ];

  return lines;
}

export function methodologySourceLineIndex(lines: readonly string[]): number {
  const index = lines.findIndex((line) => line.includes(todoHq.methodologyLabel));
  return index < 0 ? 0 : index;
}

export { productionStatusLabel };
