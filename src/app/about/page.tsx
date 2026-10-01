import type { Metadata } from "next";
import { ClientStrip } from "@/components/about/ClientStrip";
import { OperatingRules } from "@/components/about/OperatingRules";
import { OriginStory } from "@/components/about/OriginStory";
import { UiSpecimenCard } from "@/components/ide/UiSpecimenCard";
import { PageShell } from "@/components/PageShell";
import { SiteCloser } from "@/components/SiteCloser";
import { about } from "@/content/pages/about";
import { pageMetadata } from "@/lib/seo";

const baseMetadata = pageMetadata({
  title: "About",
  description: about.seo.description,
  path: "/about",
});

export const metadata: Metadata = {
  ...baseMetadata,
  title: { absolute: about.seo.title },
  openGraph: baseMetadata.openGraph
    ? { ...baseMetadata.openGraph, title: about.seo.title }
    : undefined,
  twitter: baseMetadata.twitter
    ? { ...baseMetadata.twitter, title: about.seo.title }
    : undefined,
};

export default function AboutPage() {
  return (
    <PageShell
      variant="essay"
      eyebrow={about.hero.eyebrow}
      eyebrowClassName="text-center"
      title={about.hero.h1}
      titleClassName="type-display mx-auto max-w-none text-center text-balance tracking-tight"
      ledeClassName="text-center"
      lede={
        <>
          <p className="max-md:text-[14px] max-md:leading-5 max-md:tracking-tight">
            {about.hero.p1}
          </p>
          <p className="mt-4 max-md:mt-3 max-md:text-[14px] max-md:leading-5 max-md:tracking-tight">
            {about.hero.p2}
          </p>
        </>
      }
    >
      <ClientStrip />
      <OriginStory />
      <OperatingRules />
      <div className="mt-16 border-t border-border-ide pt-12">
        <UiSpecimenCard />
      </div>
      <SiteCloser route="about" />
    </PageShell>
  );
}
