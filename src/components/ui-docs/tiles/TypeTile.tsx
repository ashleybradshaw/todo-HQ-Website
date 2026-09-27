"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useSpray } from "@/components/SprayProvider";
import { UiTile } from "@/components/ui-docs/UiTile";
import { TYPE_CLASSES, type TypeClassName } from "@/lib/ui-docs/tokenRegistry";
import { uiPage } from "@/content/pages/ui";

const SPECIMEN: Record<TypeClassName, string> = {
  "type-display": "Display",
  "type-title": "Title",
  "type-heading": "Heading",
  "type-subhead": "Subhead",
  "type-body": "Body — global 16/24. JetBrains.",
  "type-prose": "Prose — articles only. Slightly larger leading.",
  "type-body-sm": "Body small",
  "type-meta": "Meta · timestamp",
  "type-caption": "Caption",
  "type-label": "Label",
  "type-code": "code.specimen()",
};

function TypeRow({ className }: { className: TypeClassName }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [metrics, setMetrics] = useState("—");
  const { pair } = useSpray();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const frame = requestAnimationFrame(() => {
      const styles = getComputedStyle(el);
      const family =
        styles.fontFamily.split(",")[0]?.replace(/['"]/g, "") ?? "";
      setMetrics(`${styles.fontSize} / ${styles.lineHeight} · ${family}`);
    });
    return () => cancelAnimationFrame(frame);
  }, [pair.bg, pair.text]);

  return (
    <div className="border-border-ide min-w-0 border-b py-3 last:border-b-0">
      <p className="font-jetbrains type-caption text-muted mb-1">
        .{className} · {metrics}
      </p>
      <p
        ref={ref}
        className={`${className} text-foreground min-w-0 break-words`}
      >
        {/* // TEST COPY */}
        {SPECIMEN[className]}
      </p>
    </div>
  );
}

export function TypeTile() {
  const { type } = uiPage.tiles;

  return (
    <UiTile title={type.title} description={type.description}>
      <div className="min-w-0">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="border-border-ide rounded-[4px] border p-3">
            <p className="type-label text-muted mb-2">Unbounded</p>
            <p className="type-heading text-foreground">Aa Bb Cc</p>
          </div>
          <div className="border-border-ide rounded-[4px] border p-3">
            <p className="type-label text-muted mb-2">JetBrains Mono</p>
            <p className="type-body text-foreground">Aa Bb Cc 0123</p>
          </div>
        </div>
        <div className="max-h-[22rem] overflow-y-auto">
          {TYPE_CLASSES.map((name) => (
            <TypeRow key={name} className={name} />
          ))}
        </div>
      </div>
    </UiTile>
  );
}
