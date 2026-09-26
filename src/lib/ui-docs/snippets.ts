/** Usage snippets for Code tabs. // TEST COPY */

export const SNIPPETS = {
  colors: `/* Live CSS variables — never hard-code hex on factory pages */
.card {
  background: var(--bg-canvas);
  color: var(--foreground);
  border: 1px solid var(--border-ide);
}
.tint-cta {
  color: var(--text-on-tint);
  background: color-mix(in srgb, var(--foreground) 8%, transparent);
}`,
  type: `{/* Display = Unbounded; body/prose/meta = JetBrains */}
<h1 className="type-display">Factory</h1>
<p className="type-body">Global body is 16/24.</p>
<article className="type-prose">Article prose only.</article>
<span className="type-label">Status</span>`,
  spacing: `{/* Radius 4px · borders via --border-ide · focus ring 3px */}
<button
  className="rounded-[4px] border border-border-ide
    focus-visible:ring-[3px] focus-visible:ring-current
    focus-visible:outline-none"
>
  Focus me
</button>`,
  motion: `{/* 400ms · CSS only · honour prefers-reduced-motion */}
<button className="transition-opacity duration-[400ms] ease-in-out hover:opacity-80">
  Soft fade
</button>
<span className="status-dot-pulse fill-syn-string" />
<span className="spray-shine-wash" />`,
  icons: `import { SprayCanIcon } from "@animateicons/react/lucide";
{/* Product logos: CSS mask on /logos/*.svg */}
{/* Stack: CSS mask on /stack/*.svg */}`,
  components: `import { SprayButton } from "@/components/SprayButton";
import { Telemetry } from "@/components/Telemetry";
import { ProjectStatusChip } from "@/components/work/ProjectStatusChip";
import { TypeComment } from "@/components/TypeComment";
import { FloorGhostDuo } from "@/components/ide/FloorGhost";

<SprayButton />
<Telemetry agents={3} />
<ProjectStatusChip status="shipped" />
<TypeComment text="// Comment header" />
<FloorGhostDuo />`,
  rules: `# House rules live in .cursor/rules/design-system.mdc
# and globals.css — this page reads live tokens so it cannot drift.`,
} as const;
