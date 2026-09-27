import type { Metadata } from "next";
import { ClientStrip } from "@/components/about/ClientStrip";
import { OperatingRules } from "@/components/about/OperatingRules";
import { OriginStory } from "@/components/about/OriginStory";
import { BookFaq } from "@/components/book/BookFaq";
import { PageShell } from "@/components/PageShell";
import { SiteCloser } from "@/components/SiteCloser";
import { about } from "@/content/pages/about";
import { ctas } from "@/content/pages/shared";
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
      titleClassName="type-display text-center text-balance tracking-tight"
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
      <div className="mt-16 flex justify-center border-t border-border-ide pt-12">
        <a
          href={about.operating.uiLink.href}
          className="font-jetbrains inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[4px] border border-current bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-2 text-xs font-bold tracking-wider text-on-tint transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]"
        >
          {about.operating.uiLink.label}
        </a>
      </div>
      <BookFaq ctaLabel={ctas.sendABrief} ctaHref={ctas.sendABriefHref} />
      <SiteCloser variant="full" />
    </PageShell>
  );
}
