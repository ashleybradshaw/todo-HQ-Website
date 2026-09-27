import { Bone } from "@/components/ui-docs/spec/Bone";
import { MetricChips } from "@/components/ui-docs/spec/MetricChips";
import { SpecBox } from "@/components/ui-docs/spec/SpecBox";
import { SpecSection } from "@/components/ui-docs/spec/SpecSection";
import { uiPage } from "@/content/pages/ui";

const LADDER = [
  { px: "4px", rem: "0.25rem" },
  { px: "8px", rem: "0.5rem" },
  { px: "12px", rem: "0.75rem" },
  { px: "16px", rem: "1rem" },
  { px: "24px", rem: "1.5rem" },
  { px: "32px", rem: "2rem" },
  { px: "48px", rem: "3rem" },
  { px: "64px", rem: "4rem" },
] as const;

export function GridSpacingSpec() {
  const { grid } = uiPage.sections;

  return (
    <SpecSection
      eyebrow={grid.eyebrow}
      metric={grid.metric}
      title={grid.title}
      description={grid.description}
    >
      <div className="flex min-w-0 flex-col gap-6">
        <SpecBox variant="master" caption="// 12 columns">
          <div className="grid min-w-0 grid-cols-6 gap-1.5 sm:grid-cols-8 sm:gap-2 lg:grid-cols-12">
            {Array.from({ length: 12 }, (_, i) => (
              <Bone key={i} className="h-16 min-w-0 sm:h-20" />
            ))}
          </div>
          <p className="type-caption text-muted mt-3">
            {/* // TEST COPY */}
            6 cols mobile · 8 tablet · 12 desktop
          </p>
        </SpecBox>

        <SpecBox caption="// spacing ladder">
          <ul className="space-y-2.5">
            {LADDER.map((step) => (
              <li
                key={step.px}
                className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3"
              >
                <MetricChips name={step.px} values={[step.rem]} />
                <Bone
                  className="h-3 shrink-0"
                  style={{ width: step.px, height: "12px" }}
                />
              </li>
            ))}
          </ul>
        </SpecBox>
      </div>
    </SpecSection>
  );
}
