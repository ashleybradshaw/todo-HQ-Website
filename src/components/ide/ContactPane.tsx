import type { CSSProperties } from "react";
import Link from "next/link";

/** Test-copy contact — replace when marketing copy lands. */
const CONTACT_EMAIL = "team@todo.engineering";

function lineStyle(i: number): CSSProperties {
  return { "--i": i } as CSSProperties;
}

export function ContactPane() {
  return (
    <div className="font-jetbrains flex flex-col gap-6 px-4 py-4 text-xs leading-5 lg:text-sm lg:leading-6">
      <div className="space-y-1">
        <p className="ide-boot-line text-syn-comment italic" style={lineStyle(0)}>
          {"// contact.ts — TEST COPY"}
        </p>
        <p className="ide-boot-line text-syn-keyword" style={lineStyle(1)}>
          {"export const contact = {"}
        </p>
        <p className="ide-boot-line text-syn-property pl-4" style={lineStyle(2)}>
          getInTouch:{" "}
          <span className="text-syn-string">
            {'"Talk to the team behind //TODO."'}
          </span>
          ,
        </p>
        <p className="ide-boot-line text-syn-property pl-4" style={lineStyle(3)}>
          email:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-syn-string underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]"
          >
            {`"${CONTACT_EMAIL}"`}
          </a>
          ,
        </p>
        <p className="ide-boot-line text-syn-keyword" style={lineStyle(4)}>
          {"};"}
        </p>
      </div>

      <div className="ide-boot-line" style={lineStyle(5)}>
        <Link
          href="/book"
          className="font-jetbrains inline-flex min-h-11 items-center justify-center border border-border-ide bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-2 text-xs text-syn-keyword transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]"
        >
          Book Team →
        </Link>
      </div>
    </div>
  );
}
