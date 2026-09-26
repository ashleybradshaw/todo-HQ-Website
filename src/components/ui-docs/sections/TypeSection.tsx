"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { UiSectionFrame } from "@/components/ui-docs/UiSectionFrame";
import { SNIPPETS } from "@/lib/ui-docs/snippets";
import { TYPE_CLASSES, type TypeClassName } from "@/lib/ui-docs/tokenRegistry";
import { useSpray } from "@/components/SprayProvider";

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
    <div className="min-w-0 border-b border-border-ide py-4 last:border-b-0">
      <p className="font-jetbrains type-caption text-muted mb-2">
        .{className} · {metrics}
      </p>
      <p ref={ref} className={`${className} text-foreground min-w-0 break-words`}>
        {/* // TEST COPY */}
        {SPECIMEN[className]}
      </p>
    </div>
  );
}

export function TypeSection() {
  return (
    <UiSectionFrame
      comment="// Type — Unbounded + JetBrains scale. TEST COPY."
      code={SNIPPETS.type}
      example={
        <div className="min-w-0">
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[4px] border border-border-ide p-4">
              <p className="type-label text-muted mb-2">Unbounded</p>
              <p className="type-heading text-foreground">Aa Bb Cc</p>
            </div>
            <div className="rounded-[4px] border border-border-ide p-4">
              <p className="type-label text-muted mb-2">JetBrains Mono</p>
              <p className="type-body text-foreground">Aa Bb Cc 0123</p>
            </div>
          </div>
          {TYPE_CLASSES.map((name) => (
            <TypeRow key={name} className={name} />
          ))}
        </div>
      }
    />
  );
}
