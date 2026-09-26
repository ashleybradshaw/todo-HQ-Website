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
      <div className="mt-16 flex justify-center border-t border-border-ide pt-12">
        <a
          href="/ui"
          className="font-jetbrains inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[4px] border border-current bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-2 text-xs font-bold tracking-wider text-on-tint transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]"
        >
          TODO UI
        </a>
      </div>
      <BookFaq ctaLabel="Send a brief" ctaHref="/book#brief" />
      <SiteCloser variant="full" />
    </PageShell>
  );
}
