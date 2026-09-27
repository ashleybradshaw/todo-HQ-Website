"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSpray } from "@/components/SprayProvider";
import { MetricChips } from "@/components/ui-docs/spec/MetricChips";
import { SpecSection } from "@/components/ui-docs/spec/SpecSection";
import type { TypeClassName } from "@/lib/ui-docs/tokenRegistry";
import { uiPage } from "@/content/pages/ui";

const SPEC_STYLES: readonly {
  className: TypeClassName;
  sample: string;
}[] = [
  { className: "type-display", sample: "Display" },
  { className: "type-title", sample: "Title" },
  { className: "type-subhead", sample: "Subhead" },
  { className: "type-body", sample: "Body — global 16/24. JetBrains." },
  {
    className: "type-prose",
    sample: "Prose — articles only. Slightly larger leading.",
  },
  { className: "type-label", sample: "Label" },
  { className: "type-caption", sample: "Caption" },
  { className: "type-meta", sample: "Meta · timestamp" },
];

function formatPx(raw: string): string {
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return raw || "—";
  return `${Math.round(n * 100) / 100}px`;
}

function readTypeMetrics(el: HTMLElement) {
  const styles = getComputedStyle(el);
  const family =
    styles.fontFamily.split(",")[0]?.replace(/['"]/g, "").trim() || "—";
  const size = formatPx(styles.fontSize);
  const lead =
    styles.lineHeight === "normal"
      ? "normal"
      : formatPx(styles.lineHeight);
  const tracking =
    styles.letterSpacing === "normal" ? "0px" : formatPx(styles.letterSpacing);
  return {
    family,
    sizeLead: `${size} / ${lead}`,
    tracking,
  };
}

function TypeRow({
  className,
  sample,
}: {
  className: TypeClassName;
  sample: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [chips, setChips] = useState({
    family: "—",
    sizeLead: "—",
    tracking: "—",
  });
  const { pair } = useSpray();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useLayoutEffect(() => {
    if (!mounted) return;
    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    let raf1 = 0;
    let raf2 = 0;

    const apply = () => {
      if (cancelled || !ref.current) return;
      setChips(readTypeMetrics(ref.current));
    };

    // Double rAF so layout + webfonts have settled after the mounted gate.
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        apply();
        void document.fonts.ready.then(() => {
          if (!cancelled) apply();
        });
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [mounted, className, pair.bg, pair.text, sample]);

  return (
    <div className="border-border-ide flex min-w-0 flex-col gap-3 border-b py-4 last:border-b-0">
      <MetricChips
        name={`.${className}`}
        values={[chips.family, chips.sizeLead, chips.tracking]}
      />
      <p
        ref={ref}
        className={`${className} text-foreground min-w-0 break-words`}
      >
        {/* // TEST COPY */}
        {sample}
      </p>
    </div>
  );
}

export function TypeSpec() {
  const { type } = uiPage.sections;

  return (
    <SpecSection
      eyebrow={type.eyebrow}
      metric={type.metric}
      title={type.title}
      description={type.description}
    >
      <div className="min-w-0">
        {SPEC_STYLES.map((row) => (
          <TypeRow
            key={row.className}
            className={row.className}
            sample={row.sample}
          />
        ))}
      </div>
    </SpecSection>
  );
}
