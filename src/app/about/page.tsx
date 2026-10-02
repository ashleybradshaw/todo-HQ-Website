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
      title={about.hero.h1}
      lede={about.hero.p1}
    >
      <p className="type-body text-pretty">{about.hero.p2}</p>
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
