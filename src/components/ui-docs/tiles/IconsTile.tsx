"use client";

import { SprayCanIcon } from "@animateicons/react/lucide";
import { LOGO_PATHS, LOGO_VIEWBOX } from "@/components/LogoStatic";
import { UiTile } from "@/components/ui-docs/UiTile";
import { ICON_INVENTORY } from "@/lib/ui-docs/iconInventory";
import { uiPage } from "@/content/pages/ui";

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

export function IconsTile() {
  const { icons } = uiPage.tiles;

  return (
    <UiTile title={icons.title} description={icons.description}>
      <ul className="grid grid-cols-3 gap-2 min-[400px]:grid-cols-4 sm:grid-cols-4">
        {ICON_INVENTORY.map((icon) => (
          <li
            key={`${icon.kind}-${icon.name}`}
            className="border-border-ide flex min-w-0 flex-col items-center gap-1.5 rounded-[4px] border p-2"
          >
            <span
              className="flex size-8 items-center justify-center text-foreground"
              aria-hidden="true"
            >
              {icon.kind === "lucide" ? (
                <SprayCanIcon
                  size={22}
                  color="currentColor"
                  isAnimated={false}
                />
              ) : icon.kind === "lockup" ? (
                <LockupMark />
              ) : icon.src ? (
                <span
                  className="size-6 bg-foreground"
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
            <span className="font-jetbrains text-center text-[9px] leading-3 text-foreground break-words">
              {icon.name}
            </span>
          </li>
        ))}
      </ul>
    </UiTile>
  );
}
