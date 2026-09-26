"use client";

import { SprayCanIcon } from "@animateicons/react/lucide";
import { LOGO_PATHS, LOGO_VIEWBOX } from "@/components/LogoStatic";
import { UiSectionFrame } from "@/components/ui-docs/UiSectionFrame";
import { ICON_INVENTORY } from "@/lib/ui-docs/iconInventory";
import { SNIPPETS } from "@/lib/ui-docs/snippets";

function LockupMark() {
  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      className="h-6 w-auto text-[var(--brand-logo)]"
      aria-hidden="true"
    >
      {LOGO_PATHS.map((glyph) => (
        <path key={glyph.id} d={glyph.d} fill="currentColor" />
      ))}
    </svg>
  );
}

export function IconsSection() {
  return (
    <UiSectionFrame
      comment="// Icons — Lucide in use + brand/stack SVGs. TEST COPY."
      code={SNIPPETS.icons}
      example={
        <div className="min-w-0">
          <p className="type-caption text-syn-comment mb-4">
            {/* // TEST COPY */}
            Lucide count in this repo: 1 (SprayCanIcon via @animateicons). No
            unused Lucide set imported.
          </p>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {ICON_INVENTORY.map((icon) => (
              <li
                key={`${icon.kind}-${icon.name}`}
                className="flex min-w-0 flex-col items-center gap-2 rounded-[4px] border border-border-ide p-3"
              >
                <span
                  className="flex size-10 items-center justify-center text-foreground"
                  aria-hidden="true"
                >
                  {icon.kind === "lucide" ? (
                    <SprayCanIcon
                      size={24}
                      color="currentColor"
                      isAnimated={false}
                    />
                  ) : icon.kind === "lockup" ? (
                    <LockupMark />
                  ) : icon.src ? (
                    <span
                      className="size-7 bg-foreground"
                      style={{
                        maskImage: `url(${icon.src})`,
                        WebkitMaskImage: `url(${icon.src})`,
                        maskSize: "contain",
                        WebkitMaskSize: "contain",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                        maskPosition: "center",
                        WebkitMaskPosition: "center",
                      }}
                    />
                  ) : null}
                </span>
                <span className="font-jetbrains text-center text-[10px] leading-4 text-foreground break-words">
                  {icon.name}
                </span>
                <span className="font-jetbrains text-muted text-[9px] uppercase tracking-wider">
                  {icon.kind}
                </span>
              </li>
            ))}
          </ul>
        </div>
      }
    />
  );
}
