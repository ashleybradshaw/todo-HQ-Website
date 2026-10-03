import { Bone } from "@/components/ui-docs/spec/Bone";
import { MetricChips } from "@/components/ui-docs/spec/MetricChips";
import { SpecBox } from "@/components/ui-docs/spec/SpecBox";
import { SpecSection } from "@/components/ui-docs/spec/SpecSection";
import { SPACING_STEPS } from "@/lib/ui-docs/tokenRegistry";
import { uiPage } from "@/content/pages/ui";

const FRAME = 1336;

const TRACKS = [
  { name: "Frame", px: 1336, note: "/work and /blog" },
  { name: "Reading", px: 800, note: "track" },
  { name: "Content", px: 752, note: "media" },
  { name: "Copy", px: 688, note: "column" },
  { name: "Hero sub", px: 592, note: "lede" },
] as const;

export function GridSpacingSpec() {
  const { layout } = uiPage.sections;

  return (
    <SpecSection
      id="ui-layout"
      eyebrow={layout.eyebrow}
      metric={layout.metric}
      title={layout.title}
      description={layout.description}
    >
      <div className="flex min-w-0 flex-col gap-6">
        <SpecBox variant="master" caption="// tracks, share of 1336">
          <ul className="flex min-w-0 flex-col gap-3">
            {TRACKS.map((track) => (
              <li key={track.name} className="min-w-0">
                <div
                  className="border-border-ide max-w-full border-b py-2"
                  style={{ width: `${(track.px / FRAME) * 100}%` }}
                >
                  <MetricChips
                    name={track.name}
                    values={[`${track.px}px`, track.note]}
                  />
                </div>
              </li>
            ))}
          </ul>
        </SpecBox>

        <SpecBox caption="// spacing ladder">
          <ul className="space-y-2.5">
            {SPACING_STEPS.map((step) => (
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
