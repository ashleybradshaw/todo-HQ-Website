import { MetricChips } from "@/components/ui-docs/spec/MetricChips";
import { SpecBox } from "@/components/ui-docs/spec/SpecBox";
import { SpecSection } from "@/components/ui-docs/spec/SpecSection";
import { Bone } from "@/components/ui-docs/spec/Bone";
import { cn } from "@/lib/cn";
import { uiPage } from "@/content/pages/ui";

type InputState = "default" | "hover" | "typing";
type InputVariant = "icon-addon" | "icon" | "addon" | "plain";

const STATES: InputState[] = ["default", "hover", "typing"];
const VARIANTS: { id: InputVariant; label: string }[] = [
  { id: "icon-addon", label: "Icon + addon" },
  { id: "icon", label: "Icon only" },
  { id: "addon", label: "Addon only" },
  { id: "plain", label: "Plain" },
];

function MockInput({
  state,
  variant,
  id,
}: {
  state: InputState;
  variant: InputVariant;
  id: string;
}) {
  const showIcon = variant === "icon-addon" || variant === "icon";
  const showAddon = variant === "icon-addon" || variant === "addon";
  const value = state === "typing" ? "Sample value" : "";

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="type-label text-muted mb-1.5 block">
        Label
      </label>
      <div
        className={cn(
          "border-border-ide flex min-w-0 items-center gap-2 rounded-[4px] border px-2.5 py-2",
          state === "hover" && "border-current",
          state === "typing" && "border-current",
        )}
      >
        {showIcon ? <Bone className="size-4 shrink-0" /> : null}
        <span className="font-jetbrains relative min-w-0 flex-1 truncate text-xs text-foreground">
          {value || <span className="text-muted">Placeholder</span>}
          {state === "typing" ? (
            <span
              aria-hidden="true"
              className="bg-foreground ml-0.5 inline-block h-3 w-px align-middle"
            />
          ) : null}
        </span>
        {showAddon ? (
          <span className="type-caption text-muted shrink-0">.com</span>
        ) : null}
        <input
          id={id}
          readOnly
          tabIndex={-1}
          value={value}
          className="sr-only"
          aria-hidden="true"
        />
      </div>
      <p className="type-caption text-muted mt-1.5">Helper text</p>
    </div>
  );
}

export function InputsSpec() {
  const { inputs } = uiPage.sections;

  return (
    <SpecSection
      id="ui-inputs"
      eyebrow={inputs.eyebrow}
      metric={inputs.metric}
      title={inputs.title}
      description={inputs.description}
    >
      <div className="flex min-w-0 flex-col gap-6">
        <MetricChips
          name="shell"
          values={["radius 4", "border 1", "JetBrains"]}
        />

        {VARIANTS.map((variant) => (
          <div key={variant.id} className="min-w-0">
            <p className="type-label text-muted mb-3">{variant.label}</p>
            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {STATES.map((state) => (
                <SpecBox key={state} caption={state}>
                  <MockInput
                    state={state}
                    variant={variant.id}
                    id={`ui-input-${variant.id}-${state}`}
                  />
                </SpecBox>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SpecSection>
  );
}
