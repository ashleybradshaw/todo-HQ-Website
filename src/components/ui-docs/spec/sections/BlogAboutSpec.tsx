"use client";

import { useState } from "react";
import { OperatingRules } from "@/components/about/OperatingRules";
import { SignalStrip } from "@/components/about/SignalStrip";
import { BlogAdjacentNav } from "@/components/blog/BlogAdjacentNav";
import { BlogFilterPills, type BlogFilterId } from "@/components/blog/BlogFilterPills";
import { BlogNoteCard } from "@/components/blog/BlogNoteCard";
import { BlogPollTile } from "@/components/blog/BlogPollTile";
import { BlogWriterBand } from "@/components/blog/BlogWriterBand";
import { SpecSection } from "@/components/ui-docs/spec/SpecSection";
import {
  UI_NEXT_POST,
  UI_NOTE,
  UI_POLL,
  UI_PREV_POST,
} from "@/components/ui-docs/spec/fixtures";
import { uiPage } from "@/content/pages/ui";

export function BlogAboutSpec() {
  const { blog } = uiPage.sections;
  const [filter, setFilter] = useState<BlogFilterId>("all");

  return (
    <SpecSection
      id="ui-blog"
      eyebrow={blog.eyebrow}
      metric={blog.metric}
      title={blog.title}
      description={blog.description}
    >
      <div className="flex min-w-0 flex-col gap-10">
        <BlogNoteCard post={UI_NOTE} prefetch={false} />
        <BlogFilterPills value={filter} onChange={setFilter} />
        <div>
          <p className="type-caption text-muted mb-4">
            Read only. Votes are not stored.
          </p>
          <BlogPollTile poll={UI_POLL} readOnly />
        </div>
        <BlogAdjacentNav prev={UI_PREV_POST} next={UI_NEXT_POST} prefetch={false} />
        <BlogWriterBand more={[UI_NEXT_POST]} prefetch={false} />
        <SignalStrip />
        <OperatingRules />
      </div>
    </SpecSection>
  );
}
