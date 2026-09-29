"use client";

import { DecodeLabel } from "@/components/DecodeLabel";
import { homePage } from "@/content/pages/home";

export type OutlineEntry = {
  id: string;
  title: string;
  line: number;
};

type IdeOutlineProps = {
  entries: readonly OutlineEntry[];
  activeId: string | null;
  labelPlayKey?: number;
};

/**
 * Quiet README outline — lg+ only (mobile pane collapses; links would miss lines).
 * Amber line numbers; accent on the section nearest the viewport centre.
 */
export function IdeOutline({
  entries,
  activeId,
  labelPlayKey = 0,
}: IdeOutlineProps) {
  const { outline } = homePage;

  return (
    <section
      className="border-border-ide hidden shrink-0 border-b px-3 py-2 lg:block"
      aria-label={outline.sectionAria}
      data-ide-outline
    >
      <p className="font-jetbrains text-muted mb-1.5 text-[10px] tracking-wide uppercase">
        <DecodeLabel
          text={outline.header}
          playKey={labelPlayKey}
          settleColor="var(--text-muted)"
        />
      </p>
      <ul className="font-jetbrains flex flex-col gap-0.5 text-[11px]">
        {entries.map((entry) => {
          const active = entry.id === activeId;
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                className={`flex items-baseline gap-2 rounded-[2px] px-0.5 py-0.5 transition-colors duration-[400ms] ease-in-out focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none ${
                  active
                    ? "text-foreground"
                    : "text-muted hover:text-syn-property"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="text-syn-number w-5 shrink-0 text-right tabular-nums"
                >
                  {entry.line}
                </span>
                <span className="min-w-0 truncate">
                  <span
                    aria-hidden="true"
                    className={active ? "text-foreground" : "text-syn-keyword"}
                  >
                    ##{" "}
                  </span>
                  {entry.title}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
