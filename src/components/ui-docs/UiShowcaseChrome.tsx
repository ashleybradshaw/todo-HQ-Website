"use client";

import { TypeComment } from "@/components/TypeComment";
import { uiPage } from "@/content/pages/ui";

/** BlogIndex IDE frame + About-style display title. */
export function UiShowcaseHeader() {
  return (
    <section
      className="border border-border-ide"
      aria-labelledby="ui-heading"
    >
      <div className="flex items-center justify-between border-b border-border-ide px-6 py-2">
        <TypeComment
          text={uiPage.header.eyebrow}
          className="text-syn-keyword"
        />
        <p className="type-label text-syn-comment font-normal">
          {uiPage.header.barLabel}
        </p>
      </div>
      <div className="p-6 md:p-10">
        <h1
          id="ui-heading"
          className="type-display max-w-[18ch] tracking-tight text-balance"
        >
          {uiPage.header.title}
        </h1>
        <p className="type-body mt-6 max-w-[688px] text-foreground">
          {/* // TEST COPY */}
          {uiPage.header.subtitle}
        </p>
      </div>
    </section>
  );
}
