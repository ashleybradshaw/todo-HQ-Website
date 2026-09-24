import type { Metadata } from "next";
import { ClientStrip } from "@/components/about/ClientStrip";
import { OperatingRules } from "@/components/about/OperatingRules";
import { OriginStory } from "@/components/about/OriginStory";
import { BookFaq } from "@/components/book/BookFaq";
import { PageShell } from "@/components/PageShell";
import { SiteCloser } from "@/components/SiteCloser";
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
      titleClassName="type-display text-center text-balance tracking-tight"
      ledeClassName="text-center"
      lede={
        <>
          <p className="max-md:text-[14px] max-md:leading-5 max-md:tracking-tight">
            {aboutPage.lede[0]}
          </p>
          <p className="mt-4 max-md:mt-3 max-md:text-[14px] max-md:leading-5 max-md:tracking-tight">
            {aboutPage.lede[1]}
          </p>
        </>
      }
    >
      <ClientStrip />
      <OriginStory />
      <OperatingRules />
      <BookFaq ctaLabel="Book a call" ctaHref="/book#contact" />
      <SiteCloser variant="full" />
    </PageShell>
  );
}
