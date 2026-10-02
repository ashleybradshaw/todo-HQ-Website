import type { ReactNode } from "react";
import { BrowserFrame } from "@/components/work/BrowserFrame";
import { Bone } from "@/components/ui-docs/spec/Bone";
import { MetricChips } from "@/components/ui-docs/spec/MetricChips";
import { SpecBox } from "@/components/ui-docs/spec/SpecBox";
import { SpecGrid } from "@/components/ui-docs/spec/SpecGrid";
import { SpecSection } from "@/components/ui-docs/spec/SpecSection";
import { uiPage } from "@/content/pages/ui";

const PART_CHIPS = ["radius 4", "border 1", "pad 16"] as const;

function PartShell({
  caption,
  children,
}: {
  caption: string;
  children: ReactNode;
}) {
  return (
    <SpecBox caption={caption} className="flex min-w-0 flex-col gap-3">
      {children}
      <MetricChips name="spec" values={PART_CHIPS} />
    </SpecBox>
  );
}

export function ComponentsSpec() {
  const { components } = uiPage.sections;

  return (
    <SpecSection
      eyebrow={components.eyebrow}
      metric={components.metric}
      title={components.title}
      description={components.description}
    >
      <SpecGrid cols={3}>
        <PartShell caption="// browser frame">
          <BrowserFrame
            alt="Ghost browser frame"
            caption="preview"
            ratio="16:9"
            sizes="(min-width:768px) 686px, calc(100vw - 50px)"
          >
            <div className="absolute inset-0 flex flex-col gap-2 p-3">
              <Bone className="h-3 w-1/3" />
              <Bone className="h-full min-h-[4rem] w-full flex-1" />
            </div>
          </BrowserFrame>
        </PartShell>

        <PartShell caption="// project card">
          <div className="border-border-ide flex min-w-0 flex-col gap-2 rounded-[4px] border p-3">
            <Bone className="aspect-video w-full" />
            <Bone className="h-3 w-20" />
            <Bone className="h-4 w-2/3" />
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-3/4" />
          </div>
        </PartShell>

        <PartShell caption="// blog note">
          <div className="border-border-ide flex min-w-0 flex-col gap-2 rounded-[4px] border p-3">
            <Bone className="h-3 w-16" />
            <Bone className="h-5 w-4/5" />
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-2/3" />
          </div>
        </PartShell>

        <PartShell caption="// chips / tags">
          <div className="flex flex-wrap gap-2">
            <Bone className="h-6 w-16" />
            <Bone className="h-6 w-20" />
            <Bone className="h-6 w-14" />
            <Bone className="h-6 w-24" />
          </div>
        </PartShell>

        <PartShell caption="// status dots">
          <ul className="flex flex-col gap-2">
            <li className="flex items-center gap-2">
              <span
                className="bg-syn-string size-2 rounded-full"
                aria-hidden="true"
              />
              <Bone className="h-3 w-24" />
            </li>
            <li className="flex items-center gap-2">
              <span
                className="bg-foreground size-2 rounded-full"
                aria-hidden="true"
              />
              <Bone className="h-3 w-28" />
            </li>
            <li className="flex items-center gap-2">
              <span
                className="bg-[var(--status-pending)] size-2 rounded-full"
                aria-hidden="true"
              />
              <Bone className="h-3 w-20" />
            </li>
          </ul>
        </PartShell>

        <PartShell caption="// nav pill">
          <div className="border-border-ide inline-flex items-center gap-2 rounded-[4px] border px-3 py-2">
            <Bone className="size-4 shrink-0 rounded-full" />
            <Bone className="h-3 w-20" />
            <Bone className="h-3 w-12" />
          </div>
        </PartShell>
      </SpecGrid>
    </SpecSection>
  );
}
