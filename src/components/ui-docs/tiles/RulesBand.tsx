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

const KNOWN_DEBT = [
  "Triple source of truth: globals.css, accessibleColorPair.ts brand constants, and hard-coded landing hexes can drift — Colour tile flags brand-state CSS ≠ INNER_BRAND_PAIR.",
  "No --radius, --focus, or spacing CSS tokens yet — conventions only; focus split between ring-[3px] and outline-2.",
  "No shared Button primitive — CTA class strings are copy-pasted across Book, About, 404, Work.",
  "SectionTransitionGate still has a hard-coded BRIDGE_FALLBACK instead of always using --page-bridge.",
  "design-system.mdc still describes body as sans / controls as mono; runtime is Unbounded display + JetBrains body.",
  "Status online/building lack dedicated --status-* tokens (naming gap called out in Colour).",
  "PipelineRunner omitted from Components here so /ui does not pull Framer Motion weight onto this route.",
  "snippets.ts kept for reference but unused by the tile showcase.",
] as const;

export function RulesBand() {
  return (
    <footer className="border-border-ide mt-8 min-w-0 border-t pt-8 sm:mt-10 sm:pt-10">
      <h2 className="type-heading text-foreground mb-4">{uiPage.rules.title}</h2>
      <ol className="type-body-sm text-foreground list-decimal space-y-2.5 pl-5">
        {HOUSE_RULES.map((rule) => (
          <li key={rule} className="min-w-0 break-words">
            {rule}
          </li>
        ))}
      </ol>
      <h3 className="type-subhead text-foreground mt-8 mb-2">
        {uiPage.rules.debtTitle}{" "}
        <span className="type-meta text-syn-comment font-normal">
          {"// next pass"}
        </span>
      </h3>
      <p className="type-caption text-syn-comment mb-3">
        {/* // TEST COPY */}
        {uiPage.rules.debtNote}
      </p>
      <ul className="type-body-sm text-foreground list-disc space-y-2.5 pl-5">
        {KNOWN_DEBT.map((item) => (
          <li key={item} className="min-w-0 break-words">
            {item}
          </li>
        ))}
      </ul>
    </footer>
  );
}
