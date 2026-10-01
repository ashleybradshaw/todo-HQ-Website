import { SprayCanIcon } from "@animateicons/react/lucide";
import { MetricChips } from "@/components/ui-docs/spec/MetricChips";
import { SpecBox } from "@/components/ui-docs/spec/SpecBox";
import { SpecSection } from "@/components/ui-docs/spec/SpecSection";
import { cn } from "@/lib/cn";
import { uiPage } from "@/content/pages/ui";

const outlineBase =
  "relative inline-flex items-center justify-center overflow-hidden rounded-[4px] border border-current font-jetbrains font-bold tracking-wider uppercase";

const ghostBase =
  "inline-flex items-center justify-center rounded-[4px] font-jetbrains text-xs font-bold tracking-wider uppercase";

const softBase =
  "inline-flex items-center justify-center rounded-[4px] border border-current bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] font-jetbrains text-xs font-bold tracking-wider text-on-tint";

type ForceState = "default" | "hover" | "focus" | "disabled";

function forceClass(state: ForceState) {
  switch (state) {
    case "hover":
      return "text-brand-logo";
    case "focus":
      return "ring-[3px] ring-current outline-none";
    case "disabled":
      return "cursor-not-allowed text-muted";
    default:
      return "";
  }
}

function SprayLike({
  state,
  size = "md",
}: {
  state: ForceState;
  size?: "sm" | "md" | "lg";
}) {
  const pad =
    size === "sm"
      ? "gap-1.5 px-2 py-1 text-[10px]"
      : size === "lg"
        ? "gap-2 px-4 py-2.5 text-sm"
        : "gap-1.5 px-3 py-1.5 text-xs";
  return (
    <span
      className={cn(outlineBase, pad, forceClass(state))}
      aria-hidden="true"
    >
      <SprayCanIcon size={size === "lg" ? 18 : 14} color="currentColor" isAnimated={false} />
      Spray
      {state !== "disabled" ? (
        <>
          <span className="spray-shine-wash" />
          <span className="spray-shine-edge" />
        </>
      ) : null}
    </span>
  );
}

function OutlineBtn({ state }: { state: ForceState }) {
  return (
    <span
      className={cn(outlineBase, "px-3 py-1.5 text-xs", forceClass(state))}
      aria-hidden="true"
    >
      Outline
    </span>
  );
}

function GhostBtn({ state }: { state: ForceState }) {
  return (
    <span className={cn(ghostBase, "px-3 py-1.5", forceClass(state))} aria-hidden="true">
      Ghost
    </span>
  );
}

function IconOnly({ state }: { state: ForceState }) {
  return (
    <span
      className={cn(
        softBase,
        "size-9",
        forceClass(state),
      )}
      aria-hidden="true"
    >
      <SprayCanIcon size={16} color="currentColor" isAnimated={false} />
    </span>
  );
}

const STATES: ForceState[] = ["default", "hover", "focus", "disabled"];
const ROWS = [
  { label: "Spray CTA", render: (s: ForceState) => <SprayLike state={s} /> },
  { label: "Outline", render: (s: ForceState) => <OutlineBtn state={s} /> },
  { label: "Ghost", render: (s: ForceState) => <GhostBtn state={s} /> },
  { label: "Icon-only", render: (s: ForceState) => <IconOnly state={s} /> },
] as const;

export function ButtonsSpec() {
  const { buttons } = uiPage.sections;

  return (
    <SpecSection
      eyebrow={buttons.eyebrow}
      metric={buttons.metric}
      title={buttons.title}
      description={buttons.description}
    >
      <div className="flex min-w-0 flex-col gap-6">
        <SpecBox variant="master" caption="// sizes">
          <div className="flex flex-wrap items-end gap-4">
            <SprayLike state="default" size="sm" />
            <SprayLike state="default" size="md" />
            <SprayLike state="default" size="lg" />
          </div>
          <MetricChips
            name="sizes"
            values={["sm", "md", "lg"]}
            className="mt-4"
          />
        </SpecBox>

        <SpecBox caption="// states matrix">
          {/* Desktop header */}
          <div className="border-border-ide mb-3 hidden grid-cols-5 gap-2 border-b pb-2 md:grid">
            <span className="type-label text-muted">Style</span>
            {STATES.map((s) => (
              <span key={s} className="type-label text-muted capitalize">
                {s}
              </span>
            ))}
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            {ROWS.map((row) => (
              <div key={row.label} className="min-w-0">
                <p className="type-label text-muted mb-2 md:hidden">{row.label}</p>
                <div className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-5 md:items-center">
                  <span className="type-label text-foreground hidden md:block">
                    {row.label}
                  </span>
                  {STATES.map((state) => (
                    <div
                      key={state}
                      className="border-border-ide flex min-w-0 flex-col items-start gap-1 rounded-[4px] border p-2 md:border-0 md:p-0"
                    >
                      <span className="type-caption text-muted capitalize md:hidden">
                        {state}
                      </span>
                      {row.render(state)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SpecBox>
      </div>
    </SpecSection>
  );
}
