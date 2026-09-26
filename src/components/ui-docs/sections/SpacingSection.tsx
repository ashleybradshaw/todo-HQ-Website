"use client";

import { UiSectionFrame } from "@/components/ui-docs/UiSectionFrame";
import { SNIPPETS } from "@/lib/ui-docs/snippets";
import { SPACING_STEPS } from "@/lib/ui-docs/tokenRegistry";

export function SpacingSection() {
  return (
    <UiSectionFrame
      comment="// Spacing & shape — Tailwind steps, 4px radius. TEST COPY."
      code={SNIPPETS.spacing}
      example={
        <div className="space-y-8 min-w-0">
          <div>
            <h3 className="type-label text-muted mb-3">Spacing scale</h3>
            <p className="type-caption text-syn-comment mb-4">
              {/* // TEST COPY */}
              Factory pages use Tailwind defaults. These are the steps that show
              up most often — not a separate token file.
            </p>
            <ul className="space-y-2">
              {SPACING_STEPS.map((step) => (
                <li
                  key={step.token}
                  className="font-jetbrains flex min-w-0 items-center gap-3 text-xs"
                >
                  <span className="text-muted w-10 shrink-0 tabular-nums">
                    {step.token}
                  </span>
                  <span
                    className="bg-foreground h-3 shrink-0 rounded-[1px]"
                    style={{ width: step.rem }}
                    aria-hidden="true"
                  />
                  <span className="text-foreground tabular-nums">
                    {step.rem} · {step.px}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="type-label text-muted mb-3">Radius · 4px</h3>
            <div className="flex flex-wrap gap-3">
              <div className="bg-foreground/15 size-16 rounded-[4px] border border-border-ide" />
              <p className="type-body-sm text-muted max-w-[14rem]">
                {/* // TEST COPY */}
                Convention: <code className="type-code">rounded-[4px]</code> —
                not a CSS variable yet.
              </p>
            </div>
          </div>

          <div>
            <h3 className="type-label text-muted mb-3">Borders</h3>
            <div className="rounded-[4px] border border-border-ide p-4">
              <p className="type-body-sm text-foreground">
                border-border-ide → var(--border-ide)
              </p>
            </div>
          </div>

          <div>
            <h3 className="type-label text-muted mb-3">
              Focus ring · 3px (tab here)
            </h3>
            <button
              type="button"
              className="font-jetbrains rounded-[4px] border border-current px-4 py-2 text-xs font-bold tracking-wider uppercase transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none"
            >
              Focus demo
            </button>
          </div>
        </div>
      }
    />
  );
}
