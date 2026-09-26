"use client";

import {
  UI_DOCS_UPDATED,
  UI_DOCS_VERSION,
} from "@/lib/ui-docs/tokenRegistry";
import { UiSectionFrame } from "@/components/ui-docs/UiSectionFrame";

export function ReadmeSection() {
  return (
    <UiSectionFrame
      comment="// README — what this page is. TEST COPY."
      code={`# TODO UI ${UI_DOCS_VERSION}
Last updated: ${UI_DOCS_UPDATED}
// TEST COPY`}
      example={
        <div className="max-w-prose space-y-4">
          <p className="type-body text-foreground">
            {/* // TEST COPY */}
            TODO UI is the live design system for //TODO Engineering — colours,
            type, spacing, motion, icons, and components read from{" "}
            <code className="type-code">globals.css</code> and real imports so
            the docs cannot drift from the factory site.
          </p>
          <dl className="font-jetbrains type-meta text-muted grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt>version</dt>
            <dd className="text-foreground">{UI_DOCS_VERSION}</dd>
            <dt>updated</dt>
            <dd className="text-foreground">{UI_DOCS_UPDATED}</dd>
            <dt>note</dt>
            <dd className="text-syn-comment">{"// TEST COPY"}</dd>
          </dl>
        </div>
      }
    />
  );
}
