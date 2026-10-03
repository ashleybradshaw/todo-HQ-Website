import { DetailHero } from "@/components/detail/DetailHero";
import { IdeFrame } from "@/components/ide/IdeFrame";
import { SpecSection } from "@/components/ui-docs/spec/SpecSection";
import { UI_MEDIA_ROWS } from "@/components/ui-docs/spec/fixtures";
import { PlaceholderStill } from "@/components/work/PlaceholderStill";
import { ProjectMediaRows } from "@/components/work/ProjectMediaRows";
import { uiPage } from "@/content/pages/ui";

export function FramesMediaSpec() {
  const { frames } = uiPage.sections;

  return (
    <SpecSection
      id="ui-frames"
      eyebrow={frames.eyebrow}
      metric={frames.metric}
      title={frames.title}
      description={frames.description}
    >
      <div className="flex min-w-0 flex-col gap-10">
        <IdeFrame
          label="// specimen"
          meta="752 content"
          labelledBy="ui-frame-label"
        >
          <p className="type-body max-w-[688px]">
            Index body on the frame track.
          </p>
        </IdeFrame>

        <DetailHero
          src="/work/placeholders/landscape.svg"
          alt="Detail hero specimen"
          caption="752, 16:9"
        />

        <ProjectMediaRows rows={UI_MEDIA_ROWS} label="Specimen media" />

        <div>
          <p className="type-caption text-muted mb-4">
            688 article figure. The class is the one the blog renderer emits.
          </p>
          <figure className="blog-article-figure mx-auto w-full max-w-[688px]">
            <div className="relative aspect-video">
              <PlaceholderStill ratio="16:9" fit="slice" />
            </div>
          </figure>
        </div>
      </div>
    </SpecSection>
  );
}
