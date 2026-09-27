import { SpecSection } from "@/components/ui-docs/spec/SpecSection";
import { uiPage } from "@/content/pages/ui";

const HOUSE_RULES = [
  "Blue #4545FF never recoloured as the house electric; powder #DFDFFF; logo #0B0CB4; muted #5A5A99; text-on-tint #3636FF (tinted cards/CTAs only).",
  "Status: online uses --syn-string, building uses --foreground, pending #F08C00 (--status-pending, never sprayed). Syntax colours as in globals.css.",
  "Unbounded for display hierarchy; JetBrains Mono for body/code. Global .type-body 16/24; .type-prose for articles only.",
  "4px radius, 400ms transitions, 3px focus rings (or outline-2 sibling pattern), spray CTAs.",
  "No blur anywhere except the existing nav backdrop-blur.",
  "Selection uses --selection-bg / --selection-fg (follows Spray).",
  "CSS/Tailwind motion only on this page — no new Framer Motion or GSAP for docs demos. Lucide/animateicons fine.",
  "WebP for raster; SVGs stripped of editor metadata. UK English.",
  "Spray randomize is unchanged on other pages; reset() only restores INNER_BRAND_PAIR.",
] as const;

export function RulesBand() {
  const { rules } = uiPage;

  return (
    <SpecSection
      eyebrow={rules.eyebrow}
      metric={rules.metric}
      title={rules.title}
      description={rules.description}
    >
      <ol className="type-body-sm text-foreground list-decimal space-y-2.5 pl-5">
        {HOUSE_RULES.map((rule) => (
          <li key={rule} className="min-w-0 break-words">
            {rule}
          </li>
        ))}
      </ol>
    </SpecSection>
  );
}
