"use client";

import {
  UI_DOCS_UPDATED,
  UI_DOCS_VERSION,
} from "@/lib/ui-docs/tokenRegistry";
import { UiSectionFrame } from "@/components/ui-docs/UiSectionFrame";
import { uiPage } from "@/content/pages/ui";

export function ReadmeSection() {
  return (
    <UiSectionFrame
      comment={uiPage.readme.comment}
      code={`# TODO UI ${UI_DOCS_VERSION}
Last updated: ${UI_DOCS_UPDATED}
// TEST COPY`}
      example={
        <div className="max-w-prose space-y-4">
          <p className="type-body text-foreground">
            {/* // TEST COPY */}
            {uiPage.readme.bodyLead}{" "}
            <code className="type-code">{uiPage.readme.bodyCode}</code>{" "}
            {uiPage.readme.bodyTrail}
          </p>
          <dl className="font-jetbrains type-meta text-muted grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt>version</dt>
            <dd className="text-foreground">{UI_DOCS_VERSION}</dd>
            <dt>updated</dt>
            <dd className="text-foreground">{UI_DOCS_UPDATED}</dd>
            <dt>note</dt>
            <dd className="text-syn-comment">{uiPage.readme.note}</dd>
          </dl>
        </div>
      }
    />
  );
}
