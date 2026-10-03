import { SpecSection } from "@/components/ui-docs/spec/SpecSection";
import { uiPage } from "@/content/pages/ui";

export function RulesBand() {
  const { rules } = uiPage;

  return (
    <SpecSection
      id="ui-rules"
      eyebrow={rules.eyebrow}
      metric={rules.metric}
      title={rules.title}
      description={rules.description}
    >
      <ol className="type-body-sm text-foreground list-decimal space-y-2.5 pl-5">
        {rules.items.map((rule) => (
          <li key={rule} className="min-w-0 break-words">
            {rule}
          </li>
        ))}
      </ol>
    </SpecSection>
  );
}
