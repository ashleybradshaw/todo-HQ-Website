import { SpecSection } from "@/components/ui-docs/spec/SpecSection";
import {
  UI_SAMPLE_PROJECT,
  UI_SAMPLE_QUEUED,
} from "@/components/ui-docs/spec/fixtures";
import { ProjectCard } from "@/components/ProjectCard";
import { CountUp } from "@/components/work/CountUp";
import { LIVE_METRIC_LABEL } from "@/components/work/ProjectSpecPanel";
import { NextProjectPanel } from "@/components/work/NextProjectPanel";
import { ProjectSpecPanel } from "@/components/work/ProjectSpecPanel";
import { ProjectStatusChip } from "@/components/work/ProjectStatusChip";
import { QueuedProjectList } from "@/components/work/QueuedProjectList";
import { uiPage } from "@/content/pages/ui";

const STATUSES = ["shipped", "building", "live", "pipeline"] as const;

export function WorkPartsSpec() {
  const { work } = uiPage.sections;

  return (
    <SpecSection
      id="ui-work"
      eyebrow={work.eyebrow}
      metric={work.metric}
      title={work.title}
      description={work.description}
    >
      <div className="flex min-w-0 flex-col gap-10">
        <ul className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
          <li className="h-full">
            <ProjectCard project={UI_SAMPLE_PROJECT} prefetch={false} />
          </li>
          <li className="h-full lg:col-span-2">
            <ProjectCard project={UI_SAMPLE_PROJECT} wide prefetch={false} />
          </li>
        </ul>

        <QueuedProjectList projects={[UI_SAMPLE_QUEUED]} label="// Queued" />

        <ProjectSpecPanel project={UI_SAMPLE_PROJECT} label="Specimen spec" />

        <div>
          <CountUp value={300} variant="stat" live />
          <p className="type-caption text-muted mt-2">{LIVE_METRIC_LABEL}</p>
          <p className="type-caption text-muted mt-2">
            Drifts by 1 to 3 after it settles, within 2% of the value. Reduced
            motion stays on the real number.
          </p>
        </div>

        <ul className="flex flex-wrap gap-2">
          {STATUSES.map((status) => (
            <li key={status}>
              <ProjectStatusChip status={status} />
            </li>
          ))}
        </ul>

        <NextProjectPanel
          project={UI_SAMPLE_PROJECT}
          label="Next specimen"
          prefetch={false}
        />
      </div>
    </SpecSection>
  );
}
