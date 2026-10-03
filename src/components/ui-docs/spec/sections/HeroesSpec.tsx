import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { NavTrailSpecimen } from "@/components/nav/NavTrailSpecimen";
import { PageHero } from "@/components/PageHero";
import { SpecSection } from "@/components/ui-docs/spec/SpecSection";
import { uiPage } from "@/content/pages/ui";

const LONG_CRUMB =
  "Specimen detail with a long title that truncates below sm and wraps from sm";

export function HeroesSpec() {
  const { heroes } = uiPage.sections;

  return (
    <SpecSection
      id="ui-heroes"
      eyebrow={heroes.eyebrow}
      metric={heroes.metric}
      title={heroes.title}
      description={heroes.description}
    >
      <div className="flex min-w-0 flex-col gap-10">
        <div>
          <p className="type-caption text-muted mb-4">{"// essay, max 688"}</p>
          <PageHero
            headingLevel="h3"
            className="mx-auto w-full max-w-[688px]"
            eyebrow="// essay"
            title="Essay hero"
            lede="Sits on the 688 column."
          />
        </div>

        <div>
          <p className="type-caption text-muted mb-4">{"// frame"}</p>
          <PageHero
            headingLevel="h3"
            eyebrow="// frame"
            title="Frame hero"
            lede="Centred on the 1336 frame."
          />
        </div>

        <div>
          <p className="type-caption text-muted mb-4">
            Below sm the current crumb truncates. From sm it wraps.
          </p>
          <DetailHeader
            headingLevel="h3"
            title="Detail header"
            meta={<p>Sample meta</p>}
            breadcrumbs={
              <Breadcrumbs
                parent={{ href: "/work", label: "Work" }}
                current={LONG_CRUMB}
              />
            }
          />
        </div>

        <div>
          <p className="type-caption text-muted mb-4">
            Static sample of the nav crumb and progress rule. The site nav on
            this page stays the UI nav.
          </p>
          <NavTrailSpecimen />
        </div>
      </div>
    </SpecSection>
  );
}
