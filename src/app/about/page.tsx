import type { Metadata } from "next";
import { ClientStrip } from "@/components/about/ClientStrip";
import { OperatingRules } from "@/components/about/OperatingRules";
import { OriginStory } from "@/components/about/OriginStory";
import { SignalStrip } from "@/components/about/SignalStrip";
import { WorkTogetherBand } from "@/components/about/WorkTogetherBand";
import { PageShell } from "@/components/PageShell";
import { aboutPage } from "@/content/pages/about";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: aboutPage.metaDescription,
  path: "/about",
});

export default function AboutPage() {
  return (
    <PageShell
      variant="essay"
      eyebrow={aboutPage.eyebrow}
      eyebrowClassName="text-center"
      title={aboutPage.title}
      titleClassName="type-title text-center text-balance tracking-tight"
      ledeClassName="text-center"
      lede={
        <>
          <p>{aboutPage.lede[0]}</p>
          <p className="mt-4">{aboutPage.lede[1]}</p>
        </>
      }
    >
      <ClientStrip />
      <OriginStory />
      <OperatingRules />
      <SignalStrip />
      <WorkTogetherBand />
    </PageShell>
  );
}
