"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSpray } from "@/components/SprayProvider";
import { MetricChips } from "@/components/ui-docs/spec/MetricChips";
import { SpecSection } from "@/components/ui-docs/spec/SpecSection";
import { TYPE_CLASSES, type TypeClassName } from "@/lib/ui-docs/tokenRegistry";
import { uiPage } from "@/content/pages/ui";

const SAMPLES: Record<TypeClassName, string> = {
  "type-display": "Display",
  "type-title": "Title",
  "type-heading": "Heading",
  "type-subhead": "Subhead",
  "type-body": "Body. Global 16/24. JetBrains.",
  "type-prose": "Prose. Articles only. Slightly larger leading.",
  "type-body-sm": "Body small",
  "type-meta": "Meta · timestamp",
  "type-caption": "Caption",
  "type-label": "Label",
  "type-code": "const ship = true",
};

function formatPx(raw: string): string {
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return raw || "unset";
  return `${Math.round(n * 100) / 100}px`;
}

function readTypeMetrics(el: HTMLElement) {
  const styles = getComputedStyle(el);
  const family =
    styles.fontFamily.split(",")[0]?.replace(/['"]/g, "").trim() || "unset";
  const size = formatPx(styles.fontSize);
  const lead =
    styles.lineHeight === "normal" ? "normal" : formatPx(styles.lineHeight);
  const tracking =
    styles.letterSpacing === "normal" ? "0px" : formatPx(styles.letterSpacing);
  return {
    family,
    sizeLead: `${size} / ${lead}`,
    tracking,
  };
}

function TypeRow({
  name,
  className,
  sample,
}: {
  name: string;
  className: string;
  sample: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [chips, setChips] = useState({
    family: "unset",
    sizeLead: "unset",
    tracking: "unset",
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
        name={name}
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
      id="ui-type"
      eyebrow={type.eyebrow}
      metric={type.metric}
      title={type.title}
      description={type.description}
    >
      <p className="type-body-sm text-muted mb-4 max-w-[688px]">
        type-* live in @layer components, so utilities override them.
      </p>
      <div className="min-w-0">
        {TYPE_CLASSES.map((className) => (
          <TypeRow
            key={className}
            name={`.${className}`}
            className={className}
            sample={SAMPLES[className]}
          />
        ))}
        <TypeRow
          name=".work-stat-figure"
          className="type-heading work-stat-figure"
          sample="48"
        />
      </div>
      <div className="border-border-ide mt-6 border-t pt-6">
        <MetricChips
          name=".article-copy"
          values={["h2 = .type-heading", "h3 = .type-subhead"]}
        />
        <div className="article-copy mt-4 max-w-[688px]">
          <h2>Article heading</h2>
          <h3>Article subhead</h3>
        </div>
      </div>
    </SpecSection>
  );
}
